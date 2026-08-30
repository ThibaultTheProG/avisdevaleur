import { notFound, redirect } from 'next/navigation';
import { exigerConseiller } from '@/src/auth/session';
import { donneesDocument } from '@/src/document/document';
import { chargerAvis } from '@/src/donnees/avis';
import { DocumentAvis } from '@/src/ui/document-avis';

export const runtime = 'nodejs';
export const metadata = { title: 'Avis de valeur — document client' };

export default async function PageDocument({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conseiller = await exigerConseiller();
  const avis = await chargerAvis(id, conseiller.idapimo);
  if (!avis) notFound();

  // Un brouillon n'a pas de valeur figée : pas de document à remettre.
  if (avis.statut === 'brouillon') redirect(`/avis/${id}/etape/1`);

  const doc = donneesDocument({
    type: avis.type,
    client: avis.client,
    bien: avis.bien,
    surfaceHabitable: avis.draft.surfaceHabitable ?? null,
    prixM2: avis.draft.prixM2 ?? null,
    dpe: avis.draft.dpe ?? null,
    tendanceCran: avis.draft.tendanceCran,
    // Établi = dernière modification de l'avis.
    etabliLe: avis.modifieLe,
    valeurRetenue: avis.valeurRetenueFigee,
    valeurIntrinseque: avis.valeurIntrinsequeFigee,
    conseiller: {
      nomComplet: conseiller.nomComplet,
      telephone: conseiller.telephone ?? conseiller.mobile,
      email: conseiller.email,
      // RSAC : `utilisateurs.siren`, texte libre, imprimé tel quel.
      siren: conseiller.siren,
    },
  });

  return <DocumentAvis avisId={avis.id} doc={doc} />;
}
