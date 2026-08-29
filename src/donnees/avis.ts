import { calculerAvis } from '../calcul/calculer.ts';
import type {
  AvisDraft,
  Categorie,
  CranTendance,
  LettreDpe,
  LigneSaisie,
  Referentiel,
  TypeBien,
} from '../calcul/types.ts';
import { tousLesCriteres } from '../calcul/catalogue.ts';
import { db } from '../prisma/db.ts';

/**
 * Accès aux avis de valeur. Seul endroit du code qui parle à `db.orm` pour
 * cette entité.
 *
 * **Chaque fonction filtre sur `conseillerIdapimo`** : un conseiller ne voit
 * que ses avis, et ce contrôle est fait côté serveur, jamais déduit de l'URL.
 */

/** Les colonnes `numeric` transitent en chaîne décimale : on convertit ici. */
function nombre(valeur: unknown): number | null {
  if (valeur === null || valeur === undefined) return null;
  const n = typeof valeur === 'number' ? valeur : Number(valeur);
  return Number.isFinite(n) ? n : null;
}

/** Inverse : vers la chaîne décimale attendue en écriture. */
function decimal(valeur: number | null | undefined): string | null {
  return valeur === null || valeur === undefined || !Number.isFinite(valeur)
    ? null
    : String(valeur);
}

export type Statut = 'brouillon' | 'enregistre';

export type AvisComplet = {
  id: string;
  statut: Statut;
  type: TypeBien;
  client: { nom: string | null; telephone: string | null; email: string | null };
  bien: { adresse: string | null; codePostal: string | null; ville: string | null };
  referentielVersionId: string;
  creeLe: string;
  modifieLe: string;
  /** Figées à l'enregistrement ; nulles tant que l'avis est un brouillon. */
  valeurIntrinsequeFigee: number | null;
  valeurRetenueFigee: number | null;
  draft: AvisDraft;
};

export type AvisResume = {
  id: string;
  statut: Statut;
  type: TypeBien;
  clientNom: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  modifieLe: string;
  valeurRetenue: number | null;
};

type LigneEnBase = {
  cle: string;
  categorie: Categorie;
  active: boolean;
  surface: unknown;
  pourcentage: unknown;
  coutM2: unknown;
  montant: unknown;
  option: string | null;
};

function draftDepuisLignes(
  type: TypeBien,
  avis: {
    surfaceHabitable: unknown;
    prixM2: unknown;
    surfaceMedianeQuartier: unknown;
    dpe: LettreDpe | null;
    tendanceCran: CranTendance;
    tendancePourcentage: unknown;
  },
  lignes: LigneEnBase[],
): AvisDraft {
  const parCle: Record<string, LigneSaisie> = {};
  for (const ligne of lignes) {
    parCle[ligne.cle] = {
      active: ligne.active,
      surface: nombre(ligne.surface),
      pourcentage: nombre(ligne.pourcentage),
      coutM2: nombre(ligne.coutM2),
      montant: nombre(ligne.montant),
      option: ligne.option,
    };
  }
  return {
    type,
    surfaceHabitable: nombre(avis.surfaceHabitable),
    prixM2: nombre(avis.prixM2),
    surfaceMedianeQuartier: nombre(avis.surfaceMedianeQuartier),
    dpe: avis.dpe,
    tendanceCran: avis.tendanceCran,
    tendancePourcentage: nombre(avis.tendancePourcentage) ?? 0,
    lignes: parCle,
  };
}

export async function listerAvis(conseillerIdapimo: number): Promise<AvisResume[]> {
  const lignes = await db.orm.avis_de_valeur.AvisDeValeur
    .where((a) => a.conseillerIdapimo.eq(conseillerIdapimo))
    .where((a) => a.supprimeLe.isNull())
    .orderBy((a) => a.modifieLe.desc())
    .all();

  return lignes.map((a) => ({
    id: a.id,
    statut: a.statut as Statut,
    type: a.type as TypeBien,
    clientNom: a.clientNom,
    adresse: a.adresse,
    codePostal: a.codePostal,
    ville: a.ville,
    modifieLe: a.modifieLe,
    // Un brouillon n'a pas de valeur figée : la liste affiche « — ».
    valeurRetenue: nombre(a.valeurRetenue),
  }));
}

export async function chargerAvis(
  id: string,
  conseillerIdapimo: number,
): Promise<AvisComplet | null> {
  const avis = await db.orm.avis_de_valeur.AvisDeValeur
    .where((a) => a.id.eq(id))
    .where((a) => a.conseillerIdapimo.eq(conseillerIdapimo))
    .where((a) => a.supprimeLe.isNull())
    .first();
  if (!avis) return null;

  const lignes = await db.orm.avis_de_valeur.LigneAvis
    .where((l) => l.avisId.eq(id))
    .all();

  const type = avis.type as TypeBien;
  return {
    id: avis.id,
    statut: avis.statut as Statut,
    type,
    client: {
      nom: avis.clientNom,
      telephone: avis.clientTelephone,
      email: avis.clientEmail,
    },
    bien: { adresse: avis.adresse, codePostal: avis.codePostal, ville: avis.ville },
    referentielVersionId: avis.referentielVersionId,
    creeLe: avis.creeLe,
    modifieLe: avis.modifieLe,
    valeurIntrinsequeFigee: nombre(avis.valeurIntrinseque),
    valeurRetenueFigee: nombre(avis.valeurRetenue),
    draft: draftDepuisLignes(type, avis, lignes as unknown as LigneEnBase[]),
  };
}

export async function creerBrouillon(
  conseillerIdapimo: number,
  type: TypeBien,
  referentiel: { id: string; contenu: Referentiel },
): Promise<string> {
  const avis = await db.orm.avis_de_valeur.AvisDeValeur.create({
    conseillerIdapimo,
    type,
    statut: 'brouillon',
    // Pré-remplie depuis le référentiel, éditable ensuite par le conseiller.
    surfaceMedianeQuartier: decimal(referentiel.contenu.surfaceMediane[type]),
    tendanceCran: 'equilibre',
    tendancePourcentage: '0',
    referentielVersionId: referentiel.id,
  });
  return avis.id;
}

/** Champs d'identité et de bien (étape 1). */
export type EntetesAvis = {
  clientNom?: string | null;
  clientTelephone?: string | null;
  clientEmail?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
};

/**
 * Écrit l'état courant du brouillon. Appelée à chaque changement d'étape.
 * Réécrit les lignes du catalogue en bloc : leur nombre est borné (17 ou 18).
 */
export async function enregistrerBrouillon(
  id: string,
  conseillerIdapimo: number,
  draft: AvisDraft,
  entetes: EntetesAvis,
): Promise<boolean> {
  const existant = await db.orm.avis_de_valeur.AvisDeValeur
    .where((a) => a.id.eq(id))
    .where((a) => a.conseillerIdapimo.eq(conseillerIdapimo))
    .where((a) => a.supprimeLe.isNull())
    .select('id')
    .first();
  if (!existant) return false;

  await db.orm.avis_de_valeur.AvisDeValeur.where({ id }).update({
    ...entetes,
    surfaceHabitable: decimal(draft.surfaceHabitable),
    prixM2: decimal(draft.prixM2),
    surfaceMedianeQuartier: decimal(draft.surfaceMedianeQuartier),
    dpe: draft.dpe ?? null,
    tendanceCran: draft.tendanceCran,
    tendancePourcentage: decimal(draft.tendancePourcentage) ?? '0',
    modifieLe: new Date().toISOString(),
  });

  // `db.orm…delete()` ne supprime QU'UNE ligne et la retourne : pour vider les
  // lignes d'un avis il faut le constructeur SQL, qui émet un vrai DELETE … WHERE.
  await db.runtime().execute(
    db.sql.avis_de_valeur.ligne_avis
      .delete()
      .where((champ, fns) => fns.eq(champ.avis_id, id))
      .build(),
  );

  for (const { critere, categorie } of tousLesCriteres(draft.type)) {
    const saisie = draft.lignes[critere.cle];
    if (!saisie) continue;
    await db.orm.avis_de_valeur.LigneAvis.create({
      avisId: id,
      categorie,
      cle: critere.cle,
      active: saisie.active,
      kind: critere.kind,
      surface: decimal(saisie.surface),
      pourcentage: decimal(saisie.pourcentage),
      coutM2: decimal(saisie.coutM2),
      montant: decimal(saisie.montant),
      option: saisie.option ?? null,
    });
  }

  return true;
}

/**
 * Enregistrement définitif : fige `valeurIntrinseque` et `valeurRetenue`, et
 * rattache l'avis à la version du référentiel qui les a produites. Une
 * modification ultérieure du référentiel ne réécrit donc jamais ces montants.
 */
export async function enregistrerAvis(
  id: string,
  conseillerIdapimo: number,
  draft: AvisDraft,
  entetes: EntetesAvis,
  referentiel: { id: string; contenu: Referentiel },
): Promise<boolean> {
  const ok = await enregistrerBrouillon(id, conseillerIdapimo, draft, entetes);
  if (!ok) return false;

  const resultat = calculerAvis(draft, referentiel.contenu);

  await db.orm.avis_de_valeur.AvisDeValeur.where({ id }).update({
    statut: 'enregistre',
    valeurIntrinseque: decimal(resultat.valeurIntrinseque),
    valeurRetenue: decimal(resultat.valeurRetenue),
    referentielVersionId: referentiel.id,
    modifieLe: new Date().toISOString(),
  });

  return true;
}

/** Suppression logique : un document remis à un client ne disparaît pas. */
export async function supprimerAvis(
  id: string,
  conseillerIdapimo: number,
): Promise<boolean> {
  const existant = await db.orm.avis_de_valeur.AvisDeValeur
    .where((a) => a.id.eq(id))
    .where((a) => a.conseillerIdapimo.eq(conseillerIdapimo))
    .where((a) => a.supprimeLe.isNull())
    .select('id')
    .first();
  if (!existant) return false;

  await db.orm.avis_de_valeur.AvisDeValeur
    .where({ id })
    .update({ supprimeLe: new Date().toISOString() });
  return true;
}
