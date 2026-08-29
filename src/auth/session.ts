import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '../prisma/db.ts';

/**
 * Sessions applicatives.
 *
 * Le jeton n'est jamais stocké : la base ne conserve que son empreinte SHA-256.
 * Aucune donnée utilisateur n'est recopiée — `role` et `actif` sont relus dans
 * `public.utilisateurs` à chaque requête, ce qui fait de l'outil de facturation
 * l'unique source de vérité et coupe l'accès dès qu'un compte est désactivé.
 */

export const NOM_COOKIE = 'youlive_avis_session';

/** Durée glissante : le conseiller travaille sur le terrain, chez ses clients. */
const DUREE_MS = 30 * 24 * 60 * 60 * 1000;
/** Sans « Se souvenir de moi » : la session meurt avec le navigateur. */
const DUREE_COURTE_MS = 12 * 60 * 60 * 1000;
/** En deçà, on ne réécrit pas la session à chaque requête. */
const SEUIL_PROLONGATION_MS = 24 * 60 * 60 * 1000;

export type Conseiller = {
  idapimo: number;
  prenom: string | null;
  nom: string | null;
  nomComplet: string;
  email: string | null;
  telephone: string | null;
  mobile: string | null;
  siren: string | null;
  estAdministrateur: boolean;
};

function empreinte(jeton: string): string {
  return createHash('sha256').update(jeton, 'utf8').digest('hex');
}

export async function ouvrirSession(
  idapimo: number,
  contexte: {
    userAgent?: string | null;
    ip?: string | null;
    seSouvenir?: boolean;
  } = {},
): Promise<void> {
  const jeton = randomBytes(32).toString('base64url');
  const seSouvenir = contexte.seSouvenir ?? true;
  const duree = seSouvenir ? DUREE_MS : DUREE_COURTE_MS;

  await db.orm.avis_de_valeur.Session.create({
    tokenHash: empreinte(jeton),
    conseillerIdapimo: idapimo,
    expireLe: new Date(Date.now() + duree).toISOString(),
    userAgent: contexte.userAgent?.slice(0, 500) ?? null,
    ip: contexte.ip ?? null,
  });

  const boite = await cookies();
  boite.set(NOM_COOKIE, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Sans « Se souvenir de moi », pas de maxAge : cookie de session.
    ...(seSouvenir ? { maxAge: duree / 1000 } : {}),
  });
}

export async function fermerSession(): Promise<void> {
  const boite = await cookies();
  const jeton = boite.get(NOM_COOKIE)?.value;

  if (jeton) {
    await db.orm.avis_de_valeur.Session
      .where({ tokenHash: empreinte(jeton) })
      .delete();
  }

  boite.delete(NOM_COOKIE);
}

export async function conseillerConnecte(): Promise<Conseiller | null> {
  const boite = await cookies();
  const jeton = boite.get(NOM_COOKIE)?.value;
  if (!jeton) return null;

  const session = await db.orm.avis_de_valeur.Session
    .where({ tokenHash: empreinte(jeton) })
    .first();
  if (!session) return null;

  const expiration = new Date(session.expireLe).getTime();
  if (!Number.isFinite(expiration) || expiration <= Date.now()) {
    await db.orm.avis_de_valeur.Session.where({ id: session.id }).delete();
    return null;
  }

  const utilisateur = await db.orm.public.Utilisateur
    .where({ idapimo: session.conseillerIdapimo })
    .first();
  if (!utilisateur || !utilisateur.actif) return null;

  // Prolongation glissante, écrite au plus une fois par jour.
  if (Date.now() - new Date(session.vuLe).getTime() > SEUIL_PROLONGATION_MS) {
    const maintenant = new Date();
    await db.orm.avis_de_valeur.Session.where({ id: session.id }).update({
      vuLe: maintenant.toISOString(),
      expireLe: new Date(maintenant.getTime() + DUREE_MS).toISOString(),
    });
  }

  const prenom = utilisateur.prenom?.trim() || null;
  const nom = utilisateur.nom?.trim() || null;

  return {
    idapimo: utilisateur.idapimo,
    prenom,
    nom,
    nomComplet: [prenom, nom].filter(Boolean).join(' ') || 'Conseiller',
    email: utilisateur.email?.trim() || null,
    telephone: utilisateur.telephone?.trim() || null,
    mobile: utilisateur.mobile?.trim() || null,
    siren: utilisateur.siren?.trim() || null,
    estAdministrateur: utilisateur.role?.trim().toLowerCase() === 'admin',
  };
}

/** À utiliser dans toute page ou route qui exige une session. */
export async function exigerConseiller(): Promise<Conseiller> {
  const conseiller = await conseillerConnecte();
  if (!conseiller) throw new Error('NON_AUTHENTIFIE');
  return conseiller;
}

/**
 * À utiliser sur `/administration/*` ET sur chaque route d'API correspondante :
 * le handoff impose de protéger la route, pas seulement de masquer le lien.
 */
export async function exigerAdministrateur(): Promise<Conseiller> {
  const conseiller = await exigerConseiller();
  if (!conseiller.estAdministrateur) throw new Error('ACCES_REFUSE');
  return conseiller;
}
