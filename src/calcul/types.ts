/** Types du domaine, alignés sur design_handoff_avis_de_valeur/REGLES_DE_CALCUL.md. */

export type TypeBien = 'maison' | 'appartement';
export type LettreDpe = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
/** Les sept lettres, dans l'ordre officiel. Déclarées avec le type pour
 *  qu'aucune liste parallèle ne puisse s'en écarter. */
export const LETTRES_DPE: readonly LettreDpe[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export type CranTendance = 'haussier' | 'equilibre' | 'baissier';
export type Categorie = 'majoration' | 'minoration';

export type KindCritere =
  | 'surface'
  | 'pourcentage'
  | 'coutM2'
  | 'montant'
  | 'options'
  | 'interrupteur';

export type BaremeDpe = Record<LettreDpe, number>;

export type Referentiel = {
  surfaceMediane: Record<TypeBien, number>;
  tauxDecoteGrandeSurface: number;
  tauxSurface: { veranda: number; annexe: number };
  coutM2: { rafraichissement: number; renovation: number };
  dpe: Record<TypeBien, BaremeDpe>;
  plafonds: {
    vue: number;
    nuisance: number;
    terrainPaysage: number;
    malAgence: number;
    terrasse: number;
  };
  tendance: Record<CranTendance, number>;
  /**
   * Taux cités dans les formules du handoff sans figurer dans son type
   * `Referentiel`. Logés ici plutôt qu'en dur : ils restent administrables.
   */
  tauxOptions: {
    souplex: number;
    sousSol: number;
    etages: Record<string, number>;
    ascenseur: Record<string, number>;
  };
};

/** Valeurs saisies pour une ligne de critère. Conservées même ligne désactivée. */
export type LigneSaisie = {
  active: boolean;
  surface?: number | null;
  pourcentage?: number | null;
  coutM2?: number | null;
  montant?: number | null;
  option?: string | null;
};

export type AvisDraft = {
  type: TypeBien;
  surfaceHabitable?: number | null;
  prixM2?: number | null;
  surfaceMedianeQuartier?: number | null;
  dpe?: LettreDpe | null;
  tendanceCran: CranTendance;
  tendancePourcentage: number;
  /** Indexé par `cle` de critère (voir catalogue.ts). */
  lignes: Record<string, LigneSaisie>;
};

export type Contribution = {
  cle: string;
  libelle: string;
  categorie: Categorie;
  /** Toujours positif : le sens est porté par `categorie`. */
  montant: number;
  /** Renseigné quand la saisie a été ramenée au plafond du référentiel. */
  plafonnee?: boolean;
};

export type Resultat = {
  /** null tant que surface habitable et prix au m² ne sont pas tous deux saisis. */
  prixReference: number | null;
  detailDecote: {
    valeurDeBase: number;
    surfaceExcedent: number;
    decoteSurface: number;
  } | null;
  contributionDpe: number;
  contributions: Contribution[];
  totalMajorations: number;
  totalMinorations: number;
  valeurIntrinseque: number | null;
  valeurRetenue: number | null;
};
