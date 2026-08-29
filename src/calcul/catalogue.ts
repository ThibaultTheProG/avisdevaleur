import type { Categorie, KindCritere, Referentiel, TypeBien } from './types.ts';

/**
 * Catalogue des critères de majoration et de minoration.
 *
 * Source unique : le formulaire dessine ses lignes à partir d'ici, le
 * calculateur y lit la formule, le document y lit les libellés. Les décrire
 * trois fois garantirait la divergence.
 *
 * Libellés et textes d'aide repris mot pour mot de la maquette (Canvas.dc.html).
 * Les textes d'aide sont du **contenu métier** : toujours affichés, jamais
 * derrière une infobulle seule.
 *
 * Règle sur les taux : tout ce que l'écran 9 administre (taux de surface, coûts
 * au m², plafonds, barèmes) est lu dans le référentiel via `tauxRef`, `coutM2Ref`
 * ou `plafond`. Seuls les taux fixes déjà inscrits dans le libellé visible
 * (« · +5 % », « · −10 % ») sont littéraux ici : les changer changerait le
 * libellé, donc le code, de toute façon.
 */

export type OptionCritere = {
  valeur: string;
  libelle: string;
  /** Toujours positif : le sens vient de la catégorie de la ligne. */
  taux: number;
};

export type Critere = {
  cle: string;
  libelle: string;
  aide?: string;
  kind: KindCritere;
  /** `interrupteur` : taux fixe, écrit dans le libellé. */
  taux?: number;
  /** `surface` : clé du taux dans `referentiel.tauxSurface`. */
  tauxRef?: keyof Referentiel['tauxSurface'];
  /** `coutM2` : clé du coût par défaut dans `referentiel.coutM2`. */
  coutM2Ref?: keyof Referentiel['coutM2'];
  /** `pourcentage` : clé du plafond dans `referentiel.plafonds`. */
  plafond?: keyof Referentiel['plafonds'];
  /** `pourcentage` : borne basse proposée par le curseur (indicatif). */
  plancher?: number;
  /** `options`, ou `surface` dont le taux dépend de l'option choisie. */
  options?: OptionCritere[];
};

const VERANDA: Critere = {
  cle: 'veranda',
  libelle: 'Véranda ou loggia habitable / chauffée',
  kind: 'surface',
  tauxRef: 'veranda',
};

const ANNEXE: Critere = {
  cle: 'annexe',
  libelle: 'Surface annexe, cave ou cellier',
  kind: 'surface',
  tauxRef: 'annexe',
};

const VUE: Critere = {
  cle: 'vue',
  libelle: 'Vue',
  aide: 'monument, dégagée, mer, montagne · jusqu’à 30 %',
  kind: 'pourcentage',
  plafond: 'vue',
};

const ORIENTATION_SUD: Critere = {
  cle: 'orientationSud',
  libelle: 'Orientation séjour agréable (Sud) · +5 %',
  aide: 'sauf si le bien est dans le quart sud de la France',
  kind: 'interrupteur',
  taux: 0.05,
};

const TRAVAUX_RECENTS: Critere = {
  cle: 'travauxRecents',
  libelle: 'Travaux de moins de 10 ans',
  aide: '50 % du montant des factures · hors travaux d’isolation',
  kind: 'montant',
};

const RAFRAICHISSEMENT: Critere = {
  cle: 'rafraichissement',
  libelle: 'Rafraîchissement',
  kind: 'coutM2',
  coutM2Ref: 'rafraichissement',
};

const TRAVAUX_COMPLEMENTAIRES: Critere = {
  cle: 'travauxComplementaires',
  libelle: 'Travaux complémentaires',
  kind: 'montant',
};

const NUISANCE: Critere = {
  cle: 'nuisance',
  libelle: 'Nuisance ou risque',
  aide: 'jusqu’à 30 %',
  kind: 'pourcentage',
  plafond: 'nuisance',
};

// ─── Maison ───────────────────────────────────────────────────────────────

export const MAJORATIONS_MAISON: Critere[] = [
  VERANDA,
  ANNEXE,
  VUE,
  ORIENTATION_SUD,
  TRAVAUX_RECENTS,
  {
    cle: 'plainPied',
    libelle: 'Plain-pied · +5 %',
    aide: 'sauf si la majorité des biens proches sont de plain-pied',
    kind: 'interrupteur',
    taux: 0.05,
  },
  {
    cle: 'nonMitoyen',
    libelle: 'Non mitoyen et hors limite de propriété · +5 %',
    aide: 'sauf si la majorité des biens proches le sont aussi',
    kind: 'interrupteur',
    taux: 0.05,
  },
  {
    cle: 'terrainPaysage',
    libelle: 'Terrain paysagé, terrasse de qualité, clôturé',
    aide: 'ajustable de 5 à 10 %',
    kind: 'pourcentage',
    plafond: 'terrainPaysage',
    plancher: 0.05,
  },
];

export const MINORATIONS_MAISON: Critere[] = [
  {
    cle: 'etages',
    libelle: 'Étages',
    kind: 'options',
    options: [
      { valeur: 'R+2', libelle: 'R+2 · −5 %', taux: 0.05 },
      { valeur: 'R+3', libelle: 'R+3 · −10 %', taux: 0.1 },
    ],
  },
  {
    cle: 'mitoyenDeuxCotes',
    libelle: 'Mitoyen des 2 côtés · −5 %',
    kind: 'interrupteur',
    taux: 0.05,
  },
  RAFRAICHISSEMENT,
  {
    cle: 'renovation',
    libelle: 'Rénovation complète',
    kind: 'coutM2',
    coutM2Ref: 'renovation',
  },
  TRAVAUX_COMPLEMENTAIRES,
  {
    cle: 'malAgence',
    libelle: 'Mal agencé',
    aide: 'ajustable de 5 à 10 %',
    kind: 'pourcentage',
    plafond: 'malAgence',
    plancher: 0.05,
  },
  NUISANCE,
  {
    cle: 'sansTerrain',
    libelle: 'Pas de terrain ni jardin · −10 %',
    kind: 'interrupteur',
    taux: 0.1,
  },
  {
    cle: 'sansGarage',
    libelle: 'Pas de garage ni stationnement · −5 %',
    kind: 'interrupteur',
    taux: 0.05,
  },
];

// ─── Appartement ──────────────────────────────────────────────────────────

export const MAJORATIONS_APPARTEMENT: Critere[] = [
  VERANDA,
  ANNEXE,
  VUE,
  ORIENTATION_SUD,
  TRAVAUX_RECENTS,
  {
    cle: 'terrasse',
    libelle: 'Superbe terrasse',
    aide: 'jusqu’à +15 %',
    kind: 'pourcentage',
    plafond: 'terrasse',
  },
  {
    cle: 'partiesCommunesHautDeGamme',
    libelle: 'Parties communes haut de gamme · +5 %',
    kind: 'interrupteur',
    taux: 0.05,
  },
];

export const MINORATIONS_APPARTEMENT: Critere[] = [
  {
    cle: 'souplexSousSol',
    libelle: 'Souplex ou sous-sol avec vasistas',
    kind: 'surface',
    options: [
      { valeur: 'souplex', libelle: 'Souplex −10 %', taux: 0.1 },
      { valeur: 'sousSol', libelle: 'Sous-sol −20 %', taux: 0.2 },
    ],
  },
  {
    cle: 'rdcVisAVis',
    libelle: 'RDC avec vis-à-vis sur rue ou sombre · −10 %',
    kind: 'interrupteur',
    taux: 0.1,
  },
  {
    cle: 'partiesCommunesARafraichir',
    libelle: 'Parties communes à rafraîchir · −10 %',
    kind: 'interrupteur',
    taux: 0.1,
  },
  RAFRAICHISSEMENT,
  {
    cle: 'renovation',
    libelle: 'Rénovation du sol au plafond',
    kind: 'coutM2',
    coutM2Ref: 'renovation',
  },
  TRAVAUX_COMPLEMENTAIRES,
  NUISANCE,
  {
    cle: 'sansParking',
    libelle: 'Pas de place de parking · −5 %',
    aide: 'hors cité touristique',
    kind: 'interrupteur',
    taux: 0.05,
  },
  {
    cle: 'majoriteLocataires',
    libelle: 'Majorité de locataires dans l’immeuble · −5 %',
    aide: 'hors cité touristique',
    kind: 'interrupteur',
    taux: 0.05,
  },
  {
    cle: 'sansAscenseur',
    libelle: 'Absence d’ascenseur',
    kind: 'options',
    options: [
      { valeur: '1er-2e', libelle: '1er / 2e · −5 %', taux: 0.05 },
      { valeur: '3e-et-plus', libelle: '3e et + · −10 %', taux: 0.1 },
    ],
  },
  {
    cle: 'sansBalcon',
    libelle: 'Pas de balcon ni terrasse · −10 %',
    kind: 'interrupteur',
    taux: 0.1,
  },
];

export function criteres(type: TypeBien, categorie: Categorie): Critere[] {
  if (type === 'maison') {
    return categorie === 'majoration' ? MAJORATIONS_MAISON : MINORATIONS_MAISON;
  }
  return categorie === 'majoration' ? MAJORATIONS_APPARTEMENT : MINORATIONS_APPARTEMENT;
}

export function tousLesCriteres(type: TypeBien): { critere: Critere; categorie: Categorie }[] {
  return [
    ...criteres(type, 'majoration').map((critere) => ({ critere, categorie: 'majoration' as const })),
    ...criteres(type, 'minoration').map((critere) => ({ critere, categorie: 'minoration' as const })),
  ];
}
