#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/15e92789f299943a0b8122ab3c04b8e44a6ddfd3a3f174acb249f1f16a6367f6/contract';
import endContract from '../../snapshots/15e92789f299943a0b8122ab3c04b8e44a6ddfd3a3f174acb249f1f16a6367f6/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8e5df303ee55024e56d64adc8f06324f7b5261084cc50406929fca0e76b59f43/contract';
import startContract from '../../snapshots/8e5df303ee55024e56d64adc8f06324f7b5261084cc50406929fca0e76b59f43/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'avis_de_valeur',
        table: 'ligne_avis',
        column: col('texte', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
