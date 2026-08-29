import { REFERENTIEL_PAR_DEFAUT } from '../calcul/referentielParDefaut.ts';
import type { Referentiel } from '../calcul/types.ts';
import { db } from '../prisma/db.ts';

export type VersionReferentiel = {
  id: string;
  contenu: Referentiel;
  creeLe: string;
  creeParIdapimo: number | null;
};

/**
 * Version active du référentiel. C'est elle, jamais la constante par défaut,
 * qui alimente le calculateur : l'écran 9 fait foi.
 */
export async function referentielActif(): Promise<VersionReferentiel> {
  const version = await db.orm.avis_de_valeur.ReferentielVersion
    .where({ actif: true })
    .orderBy((v) => v.creeLe.desc())
    .first();

  if (!version) {
    throw new Error(
      'Aucune version active du référentiel. Lancez `node scripts/seed-referentiel.ts`.',
    );
  }

  return {
    id: version.id,
    // Le contenu est du JSONB : on le fusionne avec les valeurs par défaut pour
    // qu'un groupe ajouté au code mais absent d'une vieille version ne casse pas
    // le calcul.
    contenu: { ...REFERENTIEL_PAR_DEFAUT, ...(version.contenu as Partial<Referentiel>) },
    creeLe: version.creeLe,
    creeParIdapimo: version.creeParIdapimo,
  };
}

/**
 * Publie une nouvelle version et désactive la précédente. On n'écrase jamais
 * une version en place : les avis déjà enregistrés y font référence.
 */
export async function publierReferentiel(
  contenu: Referentiel,
  creeParIdapimo: number,
): Promise<string> {
  const actives = await db.orm.avis_de_valeur.ReferentielVersion
    .where({ actif: true })
    .select('id')
    .all();

  const nouvelle = await db.orm.avis_de_valeur.ReferentielVersion.create({
    contenu,
    actif: true,
    creeParIdapimo,
  });

  for (const ancienne of actives) {
    await db.orm.avis_de_valeur.ReferentielVersion
      .where({ id: ancienne.id })
      .update({ actif: false });
  }

  return nouvelle.id;
}
