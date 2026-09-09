import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { REFERENTIEL_PAR_DEFAUT as REF } from '../calcul/referentielParDefaut.ts';
import type { Referentiel } from '../calcul/types.ts';
import {
  normaliserReferentiel,
  pourcentVersRatio,
  ratioVersPourcent,
  validerReferentiel,
} from './parametres.ts';

const clone = (): Referentiel => structuredClone(REF);

describe('conversions ratio ⇄ pour-cent', () => {
  it('aller-retour sans artefact de flottant', () => {
    assert.equal(ratioVersPourcent(0.075), 7.5);
    assert.equal(ratioVersPourcent(-0.05), -5);
    assert.equal(pourcentVersRatio(7.5), 0.075);
    assert.equal(pourcentVersRatio(-10), -0.1);
    assert.equal(pourcentVersRatio(ratioVersPourcent(0.3)), 0.3);
  });
});

describe('validerReferentiel', () => {
  it('le référentiel par défaut est valide', () => {
    assert.deepEqual(validerReferentiel(REF), []);
  });

  it('signale une surface médiane nulle et un plafond hors bornes', () => {
    const r = clone();
    r.surfaceMediane.maison = 0;
    r.plafonds.vue = 1.5;
    const erreurs = validerReferentiel(r);
    assert.equal(erreurs.length, 2);
    assert.ok(erreurs.some((e) => e.includes('Surface médiane (maison)')));
    assert.ok(erreurs.some((e) => e.includes('Vue')));
  });

  it('signale un barème DPE non numérique', () => {
    const r = clone();
    (r.dpe.appartement as Record<string, number>).C = Number.NaN;
    const erreurs = validerReferentiel(r);
    assert.ok(erreurs.some((e) => e.includes('Barème DPE C (appartement)')));
  });

  it('accepte des tendances négatives dans les bornes', () => {
    const r = clone();
    r.tendance.baissier = -0.08;
    assert.deepEqual(validerReferentiel(r), []);
  });
});

describe('normaliserReferentiel — garde serveur', () => {
  it('reconstruit à l’identique le référentiel par défaut', () => {
    assert.deepEqual(normaliserReferentiel(REF), REF);
  });

  it('coerce les nombres passés en chaîne (FormData)', () => {
    const brut = structuredClone(REF) as unknown as Record<string, unknown>;
    (brut.surfaceMediane as Record<string, unknown>).maison = '95';
    (brut.plafonds as Record<string, unknown>).vue = '0.28';
    const out = normaliserReferentiel(brut);
    assert.equal(out?.surfaceMediane.maison, 95);
    assert.equal(out?.plafonds.vue, 0.28);
  });

  it('conserve tauxOptions même si le formulaire ne l’envoie pas', () => {
    const brut = structuredClone(REF) as unknown as Record<string, unknown>;
    delete brut.tauxOptions;
    const out = normaliserReferentiel(brut);
    assert.deepEqual(out?.tauxOptions, REF.tauxOptions);
  });

  it('refuse une entrée incomplète ou non objet', () => {
    assert.equal(normaliserReferentiel(null), null);
    assert.equal(normaliserReferentiel('x'), null);
    const brut = structuredClone(REF) as unknown as Record<string, unknown>;
    delete (brut.coutM2 as Record<string, unknown>).renovation;
    assert.equal(normaliserReferentiel(brut), null);
  });
});
