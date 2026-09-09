'use server';

import { revalidatePath } from 'next/cache';
import {
  normaliserReferentiel,
  validerReferentiel,
} from '@/src/administration/parametres';
import { exigerAdministrateur } from '@/src/auth/session';
import { publierReferentiel } from '@/src/donnees/referentiel';

/**
 * Publie une nouvelle version du référentiel. Atteignable par POST direct, pas
 * seulement par le formulaire : la garde `exigerAdministrateur()` est ici, pas
 * seulement sur la page. Les avis déjà enregistrés référencent leur propre
 * version et ne bougent pas (`publierReferentiel` n'écrase jamais).
 */
export async function enregistrerReferentiel(
  brut: unknown,
): Promise<{ ok: boolean; erreurs: string[] }> {
  const admin = await exigerAdministrateur();

  // On ne fait jamais confiance à l'objet du client : on le reconstruit.
  const contenu = normaliserReferentiel(brut);
  if (!contenu) {
    return {
      ok: false,
      erreurs: ['Formulaire incomplet : certaines valeurs sont illisibles.'],
    };
  }

  const erreurs = validerReferentiel(contenu);
  if (erreurs.length > 0) return { ok: false, erreurs };

  await publierReferentiel(contenu, admin.idapimo);
  revalidatePath('/administration/parametres');
  // Les nouveaux avis liront la nouvelle version.
  revalidatePath('/avis');

  return { ok: true, erreurs: [] };
}
