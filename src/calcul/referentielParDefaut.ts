import type { Referentiel } from './types.ts';

/**
 * Valeurs par défaut du référentiel (REGLES_DE_CALCUL.md).
 *
 * Sert à amorcer la première version en base (scripts/seed-referentiel.ts) et
 * de base aux tests. En fonctionnement, le calculateur lit TOUJOURS la version
 * active en base, jamais cette constante : c'est l'écran 9 qui fait foi.
 */
export const REFERENTIEL_PAR_DEFAUT: Referentiel = {
  surfaceMediane: { maison: 90, appartement: 60 },
  tauxDecoteGrandeSurface: 0.5,
  tauxSurface: { veranda: 0.5, annexe: 0.25 },
  coutM2: { rafraichissement: 250, renovation: 1250 },
  dpe: {
    maison: { A: 0.15, B: 0.1, C: 0.05, D: 0, E: -0.1, F: -0.15, G: -0.25 },
    appartement: { A: 0.15, B: 0.1, C: 0.05, D: 0, E: -0.05, F: -0.1, G: -0.15 },
  },
  plafonds: { vue: 0.3, nuisance: 0.3, terrainPaysage: 0.1, malAgence: 0.1, terrasse: 0.15 },
  tendance: { haussier: 0.05, equilibre: 0, baissier: -0.05 },
  tauxOptions: {
    souplex: 0.1,
    sousSol: 0.2,
    etages: { 'R+2': 0.05, 'R+3': 0.1 },
    ascenseur: { '1er-2e': 0.05, '3e-et-plus': 0.1 },
  },
};
