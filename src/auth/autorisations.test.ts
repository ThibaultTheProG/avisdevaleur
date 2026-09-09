import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { peutAdministrer, roleEstAdministrateur } from './autorisations.ts';

describe('roleEstAdministrateur — lecture de utilisateurs.role', () => {
  it('accepte « admin », quelle que soit la casse ou les espaces', () => {
    assert.equal(roleEstAdministrateur('admin'), true);
    assert.equal(roleEstAdministrateur('ADMIN'), true);
    assert.equal(roleEstAdministrateur('  Admin  '), true);
  });

  it('refuse tout le reste', () => {
    assert.equal(roleEstAdministrateur('conseiller'), false);
    assert.equal(roleEstAdministrateur('administrateur'), false);
    assert.equal(roleEstAdministrateur('admin.'), false);
    assert.equal(roleEstAdministrateur(''), false);
    assert.equal(roleEstAdministrateur(null), false);
    assert.equal(roleEstAdministrateur(undefined), false);
  });
});

describe('peutAdministrer — garde d’accès à l’administration', () => {
  it('n’autorise que le drapeau explicitement vrai', () => {
    assert.equal(peutAdministrer({ estAdministrateur: true }), true);
    assert.equal(peutAdministrer({ estAdministrateur: false }), false);
    assert.equal(peutAdministrer(null), false);
    assert.equal(peutAdministrer(undefined), false);
  });
});
