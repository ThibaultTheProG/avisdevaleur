#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8e5df303ee55024e56d64adc8f06324f7b5261084cc50406929fca0e76b59f43/contract';
import endContract from '../../snapshots/8e5df303ee55024e56d64adc8f06324f7b5261084cc50406929fca0e76b59f43/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'avis_de_valeur' }),
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        columns: [
          col('adresse', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('client_email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('client_nom', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('client_telephone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('code_postal', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('conseiller_idapimo', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cree_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dpe', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('modifie_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('prix_m2', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('referentiel_version_id', 'uuid', {
            notNull: true,
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('statut', 'text', {
            notNull: true,
            default: lit('brouillon'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('supprime_le', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('surface_habitable', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('surface_mediane_quartier', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('tendance_cran', 'text', {
            notNull: true,
            default: lit('equilibre'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tendance_pourcentage', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('valeur_intrinseque', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('valeur_retenue', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('ville', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'avis_de_valeur_dpe_check_3df9dfe3',
            "\"dpe\" IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')",
          ),
          checkExpression(
            'avis_de_valeur_statut_check_45b9d9ac',
            "\"statut\" IN ('brouillon', 'enregistre')",
          ),
          checkExpression(
            'avis_de_valeur_tendance_cran_check_67ec7273',
            "\"tendance_cran\" IN ('haussier', 'equilibre', 'baissier')",
          ),
          checkExpression(
            'avis_de_valeur_type_check_a219d391',
            "\"type\" IN ('maison', 'appartement')",
          ),
        ],
      }),
      this.createTable({
        schema: 'avis_de_valeur',
        table: 'ligne_avis',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('avis_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('categorie', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cle', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cout_m2', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('kind', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('montant', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('option', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('pourcentage', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('surface', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'ligne_avis_categorie_check_62d436cf',
            "\"categorie\" IN ('majoration', 'minoration')",
          ),
          checkExpression(
            'ligne_avis_kind_check_a117c92d',
            "\"kind\" IN ('surface', 'pourcentage', 'coutM2', 'montant', 'options', 'interrupteur')",
          ),
        ],
      }),
      this.createTable({
        schema: 'avis_de_valeur',
        table: 'referentiel_version',
        columns: [
          col('actif', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('contenu', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('cree_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('cree_par_idapimo', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'avis_de_valeur',
        table: 'session',
        columns: [
          col('conseiller_idapimo', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cree_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expire_le', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ip', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('token_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_agent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('vu_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'avis_de_valeur',
        table: 'tentative_connexion',
        columns: [
          col('cree_le', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ip', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reussie', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'avis_de_valeur',
        table: 'ligne_avis',
        constraint: 'ligne_avis_avis_id_cle_key',
        columns: ['avis_id', 'cle'],
      }),
      this.addUnique({
        schema: 'avis_de_valeur',
        table: 'session',
        constraint: 'session_token_hash_key',
        columns: ['token_hash'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        index: 'avis_de_valeur_conseiller_idapimo_idx_f7c90b50',
        columns: ['conseiller_idapimo'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        index: 'avis_de_valeur_conseiller_idapimo_modifie_le_idx_2531ff6b',
        columns: ['conseiller_idapimo', 'modifie_le'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        index: 'avis_de_valeur_referentiel_version_id_idx_ba6ba763',
        columns: ['referentiel_version_id'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'ligne_avis',
        index: 'ligne_avis_avis_id_idx_1be523a4',
        columns: ['avis_id'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'referentiel_version',
        index: 'referentiel_version_actif_idx_a7f19943',
        columns: ['actif'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'session',
        index: 'session_conseiller_idapimo_idx_f7c90b50',
        columns: ['conseiller_idapimo'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'session',
        index: 'session_expire_le_idx_f9e8e926',
        columns: ['expire_le'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'tentative_connexion',
        index: 'tentative_connexion_email_cree_le_idx_4d6429d3',
        columns: ['email', 'cree_le'],
      }),
      this.createIndex({
        schema: 'avis_de_valeur',
        table: 'tentative_connexion',
        index: 'tentative_connexion_ip_cree_le_idx_e9728ccb',
        columns: ['ip', 'cree_le'],
      }),
      this.addForeignKey({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        foreignKey: {
          name: 'avis_de_valeur_conseiller_idapimo_fkey',
          columns: ['conseiller_idapimo'],
          references: { schema: 'public', table: 'utilisateurs', columns: ['idapimo'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'avis_de_valeur',
        table: 'avis_de_valeur',
        foreignKey: {
          name: 'avis_de_valeur_referentiel_version_id_fkey',
          columns: ['referentiel_version_id'],
          references: { schema: 'avis_de_valeur', table: 'referentiel_version', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'avis_de_valeur',
        table: 'ligne_avis',
        foreignKey: {
          name: 'ligne_avis_avis_id_fkey',
          columns: ['avis_id'],
          references: { schema: 'avis_de_valeur', table: 'avis_de_valeur', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'avis_de_valeur',
        table: 'session',
        foreignKey: {
          name: 'session_conseiller_idapimo_fkey',
          columns: ['conseiller_idapimo'],
          references: { schema: 'public', table: 'utilisateurs', columns: ['idapimo'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
