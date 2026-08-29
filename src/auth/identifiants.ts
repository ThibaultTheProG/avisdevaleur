import bcrypt from 'bcryptjs';
import { db } from '../prisma/db.ts';

/**
 * Vérification des identifiants contre `public.utilisateurs`, la table de
 * l'outil de facturation. Cette application ne crée, ne modifie et n'efface
 * jamais un utilisateur : le rôle PostgreSQL `avisdevaleur_app` n'a que le
 * SELECT sur cette table, et rien d'autre dans le schéma `public`.
 */

const FENETRE_MS = 15 * 60 * 1000;
const MAX_ECHECS = 10;

/**
 * Hash bcrypt valide ne correspondant à aucun mot de passe. Comparé lorsque
 * l'email est inconnu, pour que le temps de réponse ne révèle pas l'existence
 * d'un compte.
 */
const HASH_FACTICE = '$2b$10$/Kb0G06r8rCuAv5z.h6Fp.pGvj6LM/q3Edp6s1NgRfHefWV68hlRW';

export type EchecConnexion = 'identifiants' | 'trop_de_tentatives';

export type ResultatConnexion =
  | { ok: true; idapimo: number }
  | { ok: false; raison: EchecConnexion };

/** Neutralise les jokers LIKE (`%`, `_`, `\`) avant un ILIKE. */
function echapperLike(valeur: string): string {
  return valeur.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function verifierIdentifiants(
  email: string,
  motDePasse: string,
  ip: string | null,
): Promise<ResultatConnexion> {
  const emailNormalise = email.trim().toLowerCase();
  const depuis = new Date(Date.now() - FENETRE_MS).toISOString();

  // On ne lit que MAX_ECHECS lignes : la question est « le seuil est-il
  // atteint ? », pas « combien exactement ».
  const echecsRecents = await db.orm.avis_de_valeur.TentativeConnexion
    .where((t) => t.email.eq(emailNormalise))
    .where((t) => t.reussie.eq(false))
    .where((t) => t.creeLe.gte(depuis))
    .select('id')
    .take(MAX_ECHECS)
    .all();

  if (echecsRecents.length >= MAX_ECHECS) {
    return { ok: false, raison: 'trop_de_tentatives' };
  }

  // `email` n'a ni contrainte d'unicité ni index fonctionnel côté facturation :
  // on compare sans tenir compte de la casse, puis on revérifie l'égalité exacte
  // en mémoire pour ne jamais accepter une correspondance approximative.
  const candidats = await db.orm.public.Utilisateur
    .where((u) => u.email.ilike(echapperLike(emailNormalise)))
    .all();

  const utilisateur = candidats.find(
    (u) => u.email?.trim().toLowerCase() === emailNormalise,
  );

  const hash = utilisateur?.motDePasse?.trim();
  const correspond = await bcrypt.compare(motDePasse, hash || HASH_FACTICE);

  // Un compte désactivé ou sans mot de passe ne se connecte pas, même si le
  // hash correspondait.
  const reussie = Boolean(correspond && hash && utilisateur?.actif);

  await db.orm.avis_de_valeur.TentativeConnexion.create({
    email: emailNormalise,
    ip,
    reussie,
  });

  if (!reussie || !utilisateur) return { ok: false, raison: 'identifiants' };
  return { ok: true, idapimo: utilisateur.idapimo };
}
