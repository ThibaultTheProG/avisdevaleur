import { exigerAdministrateur } from '@/src/auth/session';
import { dateCourte } from '@/src/calcul/formater';
import { referentielActifDetaille } from '@/src/donnees/referentiel';
import { FormulaireParametres } from '@/src/ui/administration/formulaire-parametres';
import { enregistrerReferentiel } from './actions';

export const runtime = 'nodejs';
export const metadata = { title: 'Administration · Paramètres' };

export default async function PageParametres() {
  // Le layout redirige déjà un non-administrateur ; on referme la porte côté
  // serveur, comme l'exige le handoff.
  await exigerAdministrateur();

  const version = await referentielActifDetaille();

  const auteur = [
    version.auteurPrenom,
    version.auteurNom ? `${version.auteurNom[0]}.` : null,
  ]
    .filter(Boolean)
    .join(' ');
  const derniereModification = auteur
    ? `Dernière modification : ${dateCourte(version.creeLe)} par ${auteur}`
    : `Dernière modification : ${dateCourte(version.creeLe)}`;

  return (
    <FormulaireParametres
      referentiel={version.contenu}
      derniereModification={derniereModification}
      enregistrer={enregistrerReferentiel}
    />
  );
}
