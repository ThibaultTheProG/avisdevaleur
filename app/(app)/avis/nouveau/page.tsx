import { exigerConseiller } from '@/src/auth/session';
import { referentielActif } from '@/src/donnees/referentiel';
import { ChoixTypeBien } from './choix';

export const runtime = 'nodejs';
export const metadata = { title: 'Nouvel avis de valeur' };

export default async function PageNouvelAvis() {
  await exigerConseiller();
  const referentiel = await referentielActif();
  return <ChoixTypeBien medianes={referentiel.contenu.surfaceMediane} />;
}
