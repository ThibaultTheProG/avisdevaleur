/**
 * Amorce la première version du référentiel (écran 9 · Administration).
 * Idempotent : ne fait rien s'il existe déjà une version active.
 *
 *   node scripts/seed-referentiel.ts
 */
import { REFERENTIEL_PAR_DEFAUT } from '../src/calcul/referentielParDefaut.ts';
import { db } from '../src/prisma/db.ts';

const existante = await db.orm.avis_de_valeur.ReferentielVersion.where({ actif: true }).first();

if (existante) {
  console.log('Une version active existe déjà — rien à faire.');
} else {
  const cree = await db.orm.avis_de_valeur.ReferentielVersion.create({
    contenu: REFERENTIEL_PAR_DEFAUT,
    actif: true,
  });
  console.log('Référentiel initial créé :', cree?.id ?? '(ok)');
}

await db.close();
