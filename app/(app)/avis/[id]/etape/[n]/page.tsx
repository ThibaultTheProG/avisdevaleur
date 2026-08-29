import { notFound, redirect } from 'next/navigation';
import { exigerConseiller } from '@/src/auth/session';
import { chargerAvis } from '@/src/donnees/avis';
import { referentielActif } from '@/src/donnees/referentiel';
import { FormulaireAvis } from '@/src/ui/formulaire/formulaire-avis';
import { NB_ETAPES } from '@/src/ui/formulaire/etapes';
import { finaliserAvis, sauvegarderEtape } from '../../actions';

export const runtime = 'nodejs';

export default async function PageEtape({
  params,
}: {
  params: Promise<{ id: string; n: string }>;
}) {
  const { id, n } = await params;
  const etape = Number(n);
  if (!Number.isInteger(etape) || etape < 1 || etape > NB_ETAPES) {
    redirect(`/avis/${id}/etape/1`);
  }

  const conseiller = await exigerConseiller();
  // Filtré sur le conseiller : forcer l'identifiant d'un autre donne un 404,
  // jamais l'avis.
  const avis = await chargerAvis(id, conseiller.idapimo);
  if (!avis) notFound();

  const referentiel = await referentielActif();

  return (
    <FormulaireAvis
      avis={avis}
      referentiel={referentiel.contenu}
      etape={etape}
      sauvegarder={sauvegarderEtape}
      finaliser={finaliserAvis}
    />
  );
}
