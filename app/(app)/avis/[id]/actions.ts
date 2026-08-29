'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { exigerConseiller } from '@/src/auth/session';
import type { AvisDraft } from '@/src/calcul/types';
import {
  enregistrerAvis,
  enregistrerBrouillon,
  supprimerAvis,
  type EntetesAvis,
} from '@/src/donnees/avis';
import { referentielActif } from '@/src/donnees/referentiel';

/** Autosave d'un changement d'étape. */
export async function sauvegarderEtape(
  id: string,
  draft: AvisDraft,
  entetes: EntetesAvis,
): Promise<{ ok: boolean }> {
  const conseiller = await exigerConseiller();
  const ok = await enregistrerBrouillon(id, conseiller.idapimo, draft, entetes);
  return { ok };
}

/**
 * Enregistrement définitif. Le recalcul se fait avec le référentiel ACTIF :
 * modifier un avis est un acte nouveau (décision de cadrage), et les montants
 * sont figés avec la version qui les a produits.
 */
export async function finaliserAvis(
  id: string,
  draft: AvisDraft,
  entetes: EntetesAvis,
): Promise<void> {
  const conseiller = await exigerConseiller();
  const referentiel = await referentielActif();
  const ok = await enregistrerAvis(id, conseiller.idapimo, draft, entetes, referentiel);
  if (!ok) throw new Error('Avis de valeur introuvable.');

  revalidatePath('/avis');
  redirect(`/avis/${id}`);
}

export async function supprimer(id: string): Promise<void> {
  const conseiller = await exigerConseiller();
  await supprimerAvis(id, conseiller.idapimo);
  revalidatePath('/avis');
  redirect('/avis');
}
