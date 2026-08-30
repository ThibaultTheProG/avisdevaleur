/**
 * Écran 9 — Administration · Paramètres. Logique pure autour du référentiel :
 * conversions d'affichage, validation des bornes, et normalisation
 * **autoritaire côté serveur** de ce que renvoie le formulaire.
 *
 * Aucune dépendance runtime : testable sous `node`.
 */

import { REFERENTIEL_PAR_DEFAUT } from '../calcul/referentielParDefaut.ts';
import { LETTRES_DPE, type BaremeDpe, type Referentiel, type TypeBien } from '../calcul/types.ts';

export { LETTRES_DPE };
export const TYPES_BIEN: readonly TypeBien[] = ['maison', 'appartement'];

export const LIBELLE_PLAFOND: Record<keyof Referentiel['plafonds'], string> = {
  vue: 'Vue',
  nuisance: 'Nuisance ou risque',
  terrainPaysage: 'Terrain paysagé',
  malAgence: 'Mal agencé',
  terrasse: 'Superbe terrasse (appartement)',
};

export const LIBELLE_TENDANCE_ADMIN: Record<keyof Referentiel['tendance'], string> = {
  haussier: 'Haussier',
  equilibre: 'Équilibré',
  baissier: 'Baissier',
};

// ─── Conversions d'affichage ──────────────────────────────────────────────
// En base les taux sont des ratios (0.075) ; l'écran les montre en pour-cent
// (7,5). On arrondit pour éviter les artefacts de flottants (0.1 × 3 ≠ 0.3).

/** 0.075 → 7.5 */
export function ratioVersPourcent(ratio: number): number {
  return Number.isFinite(ratio) ? Math.round(ratio * 1000) / 10 : Number.NaN;
}

/** 7.5 → 0.075 */
export function pourcentVersRatio(pourcent: number): number {
  return Number.isFinite(pourcent) ? Math.round(pourcent * 10) / 1000 : Number.NaN;
}

// ─── Validation ───────────────────────────────────────────────────────────

export function validerReferentiel(r: Referentiel): string[] {
  const erreurs: string[] = [];

  const borne = (
    valeur: number,
    min: number,
    max: number,
    libelle: string,
    unite = '',
  ) => {
    if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
      erreurs.push(`${libelle} : valeur manquante ou invalide.`);
      return;
    }
    if (valeur < min || valeur > max) {
      erreurs.push(`${libelle} : attendu entre ${min}${unite} et ${max}${unite}.`);
    }
  };

  for (const type of TYPES_BIEN) {
    borne(r.surfaceMediane[type], 1, 1000, `Surface médiane (${type})`, ' m²');
  }
  borne(r.tauxDecoteGrandeSurface * 100, 0, 100, 'Décote des m² au-delà', ' %');
  borne(r.tauxSurface.veranda * 100, 0, 200, 'Taux de surface — véranda', ' %');
  borne(r.tauxSurface.annexe * 100, 0, 200, 'Taux de surface — annexe', ' %');
  borne(r.coutM2.rafraichissement, 0, 100_000, 'Coût au m² — rafraîchissement', ' €');
  borne(r.coutM2.renovation, 0, 100_000, 'Coût au m² — rénovation', ' €');

  for (const type of TYPES_BIEN) {
    for (const lettre of LETTRES_DPE) {
      borne(r.dpe[type][lettre] * 100, -100, 100, `Barème DPE ${lettre} (${type})`, ' %');
    }
  }

  for (const cle of Object.keys(LIBELLE_PLAFOND) as (keyof Referentiel['plafonds'])[]) {
    borne(r.plafonds[cle] * 100, 0, 100, `Plafond — ${LIBELLE_PLAFOND[cle]}`, ' %');
  }

  for (const cle of Object.keys(LIBELLE_TENDANCE_ADMIN) as (keyof Referentiel['tendance'])[]) {
    borne(r.tendance[cle] * 100, -100, 100, `Tendance — ${LIBELLE_TENDANCE_ADMIN[cle]}`, ' %');
  }

  return erreurs;
}

// ─── Normalisation serveur ────────────────────────────────────────────────
// Le formulaire renvoie un objet client : on ne le fait jamais confiance. On
// reconstruit un `Referentiel` complet à partir des seules clés attendues, en
// coerçant chaque valeur en nombre. `null` → on refuse l'enregistrement.

function versNombre(valeur: unknown): number {
  const n = typeof valeur === 'number' ? valeur : Number(valeur);
  if (!Number.isFinite(n)) throw new RangeError('valeur non numérique');
  return n;
}

function baremeDepuis(brut: unknown): BaremeDpe {
  const source = (brut ?? {}) as Record<string, unknown>;
  const bareme = {} as BaremeDpe;
  for (const lettre of LETTRES_DPE) bareme[lettre] = versNombre(source[lettre]);
  return bareme;
}

function tauxNommesDepuis(brut: unknown, defaut: Record<string, number>): Record<string, number> {
  if (!brut || typeof brut !== 'object') return { ...defaut };
  const out: Record<string, number> = {};
  for (const [cle, valeur] of Object.entries(brut as Record<string, unknown>)) {
    out[cle] = versNombre(valeur);
  }
  return Object.keys(out).length > 0 ? out : { ...defaut };
}

export function normaliserReferentiel(brut: unknown): Referentiel | null {
  if (!brut || typeof brut !== 'object') return null;
  const o = brut as Record<string, unknown>;
  const nested = (cle: string) => (o[cle] ?? {}) as Record<string, unknown>;

  try {
    const options = nested('tauxOptions');
    return {
      surfaceMediane: {
        maison: versNombre(nested('surfaceMediane').maison),
        appartement: versNombre(nested('surfaceMediane').appartement),
      },
      tauxDecoteGrandeSurface: versNombre(o.tauxDecoteGrandeSurface),
      tauxSurface: {
        veranda: versNombre(nested('tauxSurface').veranda),
        annexe: versNombre(nested('tauxSurface').annexe),
      },
      coutM2: {
        rafraichissement: versNombre(nested('coutM2').rafraichissement),
        renovation: versNombre(nested('coutM2').renovation),
      },
      dpe: {
        maison: baremeDepuis(nested('dpe').maison),
        appartement: baremeDepuis(nested('dpe').appartement),
      },
      plafonds: {
        vue: versNombre(nested('plafonds').vue),
        nuisance: versNombre(nested('plafonds').nuisance),
        terrainPaysage: versNombre(nested('plafonds').terrainPaysage),
        malAgence: versNombre(nested('plafonds').malAgence),
        terrasse: versNombre(nested('plafonds').terrasse),
      },
      tendance: {
        haussier: versNombre(nested('tendance').haussier),
        equilibre: versNombre(nested('tendance').equilibre),
        baissier: versNombre(nested('tendance').baissier),
      },
      // Non éditables à l'écran 9 : repris tels quels, défauts en secours.
      tauxOptions: {
        souplex: versNombre(options.souplex ?? REFERENTIEL_PAR_DEFAUT.tauxOptions.souplex),
        sousSol: versNombre(options.sousSol ?? REFERENTIEL_PAR_DEFAUT.tauxOptions.sousSol),
        etages: tauxNommesDepuis(options.etages, REFERENTIEL_PAR_DEFAUT.tauxOptions.etages),
        ascenseur: tauxNommesDepuis(
          options.ascenseur,
          REFERENTIEL_PAR_DEFAUT.tauxOptions.ascenseur,
        ),
      },
    };
  } catch {
    return null;
  }
}
