'use server';

import { redirect } from 'next/navigation';
import { exigerConseiller } from '@/src/auth/session';
import type { TypeBien } from '@/src/calcul/types';
import { creerBrouillon } from '@/src/donnees/avis';
import { referentielActif } from '@/src/donnees/referentiel';

export async function demarrerAvis(formData: FormData) {
  const conseiller = await exigerConseiller();
  const type = formData.get('type');
  if (type !== 'maison' && type !== 'appartement') {
    throw new Error('Type de bien invalide.');
  }

  const referentiel = await referentielActif();
  const id = await creerBrouillon(conseiller.idapimo, type as TypeBien, referentiel);

  // Le brouillon existe dès le choix du type : création et modification
  // partagent ensuite le même formulaire.
  redirect(`/avis/${id}/etape/1`);
}
