import { LETTRES_DPE, type LettreDpe } from '@/src/calcul/types';
import { cn } from '@/src/lib/utils';

/**
 * La lettre DPE et sa couleur — déclarées **ici et nulle part ailleurs**.
 *
 * Trois écrans l'affichent : le sélecteur du formulaire (étape 3), le document
 * client (écran 8) et le barème de l'administration (écran 9). Chacun portait
 * sa propre copie de la palette et de la règle de contraste ; trois copies,
 * c'est trois occasions de diverger sur des couleurs qui sont réglementaires.
 */

export { LETTRES_DPE };

/** Couleurs officielles françaises du diagnostic. */
const FONDS: Record<LettreDpe, string> = {
  A: 'var(--dpe-a)',
  B: 'var(--dpe-b)',
  C: 'var(--dpe-c)',
  D: 'var(--dpe-d)',
  E: 'var(--dpe-e)',
  F: 'var(--dpe-f)',
  G: 'var(--dpe-g)',
};

/**
 * Fond et encre d'une lettre. Le texte est blanc partout sauf sur le D, dont
 * le jaune impose une encre sombre pour rester lisible.
 */
export function couleursDpe(lettre: LettreDpe): { background: string; color: string } {
  return {
    background: FONDS[lettre],
    color: lettre === 'D' ? 'var(--dpe-d-ink)' : '#fff',
  };
}

/**
 * Pastille non interactive. La taille et le rayon varient d'un écran à
 * l'autre : ils restent à la charge de l'appelant, via `className`.
 */
export function PastilleDpe({ lettre, className }: { lettre: LettreDpe; className?: string }) {
  return (
    <span
      className={cn('grid place-items-center font-display font-bold', className)}
      style={couleursDpe(lettre)}
    >
      {lettre}
    </span>
  );
}
