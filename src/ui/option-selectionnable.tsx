'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Un choix que le conseiller sélectionne : pastille d'option d'un critère,
 * carte maison / appartement, cran de tendance de marché.
 *
 * Ce que le composant tient, et qui ne doit pas diverger d'un écran à l'autre :
 * la bordure de 2 px qui passe à l'orange Youlive une fois l'option retenue,
 * le curseur, la transition, l'anneau de focus et le câblage ARIA. Tout le
 * reste — rayon, fond, espacement, contenu — appartient à l'appelant, car
 * c'est précisément ce qui distingue une pastille d'une grande carte tactile.
 */
export function OptionSelectionnable({
  selectionnee,
  semantique = 'bascule',
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & {
  selectionnee: boolean;
  /**
   * `'bascule'` → `aria-pressed` : l'option peut être activée seule.
   * `'radio'`   → `role="radio"` + `aria-checked` ; le conteneur doit alors
   *               porter `role="radiogroup"`.
   */
  semantique?: 'bascule' | 'radio';
}) {
  const aria =
    semantique === 'radio'
      ? ({ role: 'radio', 'aria-checked': selectionnee } as const)
      : ({ 'aria-pressed': selectionnee } as const);

  return (
    <button
      type="button"
      {...aria}
      data-selectionnee={selectionnee || undefined}
      className={cn(
        'cursor-pointer border-2 transition outline-none focus-visible:shadow-[var(--ring-focus)]',
        selectionnee && 'border-[var(--youlive-orange)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
