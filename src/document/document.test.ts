import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculerAvis } from '../calcul/calculer.ts';
import { euros } from '../calcul/formater.ts';
import { REFERENTIEL_PAR_DEFAUT as REF } from '../calcul/referentielParDefaut.ts';
import type { AvisDraft } from '../calcul/types.ts';
import { donneesDocument, rsacAffichable, type EntreeDocument } from './document.ts';

const actif = (v: Record<string, unknown>) => ({ active: true, ...v });

// Exemple de référence « maison » de REGLES_DE_CALCUL.md → 361 200 €.
const DRAFT_MAISON: AvisDraft = {
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

const resultat = calculerAvis(DRAFT_MAISON, REF);

const ENTREE: EntreeDocument = {
  type: 'maison',
  client: { nom: 'M. et Mme Dupont', telephone: '06 12 34 56 78', email: 'famille.dupont@email.fr' },
  bien: { adresse: '12 rue des Ormes', codePostal: '85100', ville: "Les Sables-d'Olonne" },
  surfaceHabitable: 120,
  prixM2: 3200,
  dpe: 'E',
  tendanceCran: 'equilibre',
  etabliLe: '2026-08-23T10:00:00+02:00',
  valeurRetenue: resultat.valeurRetenue,
  valeurIntrinseque: resultat.valeurIntrinseque,
  conseiller: {
    nomComplet: 'Camille Moreau',
    telephone: '06 45 78 90 12',
    email: 'camille.moreau@youlive.fr',
    siren: '894 512 336',
  },
};

describe('donneesDocument — document client (ecran 8)', () => {
  const doc = donneesDocument(ENTREE);

  it('sur-titre et titre stricts', () => {
    assert.equal(doc.surTitre, 'DOCUMENT REMIS AU CLIENT');
    assert.equal(doc.titre, 'Avis de valeur');
  });

  it('date d etablissement en clair, avec le lieu de la maquette', () => {
    assert.equal(doc.etabliLe, "Établi le 23 août 2026 aux Sables-d'Olonne");
    assert.equal(doc.signature, "Fait aux Sables-d'Olonne, le 23/08/2026");
  });

  it('valeur retenue = valeur figee, mise en forme comme calculerAvis + euros', () => {
    assert.equal(doc.valeurRetenue, euros(resultat.valeurRetenue));
    assert.equal(doc.valeurRetenue, '361 200 €');
  });

  it('caracteristiques dans l ordre de la maquette', () => {
    assert.deepEqual(
      doc.caracteristiques.map((c) => c.libelle),
      [
        'Surface habitable',
        'Prix au m² médian du quartier',
        'Diagnostic de performance énergétique',
        'Tendance du marché local',
      ],
    );
    assert.equal(doc.caracteristiques[0].valeur, '120 m²');
    assert.equal(doc.caracteristiques[1].valeur, '3 200 €');
    assert.equal(doc.caracteristiques[2].dpe, 'E');
    assert.equal(doc.caracteristiques[3].valeur, 'Marché équilibré');
  });

  it('bloc conseiller : telephone, email, RSAC verbatim', () => {
    assert.equal(doc.conseiller.nom, 'Camille Moreau');
    assert.deepEqual(doc.conseiller.contact, [
      '06 45 78 90 12',
      'camille.moreau@youlive.fr',
      'RSAC 894 512 336',
    ]);
  });

  it('mention juridique et ligne legale reprises telles quelles', () => {
    assert.match(doc.mentionJuridique, /ne peut être assimilé à une expertise/);
    assert.match(doc.ligneLegale, /RCS La Roche-sur-Yon 902 345 678/);
    assert.match(doc.ligneLegale, /Carte professionnelle CPI 8501 2022 000 000 123/);
  });

  it('bien : titre selon le type, adresse sur deux lignes', () => {
    assert.equal(doc.bien.titre, "Maison d'habitation");
    assert.deepEqual(doc.bien.lignes, ['12 rue des Ormes', "85100 Les Sables-d'Olonne"]);
    assert.equal(donneesDocument({ ...ENTREE, type: 'appartement' }).bien.titre, 'Appartement');
  });

  it('valeurs absentes : « — », jamais « 0 € »', () => {
    const vide = donneesDocument({
      ...ENTREE,
      surfaceHabitable: null,
      prixM2: null,
      dpe: null,
      valeurRetenue: null,
      client: { nom: null, telephone: null, email: null },
    });
    assert.equal(vide.caracteristiques[0].valeur, '—');
    assert.equal(vide.caracteristiques[1].valeur, '—');
    assert.equal(vide.caracteristiques[2].dpe, null);
    assert.equal(vide.valeurRetenue, '—');
    assert.equal(vide.demandeur.nom, 'Demandeur non renseigné');
    assert.deepEqual(vide.demandeur.contact, []);
  });
});

describe('rsacAffichable — utilisateurs.siren, texte libre', () => {
  it('garde une valeur exploitable telle quelle, espaces compris', () => {
    assert.equal(rsacAffichable('894 512 336'), '894 512 336');
    assert.equal(rsacAffichable('988219028 '), '988219028');
    assert.equal(
      rsacAffichable('903839264 La Roche sur Yon'),
      '903839264 La Roche sur Yon',
    );
  });

  it('écarte les valeurs qui ne sont pas des identifiants', () => {
    assert.equal(rsacAffichable('0'), null);
    assert.equal(rsacAffichable('1'), null);
    assert.equal(rsacAffichable('   '), null);
    assert.equal(rsacAffichable(null), null);
    assert.equal(rsacAffichable(undefined), null);
  });
});
