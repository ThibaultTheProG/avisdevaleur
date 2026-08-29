import { exigerConseiller } from '@/src/auth/session';
import { listerAvis } from '@/src/donnees/avis';
import { ListeAvis } from './liste';

export const runtime = 'nodejs';
export const metadata = { title: 'Mes avis de valeur' };

export default async function PageAvis() {
  const conseiller = await exigerConseiller();
  const avis = await listerAvis(conseiller.idapimo);

  return <ListeAvis avis={avis} prenom={conseiller.prenom ?? conseiller.nomComplet} />;
}
