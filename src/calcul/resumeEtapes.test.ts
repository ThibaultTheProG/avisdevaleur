import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculerAvis } from './calculer.ts';
import { criteres } from './catalogue.ts';
import { eurosSignes } from './formater.ts';
import { resumeEtapes } from './resumeEtapes.ts';
import { REFERENTIEL_PAR_DEFAUT as REF } from './referentielParDefaut.ts';
import type { Categorie, AvisDraft } from './types.ts';

const actif = (valeurs: Record<string, unknown>) => ({ active: true, ...valeurs });

const libelle = (categorie: Categorie, cle: string) =>
  criteres('maison', categorie).find((c) => c.cle === cle)!.libelle;

const MAISON: AvisDraft = {
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

describe('resumeEtapes — cartes de modification (ecran 7)', () => {
  const etapes = resumeEtapes(
    MAISON,
    {
      clientNom: 'M. et Mme Dupont',
      adresse: '12 rue des Ormes',
      codePostal: '85100',
      ville: 'Les Sables',
    },
    calculerAvis(MAISON, REF),
  );

  it('etape 1 : client et bien', () => {
    assert.equal(etapes[0].resume, 'M. et Mme Dupont · 12 rue des Ormes, 85100 Les Sables');
    assert.equal(etapes[0].total, null);
  });

  it('etape 2 : surface, prix, DPE, prix de reference au format du handoff', () => {
    assert.equal(
      etapes[1].resume,
      '120 m² · 3 200 €/m² · DPE E · réf. 336 000 €',
    );
  });

  it('etape 3 : trois majorations puis +N, et le total signe', () => {
    assert.equal(
      etapes[2].resume,
      [libelle('majoration', 'veranda'), libelle('majoration', 'annexe'), libelle('majoration', 'vue')].join(
        ' · ',
      ) + ' +1',
    );
    assert.equal(etapes[2].total, eurosSignes(85_600, 'majoration'));
  });

  it('etape 4 : minorations actives et total signe', () => {
    assert.equal(
      etapes[3].resume,
      [libelle('minoration', 'rafraichissement'), libelle('minoration', 'sansGarage')].join(' · '),
    );
    assert.equal(etapes[3].total, eurosSignes(26_800, 'minoration'));
  });

  it('etape 5 : cran de marche et pourcentage', () => {
    assert.equal(etapes[4].resume, 'Marché équilibré · 0 %');
    assert.equal(etapes[4].total, null);
  });

  it('sans saisie : libelles d attente, jamais 0 euro', () => {
    const vide: AvisDraft = {
      type: 'appartement',
      surfaceHabitable: null,
      prixM2: null,
      surfaceMedianeQuartier: null,
      dpe: null,
      tendanceCran: 'equilibre',
      tendancePourcentage: 0,
      lignes: {},
    };
    const r = resumeEtapes(vide, {}, calculerAvis(vide, REF));
    assert.equal(r[0].resume, 'Client et bien à renseigner');
    assert.equal(r[1].resume, '— · — · DPE — · réf. —');
    assert.equal(r[2].resume, 'Aucune majoration');
    assert.equal(r[2].total, null);
    assert.equal(r[3].resume, 'Aucune minoration');
    assert.equal(r[3].total, null);
  });
});
