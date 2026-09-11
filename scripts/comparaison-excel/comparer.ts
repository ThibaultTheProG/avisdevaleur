/**
 * Banc de comparaison « application ↔ classeurs Excel ».
 *
 * Génère des scénarios pseudo-aléatoires déterministes, les fait calculer par
 * `calculerAvis` d'un côté et par l'oracle Excel (`oracle_excel.py`, qui évalue
 * les formules lues dans les .xlsx) de l'autre, puis compare ligne à ligne.
 *
 *   node scripts/comparaison-excel/comparer.ts [nombre de scénarios]
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { calculerAvis } from '../../src/calcul/calculer.ts';
import { REFERENTIEL_PAR_DEFAUT } from '../../src/calcul/referentielParDefaut.ts';
import { criteres } from '../../src/calcul/catalogue.ts';
import type { AvisDraft, LettreDpe, LigneSaisie, TypeBien } from '../../src/calcul/types.ts';

const ICI = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pour chaque critère de l'application : comment le remplir côté classeur.
 * Les taux `pctExcel` sont ceux **écrits dans les libellés du classeur**, saisis
 * ici indépendamment du catalogue — l'écart entre les deux est lui-même vérifié.
 */
type Remplissage =
  | { mode: 'surface'; taux: number }
  | { mode: 'pourcentage' }
  | { mode: 'coutM2'; cout: number }
  | { mode: 'montant' }
  | { mode: 'fixe'; pctExcel: number }
  | { mode: 'option'; options: { valeur: string; pctExcel: number }[] }
  | { mode: 'optionSurface'; options: { valeur: string; pctExcel: number }[] }
  | { mode: 'absentDuClasseur' };

const REMPLISSAGE: Record<string, Remplissage> = {
  veranda: { mode: 'surface', taux: 0.5 },
  annexe: { mode: 'surface', taux: 0.25 },
  vue: { mode: 'pourcentage' },
  orientationSud: { mode: 'fixe', pctExcel: 0.05 },
  travauxRecents: { mode: 'montant' },
  plainPied: { mode: 'fixe', pctExcel: 0.05 },
  nonMitoyen: { mode: 'fixe', pctExcel: 0.05 },
  terrainPaysage: { mode: 'pourcentage' },
  terrasse: { mode: 'pourcentage' },
  partiesCommunesHautDeGamme: { mode: 'fixe', pctExcel: 0.05 },
  etages: {
    mode: 'option',
    options: [{ valeur: 'R+2', pctExcel: 0.05 }, { valeur: 'R+3', pctExcel: 0.1 }],
  },
  mitoyenDeuxCotes: { mode: 'fixe', pctExcel: 0.05 },
  rafraichissement: { mode: 'coutM2', cout: 250 },
  renovation: { mode: 'coutM2', cout: 1250 },
  malAgence: { mode: 'pourcentage' },
  nuisance: { mode: 'pourcentage' },
  sansTerrain: { mode: 'fixe', pctExcel: 0.1 },
  sansGarage: { mode: 'fixe', pctExcel: 0.05 },
  souplexSousSol: {
    mode: 'optionSurface',
    options: [{ valeur: 'souplex', pctExcel: 0.1 }, { valeur: 'sousSol', pctExcel: 0.2 }],
  },
  rdcVisAVis: { mode: 'fixe', pctExcel: 0.1 },
  partiesCommunesARafraichir: { mode: 'fixe', pctExcel: 0.1 },
  sansParking: { mode: 'fixe', pctExcel: 0.05 },
  majoriteLocataires: { mode: 'fixe', pctExcel: 0.05 },
  sansAscenseur: {
    mode: 'option',
    options: [{ valeur: '1er-2e', pctExcel: 0.05 }, { valeur: '3e-et-plus', pctExcel: 0.1 }],
  },
  sansBalcon: { mode: 'fixe', pctExcel: 0.1 },
  // Ligne ajoutée par l'application : aucune contrepartie dans les classeurs.
  travauxComplementaires: { mode: 'absentDuClasseur' },
};

/** Générateur déterministe (mulberry32), pour que le rapport soit reproductible. */
function rng(graine: number) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LETTRES: LettreDpe[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

type Scenario = {
  id: number;
  type: TypeBien;
  surfaceHabitable: number;
  prixM2: number;
  surfaceMediane: number;
  dpe: LettreDpe | null;
  criteres: Record<string, Record<string, unknown>>;
};

/**
 * `neutre` : surface sous la médiane et pourcentages dans les plafonds. Les
 * deux causes d'écart déjà identifiées — base des pourcentages, écrêtage — sont
 * alors hors jeu, et tout écart restant est une divergence non expliquée.
 */
let neutre = false;
/** `base` : plafonds et lignes absentes neutralisés, mais surfaces libres —
 *  ne reste que l'effet du choix de base des pourcentages. */
let base = false;

/**
 * Critères que l'application porte et que le classeur correspondant ne porte
 * pas. En mode neutre ils sont laissés inactifs : sinon leur montant fausse
 * seul le total et masque tout le reste.
 */
const ABSENTS_DU_CLASSEUR: Record<TypeBien, string[]> = {
  maison: ['travauxComplementaires'],
  appartement: ['travauxComplementaires', 'nuisance'],
};

function construire(id: number, alea: () => number): { scenario: Scenario; draft: AvisDraft } {
  const type: TypeBien = alea() < 0.5 ? 'maison' : 'appartement';
  const plafondSurface = type === 'maison' ? 90 : 60;
  const surfaceHabitable =
    neutre && !base
      ? Math.round(25 + alea() * (plafondSurface - 25))
      : Math.round(35 + alea() * 165);
  const prixM2 = Math.round((1500 + alea() * 4000) / 10) * 10;
  // La médiane est imposée des deux côtés : on compare les formules, pas les
  // paramètres (l'écart 90/65 ↔ 90/60 est rapporté à part).
  const surfaceMediane = type === 'maison' ? 90 : 60;
  const dpe = alea() < 0.85 ? LETTRES[Math.floor(alea() * LETTRES.length)] : null;

  const scenario: Scenario = {
    id, type, surfaceHabitable, prixM2, surfaceMediane, dpe, criteres: {},
  };
  const lignes: Record<string, LigneSaisie> = {};

  for (const categorie of ['majoration', 'minoration'] as const) {
    for (const critere of criteres(type, categorie)) {
      const actif = alea() < 0.45 && !(neutre && ABSENTS_DU_CLASSEUR[type].includes(critere.cle));
      if (!actif) {
        lignes[critere.cle] = { active: false };
        continue;
      }
      const r = REMPLISSAGE[critere.cle];
      if (!r) throw new Error(`Critère non cartographié : ${critere.cle}`);

      switch (r.mode) {
        case 'surface': {
          const surface = Math.round(3 + alea() * 40);
          lignes[critere.cle] = { active: true, surface };
          scenario.criteres[critere.cle] = { surface, taux: r.taux };
          break;
        }
        case 'optionSurface': {
          const o = r.options[Math.floor(alea() * r.options.length)];
          const surface = Math.round(5 + alea() * 30);
          lignes[critere.cle] = { active: true, surface, option: o.valeur };
          scenario.criteres[critere.cle] = { surface, taux: o.pctExcel };
          break;
        }
        case 'pourcentage': {
          // Volontairement jusqu'à 35 % : au-delà du plafond, pour révéler
          // l'écrêtage que l'application applique et le classeur non.
          const plafond = critere.plafond
            ? REFERENTIEL_PAR_DEFAUT.plafonds[critere.plafond]
            : 0.35;
          const pourcentage = neutre
            ? Math.round(alea() * plafond * 100) / 100
            : Math.round(alea() * 35) / 100;
          lignes[critere.cle] = { active: true, pourcentage };
          scenario.criteres[critere.cle] = { pourcentage };
          break;
        }
        case 'coutM2': {
          const surface = Math.round(5 + alea() * 60);
          lignes[critere.cle] = { active: true, surface, coutM2: r.cout };
          scenario.criteres[critere.cle] = { surface, coutM2: r.cout };
          break;
        }
        case 'montant': {
          const montant = Math.round(alea() * 40000);
          lignes[critere.cle] = { active: true, montant };
          scenario.criteres[critere.cle] = { montant };
          break;
        }
        case 'fixe': {
          lignes[critere.cle] = { active: true };
          scenario.criteres[critere.cle] = { pourcentage: r.pctExcel };
          break;
        }
        case 'option': {
          const o = r.options[Math.floor(alea() * r.options.length)];
          lignes[critere.cle] = { active: true, option: o.valeur };
          scenario.criteres[critere.cle] = { pourcentage: o.pctExcel };
          break;
        }
        case 'absentDuClasseur': {
          // Jamais activé : la ligne n'existe pas dans le classeur, l'activer
          // produirait un écart trivial qui masquerait les vrais.
          lignes[critere.cle] = { active: false };
          break;
        }
      }
    }
  }

  const draft: AvisDraft = {
    type,
    surfaceHabitable,
    prixM2,
    surfaceMedianeQuartier: surfaceMediane,
    dpe,
    tendanceCran: 'baissier',
    tendancePourcentage: REFERENTIEL_PAR_DEFAUT.tendance.baissier,
    lignes,
  };
  return { scenario, draft };
}

// ─── Exécution ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
neutre = args.includes('--neutre') || args.includes('--base');
base = args.includes('--base');
const nombre = Number(args.find((a) => !a.startsWith('--')) ?? 300);
const alea = rng(20260909);
const paires = Array.from({ length: nombre }, (_, i) => construire(i, alea));

const py = spawnSync('python3', [path.join(ICI, 'oracle_excel.py')], {
  input: JSON.stringify(paires.map((p) => p.scenario)),
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (py.status !== 0) {
  console.error(py.stderr);
  process.exit(1);
}
const excel = JSON.parse(py.stdout) as {
  id: number;
  prixReference: number;
  valeurIntrinseque: number;
  netVendeur095: number;
  lignes: Record<string, number>;
}[];

const EPS = 0.01;
type Ecart = { scenario: Scenario; grandeur: string; app: number; xl: number };
const ecarts: Ecart[] = [];
let identiques = 0;

for (const [i, { scenario, draft }] of paires.entries()) {
  const res = calculerAvis(draft, { ...REFERENTIEL_PAR_DEFAUT });
  const xl = excel[i];
  const avant = ecarts.length;

  const compare = (grandeur: string, app: number, ref: number) => {
    if (Math.abs(app - ref) > EPS) ecarts.push({ scenario, grandeur, app, xl: ref });
  };

  compare('prixReference', res.prixReference ?? 0, xl.prixReference);
  compare('valeurIntrinseque', res.valeurIntrinseque ?? 0, xl.valeurIntrinseque);
  compare('valeurRetenue (baissier ↔ ×0,95)', res.valeurRetenue ?? 0, xl.netVendeur095);

  for (const c of res.contributions) {
    const cible = xl.lignes[c.cle];
    if (cible === undefined) {
      // Ligne de l'application sans contrepartie dans le classeur : elle pèse
      // sur le total d'un seul côté. À signaler, jamais à ignorer.
      if (c.montant !== 0) {
        ecarts.push({
          scenario,
          grandeur: `ligne « ${c.cle} » ABSENTE du classeur ${scenario.type}`,
          app: c.montant,
          xl: 0,
        });
      }
      continue;
    }
    compare(`ligne ${c.cle}`, c.montant, cible);
  }

  if (ecarts.length === avant) identiques += 1;
}

// ─── Rapport ────────────────────────────────────────────────────────────────

const parGrandeur = new Map<string, Ecart[]>();
for (const e of ecarts) {
  const k = e.grandeur.startsWith('ligne ') ? e.grandeur : e.grandeur;
  if (!parGrandeur.has(k)) parGrandeur.set(k, []);
  parGrandeur.get(k)!.push(e);
}

console.log(
  `\nMode : ${base ? 'base (surfaces libres, plafonds et lignes absentes neutralisés)' : neutre ? 'neutre (sous la médiane, dans les plafonds)' : 'complet (surfaces et % libres)'}`,
);
console.log(`Scénarios : ${nombre}   ·   sans aucun écart : ${identiques}   ·   écarts : ${ecarts.length}\n`);
const lignesRapport = [...parGrandeur.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [grandeur, liste] of lignesRapport) {
  const e = liste[0];
  const pire = liste.reduce((m, x) => (Math.abs(x.app - x.xl) > Math.abs(m.app - m.xl) ? x : m));
  console.log(
    `${String(liste.length).padStart(4)} ×  ${grandeur}\n` +
    `        exemple #${e.scenario.id} ${e.scenario.type} ${e.scenario.surfaceHabitable} m² @ ${e.scenario.prixM2} €` +
    `  app ${e.app.toFixed(2)}  ≠  excel ${e.xl.toFixed(2)}\n` +
    `        écart max #${pire.scenario.id} : ${(pire.app - pire.xl).toFixed(2)} €`,
  );
}
// Écart relatif sur la valeur intrinsèque retenue, la seule grandeur que le conseiller lit.
const relatifs = ecarts
  .filter((e) => e.grandeur.startsWith('valeurRetenue'))
  .map((e) => Math.abs(e.app - e.xl) / Math.max(1, Math.abs(e.xl)))
  .sort((a, b) => a - b);
if (relatifs.length) {
  const q = (f: number) => relatifs[Math.min(relatifs.length - 1, Math.floor(f * relatifs.length))];
  console.log(
    `Écart relatif sur la valeur intrinsèque retenue — médian ${(q(0.5) * 100).toFixed(1)} %` +
    ` · 90e centile ${(q(0.9) * 100).toFixed(1)} %` +
    ` · maximum ${(relatifs[relatifs.length - 1] * 100).toFixed(1)} %`,
  );
}
console.log();

// Inspection d'un scénario : `--detail <id>`
const idDetail = args.includes('--detail') ? Number(args[args.indexOf('--detail') + 1]) : null;
if (idDetail !== null) {
  const { scenario, draft } = paires[idDetail];
  const res = calculerAvis(draft, { ...REFERENTIEL_PAR_DEFAUT });
  const xl = excel[idDetail];
  console.log('scenario', JSON.stringify(scenario, null, 1));
  console.log('app  prixRef', res.prixReference, 'dpe', res.contributionDpe,
    'maj', res.totalMajorations, 'min', res.totalMinorations, 'intr', res.valeurIntrinseque);
  console.log('app  lignes', res.contributions.map((c) => `${c.cle}=${c.montant.toFixed(2)}${c.plafonnee ? '*' : ''}`).join(' '));
  console.log('xl   prixRef', xl.prixReference, 'intr', xl.valeurIntrinseque);
  console.log('xl   lignes', Object.entries(xl.lignes).filter(([, v]) => v !== 0).map(([k, v]) => `${k}=${(v as number).toFixed(2)}`).join(' '));
}
