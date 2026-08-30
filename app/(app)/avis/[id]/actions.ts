'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { exigerConseiller } from '@/src/auth/session';
import type { AvisDraft } from '@/src/calcul/types';
import {
  chargerAvis,
  enregistrerAvis,
  enregistrerBrouillon,
  refigerAvis,
  supprimerAvis,
  type EntetesAvis,
} from '@/src/donnees/avis';
import { referentielPourModification } from '@/src/donnees/referentiel';

/** Autosave d'un changement d'étape. Ne touche pas aux montants figés. */
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
 * Enregistrement définitif (fin du formulaire).
 *
 * - Brouillon : première finalisation, recalcul avec le référentiel actif.
 * - Avis déjà enregistré : modification. Le barème appliqué est décidé par
 *   `referentielPourModification` — par défaut celui d'origine, pour rester
 *   cohérent avec le document déjà remis (voir `baremeModification.ts`).
 */
export async function finaliserAvis(
  id: string,
  draft: AvisDraft,
  entetes: EntetesAvis,
): Promise<void> {
  const conseiller = await exigerConseiller();
  const avis = await chargerAvis(id, conseiller.idapimo);
  if (!avis) throw new Error('Avis de valeur introuvable.');

  const referentiel = await referentielPourModification(avis);
  const ok = await enregistrerAvis(id, conseiller.idapimo, draft, entetes, referentiel);
  if (!ok) throw new Error('Avis de valeur introuvable.');

  revalidatePath('/avis');
  redirect(`/avis/${id}`);
}

/**
 * Écran 7 — « Enregistrer les modifications ». Re-fige les montants d'un avis
 * enregistré à partir de son état courant en base (étapes modifiées et
 * autosauvegardées), avec le même barème que `finaliserAvis`.
 */
export async function enregistrerModifications(id: string): Promise<void> {
  const conseiller = await exigerConseiller();
  const avis = await chargerAvis(id, conseiller.idapimo);
  if (!avis) throw new Error('Avis de valeur introuvable.');

  const referentiel = await referentielPourModification(avis);
  const ok = await refigerAvis(id, conseiller.idapimo, referentiel);
  if (!ok) throw new Error('Modification impossible.');

  revalidatePath('/avis');
  revalidatePath(`/avis/${id}`);
}

export async function supprimer(id: string): Promise<void> {
  const conseiller = await exigerConseiller();
  await supprimerAvis(id, conseiller.idapimo);
  revalidatePath('/avis');
  redirect('/avis');
}
