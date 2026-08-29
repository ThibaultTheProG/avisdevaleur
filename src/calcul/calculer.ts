import { criteres } from './catalogue.ts';
import type {
  AvisDraft,
  Categorie,
  Contribution,
  LigneSaisie,
  Referentiel,
  Resultat,
} from './types.ts';
import type { Critere } from './catalogue.ts';

/**
 * Calcul d'un avis de valeur — fonction pure, partagée par le formulaire, le
 * panneau de résultat et le document (REGLES_DE_CALCUL.md).
 *
 * La précision est conservée de bout en bout : l'arrondi à l'euro n'a lieu
 * qu'à l'affichage, dans formater.ts.
 */

function nombre(valeur: number | null | undefined): number | null {
  return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null;
}

/**
 * Contribution d'une ligne, toujours positive : le sens est porté par la
 * catégorie. Renvoie null si la ligne est inactive ou incomplète — elle
 * conserve alors ses valeurs saisies sans rien contribuer.
 */
function contribuer(
  critere: Critere,
  ligne: LigneSaisie | undefined,
  prixReference: number,
  prixM2: number | null,
  referentiel: Referentiel,
): { montant: number; plafonnee: boolean } | null {
  if (!ligne?.active) return null;

  switch (critere.kind) {
    case 'surface': {
      const surface = nombre(ligne.surface);
      if (surface === null || prixM2 === null) return null;
      // Le taux vient de l'option choisie quand le critère en propose une
      // (souplex / sous-sol), sinon du référentiel.
      const taux = critere.options
        ? critere.options.find((o) => o.valeur === ligne.option)?.taux
        : critere.tauxRef
          ? referentiel.tauxSurface[critere.tauxRef]
          : undefined;
      if (taux === undefined) return null;
      return { montant: surface * prixM2 * taux, plafonnee: false };
    }

    case 'pourcentage': {
      const saisi = nombre(ligne.pourcentage);
      if (saisi === null) return null;
      const plafond = critere.plafond ? referentiel.plafonds[critere.plafond] : null;
      const borne = plafond !== null ? Math.min(Math.abs(saisi), plafond) : Math.abs(saisi);
      return { montant: prixReference * borne, plafonnee: plafond !== null && Math.abs(saisi) > plafond };
    }

    case 'coutM2': {
      const surface = nombre(ligne.surface);
      const cout = nombre(ligne.coutM2) ?? (critere.coutM2Ref ? referentiel.coutM2[critere.coutM2Ref] : null);
      if (surface === null || cout === null) return null;
      // En euros : non proportionnel au prix de référence.
      return { montant: surface * cout, plafonnee: false };
    }

    case 'montant': {
      const montant = nombre(ligne.montant);
      if (montant === null) return null;
      return { montant: Math.abs(montant), plafonnee: false };
    }

    case 'options': {
      const taux = critere.options?.find((o) => o.valeur === ligne.option)?.taux;
      if (taux === undefined) return null;
      return { montant: prixReference * taux, plafonnee: false };
    }

    case 'interrupteur': {
      if (critere.taux === undefined) return null;
      return { montant: prixReference * critere.taux, plafonnee: false };
    }
  }
}

export function calculerAvis(draft: AvisDraft, referentiel: Referentiel): Resultat {
  const surfaceHabitable = nombre(draft.surfaceHabitable);
  const prixM2 = nombre(draft.prixM2);

  const vide: Resultat = {
    prixReference: null,
    detailDecote: null,
    contributionDpe: 0,
    contributions: [],
    totalMajorations: 0,
    totalMinorations: 0,
    valeurIntrinseque: null,
    valeurRetenue: null,
  };

  // Tant que la surface et le prix au m² ne sont pas saisis, il n'y a pas de
  // calcul : l'étape 1 affiche « — € », jamais « 0 € ».
  if (surfaceHabitable === null || prixM2 === null) return vide;

  const surfaceMediane =
    nombre(draft.surfaceMedianeQuartier) ?? referentiel.surfaceMediane[draft.type];

  const valeurDeBase = surfaceHabitable * prixM2;
  const surfaceExcedent = Math.max(0, surfaceHabitable - surfaceMediane);
  const decoteSurface = surfaceExcedent * prixM2 * referentiel.tauxDecoteGrandeSurface;
  const prixReference = valeurDeBase - decoteSurface;

  const contributionDpe = draft.dpe ? prixReference * referentiel.dpe[draft.type][draft.dpe] : 0;

  const contributions: Contribution[] = [];
  let totalMajorations = 0;
  let totalMinorations = 0;

  for (const categorie of ['majoration', 'minoration'] as Categorie[]) {
    for (const critere of criteres(draft.type, categorie)) {
      const calcul = contribuer(
        critere,
        draft.lignes[critere.cle],
        prixReference,
        prixM2,
        referentiel,
      );
      if (calcul === null) continue;

      contributions.push({
        cle: critere.cle,
        libelle: critere.libelle,
        categorie,
        montant: calcul.montant,
        ...(calcul.plafonnee ? { plafonnee: true } : {}),
      });

      if (categorie === 'majoration') totalMajorations += calcul.montant;
      else totalMinorations += calcul.montant;
    }
  }

  const valeurIntrinseque =
    prixReference + contributionDpe + totalMajorations - totalMinorations;
  const valeurRetenue = valeurIntrinseque * (1 + draft.tendancePourcentage);

  return {
    prixReference,
    detailDecote: { valeurDeBase, surfaceExcedent, decoteSurface },
    contributionDpe,
    contributions,
    totalMajorations,
    totalMinorations,
    valeurIntrinseque,
    valeurRetenue,
  };
}
