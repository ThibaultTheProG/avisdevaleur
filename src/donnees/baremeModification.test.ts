import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MODE_BAREME_MODIFICATION,
  sourceBareme,
} from './baremeModification.ts';

describe('baremeModification — quel référentiel recalcule un avis modifié', () => {
  it('par défaut : barème d’origine (l’avis reste cohérent avec le document remis)', () => {
    assert.equal(MODE_BAREME_MODIFICATION, 'origine');
    assert.equal(sourceBareme('enregistre'), 'version-avis');
  });

  it('un brouillon suit toujours le barème du jour', () => {
    assert.equal(sourceBareme('brouillon'), 'version-active');
    assert.equal(sourceBareme('brouillon', 'origine'), 'version-active');
  });

  it('mode « jour » : l’avis enregistré est recalculé avec la version active', () => {
    assert.equal(sourceBareme('enregistre', 'jour'), 'version-active');
  });

  it('mode « origine » : l’avis enregistré garde sa version', () => {
    assert.equal(sourceBareme('enregistre', 'origine'), 'version-avis');
  });
});
