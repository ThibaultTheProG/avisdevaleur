import { redirect } from 'next/navigation';
import { peutAdministrer } from '@/src/auth/autorisations';
import { conseillerConnecte } from '@/src/auth/session';

export const runtime = 'nodejs';

/**
 * Garde de `/administration/*`. Le handoff impose de protéger la route, pas
 * seulement de masquer le lien : chaque page et chaque server action sous ce
 * segment repasse aussi par `exigerAdministrateur()`.
 */
export default async function LayoutAdministration({
  children,
}: {
  children: React.ReactNode;
}) {
  const conseiller = await conseillerConnecte();
  if (!conseiller) redirect('/connexion');
  if (!peutAdministrer(conseiller)) redirect('/avis');

  return <>{children}</>;
}
