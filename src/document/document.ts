/**
 * Vue-modèle du document client « Avis de valeur » (écran 8, bloc `1o`).
 *
 * Fonction pure : elle met en forme, avec `formater.ts`, les valeurs **figées**
 * de l'avis. Elle ne recalcule rien — le rapprochement avec `calculerAvis` est
 * fait par les tests, pas au rendu.
 */

import {
  dateCourte,
  dateLongue,
  euros,
  metresCarres,
} from '../calcul/formater.ts';
import type { CranTendance, LettreDpe, TypeBien } from '../calcul/types.ts';
import { SOCIETE } from './societe.ts';

const LIBELLE_TENDANCE: Record<CranTendance, string> = {
  haussier: 'Marché haussier',
  equilibre: 'Marché équilibré',
  baissier: 'Marché baissier',
};

const TITRE_BIEN: Record<TypeBien, string> = {
  maison: "Maison d'habitation",
  appartement: 'Appartement',
};

export type EntreeDocument = {
  type: TypeBien;
  client: { nom: string | null; telephone: string | null; email: string | null };
  bien: { adresse: string | null; codePostal: string | null; ville: string | null };
  surfaceHabitable: number | null;
  prixM2: number | null;
  dpe: LettreDpe | null;
  tendanceCran: CranTendance;
  /** Date d'établissement = dernière modification de l'avis. */
  etabliLe: string;
  /** Montants figés à l'enregistrement. */
  valeurRetenue: number | null;
  valeurIntrinseque: number | null;
  conseiller: {
    nomComplet: string;
    telephone: string | null;
    email: string | null;
    /**
     * `utilisateurs.siren`, texte libre et hétérogène, **jamais parsé en
     * nombre** (voir `contrat/UTILISATEURS.md` § siren). Imprimé tel quel.
     */
    siren: string | null;
  };
};

export type LigneCaracteristique = {
  libelle: string;
  /** `null` → « — ». Ignoré pour la ligne DPE, qui porte `dpe`. */
  valeur: string | null;
  dpe?: LettreDpe | null;
};

export type DonneesDocument = {
  surTitre: string;
  titre: string;
  etabliLe: string;
  demandeur: { nom: string; contact: string[] };
  bien: { titre: string; lignes: string[] };
  caracteristiques: LigneCaracteristique[];
  legende: string;
  valeurRetenue: string;
  conseiller: { titre: string; nom: string; contact: string[] };
  signature: string;
  mentionJuridique: string;
  ligneLegale: string;
  pagination: string;
  societe: { raisonSociale: string; adresse: string; contact: string };
};

/**
 * Un SIREN/RSAC exploitable, ou `null`. Les valeurs relevées « 0 » et « 1 »
 * (contrat UTILISATEURS.md) ne sont pas des identifiants : on n'imprime pas de
 * ligne RSAC dans ce cas plutôt qu'un « RSAC 0 » trompeur.
 */
export function rsacAffichable(siren: string | null | undefined): string | null {
  const valeur = siren?.trim();
  if (!valeur || valeur === '0' || valeur === '1') return null;
  return valeur;
}

export function donneesDocument(entree: EntreeDocument): DonneesDocument {
  const rsac = rsacAffichable(entree.conseiller.siren);

  return {
    surTitre: 'DOCUMENT REMIS AU CLIENT',
    titre: 'Avis de valeur',
    etabliLe: `Établi le ${dateLongue(entree.etabliLe)} ${SOCIETE.lieu}`,

    demandeur: {
      nom: entree.client.nom?.trim() || 'Demandeur non renseigné',
      contact: [entree.client.telephone, entree.client.email]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v)),
    },

    bien: {
      titre: TITRE_BIEN[entree.type],
      lignes: [
        entree.bien.adresse,
        [entree.bien.codePostal, entree.bien.ville].filter(Boolean).join(' '),
      ]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v)),
    },

    caracteristiques: [
      { libelle: 'Surface habitable', valeur: metresCarres(entree.surfaceHabitable) },
      { libelle: 'Prix au m² médian du quartier', valeur: euros(entree.prixM2) },
      { libelle: 'Diagnostic de performance énergétique', valeur: null, dpe: entree.dpe },
      { libelle: 'Tendance du marché local', valeur: LIBELLE_TENDANCE[entree.tendanceCran] },
    ],

    legende: 'Valeur de présentation à la vente retenue pour ce bien',
    valeurRetenue: euros(entree.valeurRetenue),

    conseiller: {
      titre: 'VOTRE CONSEILLER',
      nom: entree.conseiller.nomComplet,
      contact: [
        entree.conseiller.telephone,
        entree.conseiller.email,
        rsac ? `RSAC ${rsac}` : null,
      ]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v)),
    },

    signature: `Fait ${SOCIETE.lieu}, le ${dateCourte(entree.etabliLe)}`,
    mentionJuridique: SOCIETE.mentionJuridique,
    ligneLegale: SOCIETE.ligneLegale,
    pagination: 'Page 1 / 1',
    societe: {
      raisonSociale: SOCIETE.raisonSociale,
      adresse: SOCIETE.adresse,
      contact: SOCIETE.contact,
    },
  };
}
