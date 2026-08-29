import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculerAvis } from './calculer.ts';
import { euros, eurosSignes, pourcentage, pourcentageSigne } from './formater.ts';
import { REFERENTIEL_PAR_DEFAUT as REF } from './referentielParDefaut.ts';
import type { AvisDraft } from './types.ts';

const actif = (valeurs: Record<string, unknown>) => ({ active: true, ...valeurs });

describe('Exemples de référence de REGLES_DE_CALCUL.md', () => {
  it('maison — 120 m² · 3 200 €/m² · DPE E · marché équilibré → 361 200 €', () => {
    const draft: AvisDraft = {
      type: 'maison',
      surfaceHabitable: 120,
      prixM2: 3200,
      surfaceMedianeQuartier: 90,
      dpe: 'E',
      tendanceCran: 'equilibre',
      tendancePourcentage: 0,
      lignes: {
        veranda: actif({ surface: 12 }),
        annexe: actif({ surface: 20 }),
        vue: actif({ pourcentage: 0.1 }),
        orientationSud: actif({}),
        rafraichissement: actif({ surface: 40, coutM2: 250 }),
        sansGarage: actif({}),
      },
    };

    const r = calculerAvis(draft, REF);

    assert.equal(r.detailDecote?.valeurDeBase, 384_000);
    assert.equal(r.detailDecote?.surfaceExcedent, 30);
    assert.equal(r.detailDecote?.decoteSurface, 48_000);
    assert.equal(r.prixReference, 336_000);
    assert.equal(r.contributionDpe, -33_600);
    assert.equal(r.totalMajorations, 85_600);
    assert.equal(r.totalMinorations, 26_800);
    assert.equal(r.valeurIntrinseque, 361_200);
    assert.equal(r.valeurRetenue, 361_200);
    assert.equal(euros(r.valeurRetenue), '361\u00a0200\u00a0€');

    // Le détail ligne à ligne de l'exemple.
    const parCle = Object.fromEntries(r.contributions.map((c) => [c.cle, c.montant]));
    assert.deepEqual(parCle, {
      veranda: 19_200,
      annexe: 16_000,
      vue: 33_600,
      orientationSud: 16_800,
      rafraichissement: 10_000,
      sansGarage: 16_800,
    });
  });

  it('appartement — 72 m² · 4 100 €/m² · DPE C · marché baissier → 245 580 €', () => {
    const draft: AvisDraft = {
      type: 'appartement',
      surfaceHabitable: 72,
      prixM2: 4100,
      surfaceMedianeQuartier: 60,
      dpe: 'C',
      tendanceCran: 'baissier',
      tendancePourcentage: -0.05,
      lignes: {
        annexe: actif({ surface: 8 }),
        terrasse: actif({ pourcentage: 0.075 }),
        orientationSud: actif({}),
        partiesCommunesARafraichir: actif({}),
        sansParking: actif({}),
        sansAscenseur: actif({ option: '3e-et-plus' }),
      },
    };

    const r = calculerAvis(draft, REF);

    assert.equal(r.detailDecote?.valeurDeBase, 295_200);
    assert.equal(r.detailDecote?.decoteSurface, 24_600);
    assert.equal(r.prixReference, 270_600);
    assert.equal(r.contributionDpe, 13_530);
    assert.equal(r.totalMajorations, 42_025);
    assert.equal(r.totalMinorations, 67_650);
    assert.equal(r.valeurIntrinseque, 258_505);
    // La précision est conservée : l'arrondi n'a lieu qu'à l'affichage.
    assert.equal(r.valeurRetenue, 245_579.75);
    assert.equal(euros(r.valeurRetenue), '245\u00a0580\u00a0€');
  });
});

describe('Règles de calcul', () => {
  const base: AvisDraft = {
    type: 'maison',
    surfaceHabitable: 100,
    prixM2: 2000,
    surfaceMedianeQuartier: 90,
    dpe: null,
    tendanceCran: 'equilibre',
    tendancePourcentage: 0,
    lignes: {},
  };

  it('n’applique aucune décote sous la surface médiane', () => {
    const r = calculerAvis({ ...base, surfaceHabitable: 80 }, REF);
    assert.equal(r.detailDecote?.surfaceExcedent, 0);
    assert.equal(r.detailDecote?.decoteSurface, 0);
    assert.equal(r.prixReference, 160_000);
  });

  it('borne un pourcentage au plafond du référentiel', () => {
    const r = calculerAvis({ ...base, lignes: { vue: actif({ pourcentage: 0.9 }) } }, REF);
    const vue = r.contributions.find((c) => c.cle === 'vue');
    // prixReference 190 000 × 30 % (plafond), pas × 90 %.
    assert.equal(vue?.montant, 57_000);
    assert.equal(vue?.plafonnee, true);
  });

  it('ne contribue rien pour une ligne désactivée, sans perdre sa saisie', () => {
    const lignes = { vue: { active: false, pourcentage: 0.1 } };
    const r = calculerAvis({ ...base, lignes }, REF);
    assert.equal(r.contributions.length, 0);
    assert.equal(r.totalMajorations, 0);
    assert.equal(lignes.vue.pourcentage, 0.1);
  });

  it('rend « — » tant que la surface ou le prix au m² manque', () => {
    const r = calculerAvis({ ...base, prixM2: null }, REF);
    assert.equal(r.prixReference, null);
    assert.equal(r.valeurRetenue, null);
    assert.equal(euros(r.valeurRetenue), '—');
  });

  it('applique un coût au m² en euros, sans le proportionner au prix de référence', () => {
    const r = calculerAvis({ ...base, lignes: { renovation: actif({ surface: 10 }) } }, REF);
    // 10 m² × 1 250 €/m² — le coût par défaut vient du référentiel.
    assert.equal(r.contributions.find((c) => c.cle === 'renovation')?.montant, 12_500);
  });

  it('choisit le taux de surface selon l’option (souplex / sous-sol)', () => {
    const appt: AvisDraft = {
      ...base,
      type: 'appartement',
      surfaceMedianeQuartier: 60,
      lignes: { souplexSousSol: actif({ surface: 20, option: 'sousSol' }) },
    };
    // 20 m² × 2 000 € × 20 %
    assert.equal(
      calculerAvis(appt, REF).contributions.find((c) => c.cle === 'souplexSousSol')?.montant,
      8_000,
    );
  });

  it('applique la tendance de marché sur la valeur intrinsèque', () => {
    const r = calculerAvis({ ...base, tendanceCran: 'haussier', tendancePourcentage: 0.05 }, REF);
    assert.equal(r.valeurIntrinseque, 190_000);
    assert.equal(r.valeurRetenue, 199_500);
  });
});

describe('Formatage français', () => {
  it('sépare les milliers par une espace insécable et suffixe l’euro', () => {
    assert.equal(euros(361_200), '361 200 €');
    assert.equal(euros(null), '—');
    assert.equal(euros(0), '0 €');
  });

  it('signe les contributions avec une espace après le signe', () => {
    assert.equal(eurosSignes(19_200, 'majoration'), '+ 19 200 €');
    assert.equal(eurosSignes(33_600, 'minoration'), '− 33 600 €');
  });

  it('écrit les pourcentages à la française', () => {
    assert.equal(pourcentage(0.075), '7,5 %');
    assert.equal(pourcentageSigne(-0.1), '−10 %');
    assert.equal(pourcentageSigne(0.05), '+5 %');
    assert.equal(pourcentageSigne(0), '0 %');
  });
});
