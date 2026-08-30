/**
 * Résumé, étape par étape, des valeurs saisies dans un avis de valeur.
 *
 * Alimente les 5 cartes « MODIFIER UNE ÉTAPE » de l'écran 7 (SCREENS.md § 7).
 * Fonction pure : mêmes entrées que le calculateur, aucun accès aux données.
 */

import { criteres } from './catalogue.ts';
import {
  euros,
  eurosParM2,
  eurosSignes,
  metresCarres,
  pourcentageSigne,
  TIRET_ABSENCE,
} from './formater.ts';
import type { AvisDraft, Categorie, Resultat } from './types.ts';

/** Champs d'identité et de bien nécessaires au résumé de l'étape 1. */
export type EntetesResume = {
  clientNom?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
};

export type EtapeResume = {
  /** Résumé des valeurs saisies — ex. « 120 m² · 3 200 €/m² · DPE E · réf. 336 000 € ». */
  resume: string;
  /** Total signé de l'étape, pour les étapes 3 et 4 seulement ; `null` ailleurs. */
  total: string | null;
};

const CRAN_LIBELLE: Record<string, string> = {
  haussier: 'Marché haussier',
  equilibre: 'Marché équilibré',
  baissier: 'Marché baissier',
};

function libellesActifs(draft: AvisDraft, categorie: Categorie): string[] {
  return criteres(draft.type, categorie)
    .filter((critere) => draft.lignes[critere.cle]?.active)
    .map((critere) => critere.libelle);
}

/** « A · B · C » puis « +2 » au-delà de trois éléments. */
function enumeration(libelles: string[], quandVide: string): string {
  if (libelles.length === 0) return quandVide;
  if (libelles.length <= 3) return libelles.join(' · ');
  return `${libelles.slice(0, 3).join(' · ')} +${libelles.length - 3}`;
}

export function resumeEtapes(
  draft: AvisDraft,
  entetes: EntetesResume,
  resultat: Resultat,
): [EtapeResume, EtapeResume, EtapeResume, EtapeResume, EtapeResume] {
  const lieu = [
    entetes.adresse,
    [entetes.codePostal, entetes.ville].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  const majorations = libellesActifs(draft, 'majoration');
  const minorations = libellesActifs(draft, 'minoration');

  return [
    {
      resume:
        [entetes.clientNom, lieu].filter(Boolean).join(' · ') || 'Client et bien à renseigner',
      total: null,
    },
    {
      resume: [
        metresCarres(draft.surfaceHabitable ?? null),
        eurosParM2(draft.prixM2 ?? null),
        `DPE ${draft.dpe ?? TIRET_ABSENCE}`,
        `réf. ${euros(resultat.prixReference)}`,
      ].join(' · '),
      total: null,
    },
    {
      resume: enumeration(majorations, 'Aucune majoration'),
      total: majorations.length > 0 ? eurosSignes(resultat.totalMajorations, 'majoration') : null,
    },
    {
      resume: enumeration(minorations, 'Aucune minoration'),
      total: minorations.length > 0 ? eurosSignes(resultat.totalMinorations, 'minoration') : null,
    },
    {
      resume: `${CRAN_LIBELLE[draft.tendanceCran] ?? '—'} · ${pourcentageSigne(draft.tendancePourcentage)}`,
      total: null,
    },
  ];
}
