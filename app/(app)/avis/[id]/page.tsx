import { notFound, redirect } from 'next/navigation';
import { exigerConseiller } from '@/src/auth/session';
import { calculerAvis } from '@/src/calcul/calculer';
import { resumeEtapes } from '@/src/calcul/resumeEtapes';
import { chargerAvis } from '@/src/donnees/avis';
import { MODE_BAREME_MODIFICATION } from '@/src/donnees/baremeModification';
import { referentielPourModification } from '@/src/donnees/referentiel';
import { VueAvis } from '@/src/ui/vue-avis';
import { enregistrerModifications, supprimer } from './actions';

export const runtime = 'nodejs';
export const metadata = { title: 'Avis de valeur' };

export default async function PageAvisDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conseiller = await exigerConseiller();
  // Filtré sur le conseiller : forcer l'identifiant d'un autre donne un 404.
  const avis = await chargerAvis(id, conseiller.idapimo);
  if (!avis) notFound();

  // Un brouillon n'a pas d'écran de consultation : il s'édite directement.
  if (avis.statut === 'brouillon') redirect(`/avis/${id}/etape/1`);

  // Le résumé de chaque étape est recalculé avec le barème de l'avis : il
  // reproduit donc exactement les montants figés.
  const referentiel = await referentielPourModification(avis);
  const resultat = calculerAvis(avis.draft, referentiel.contenu);
  const etapes = resumeEtapes(
    avis.draft,
    {
      clientNom: avis.client.nom,
      adresse: avis.bien.adresse,
      codePostal: avis.bien.codePostal,
      ville: avis.bien.ville,
    },
    resultat,
  );

  return (
    <VueAvis
      avis={{
        id: avis.id,
        type: avis.type,
        clientNom: avis.client.nom,
        adresse: avis.bien.adresse,
        codePostal: avis.bien.codePostal,
        ville: avis.bien.ville,
        creeLe: avis.creeLe,
        modifieLe: avis.modifieLe,
        valeurIntrinseque: avis.valeurIntrinsequeFigee,
        valeurRetenue: avis.valeurRetenueFigee,
      }}
      etapes={etapes}
      baremeOrigine={MODE_BAREME_MODIFICATION === 'origine'}
      enregistrerModifications={enregistrerModifications}
      supprimer={supprimer}
    />
  );
}
