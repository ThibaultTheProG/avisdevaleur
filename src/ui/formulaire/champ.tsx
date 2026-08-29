'use client';

import { useId } from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Champ — COMPONENTS.md § Champ.
 * L'unité (m², €, %, €/m²) est alignée à droite DANS le champ.
 * Le texte d'aide est du contenu métier : toujours affiché.
 */
export function Champ({
  libelle,
  unite,
  aide,
  erreur,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<'input'> & {
  libelle: string;
  unite?: string;
  aide?: string;
  erreur?: string | null;
  inputClassName?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-[6px]', className)}>
      <label htmlFor={id} className="text-[13.5px] font-bold text-black">
        {libelle}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `${id}-erreur` : undefined}
          className={cn(
            'w-full min-w-0 rounded-[14px] border-[1.5px] bg-white px-[14px] py-[13px] text-[15px] text-black outline-none transition',
            'placeholder:text-[var(--neutral-500)]',
            'focus:shadow-[var(--ring-focus)]',
            erreur
              ? 'border-[var(--minus)] text-[var(--minus)] focus:border-[var(--minus)]'
              : 'border-[var(--neutral-200)] focus:border-[var(--youlive-orange)]',
            unite && 'pr-[52px]',
            inputClassName,
          )}
          {...props}
        />
        {unite && (
          <span className="pointer-events-none absolute top-1/2 right-[14px] -translate-y-1/2 text-[13.5px] text-[var(--neutral-600)]">
            {unite}
          </span>
        )}
      </div>
      {aide && (
        <p className="text-[12.5px] leading-[1.4] text-[var(--neutral-600)] italic">{aide}</p>
      )}
      {erreur && (
        <p id={`${id}-erreur`} className="text-[12px] text-[var(--minus)]">
          {erreur}
        </p>
      )}
    </div>
  );
}

/** Champ numérique : inputmode décimal, virgule acceptée. */
export function ChampNombre({
  valeur,
  onValeur,
  ...props
}: Omit<React.ComponentProps<typeof Champ>, 'value' | 'onChange'> & {
  valeur: number | null | undefined;
  onValeur: (valeur: number | null) => void;
}) {
  return (
    <Champ
      type="text"
      inputMode="decimal"
      value={valeur ?? ''}
      onChange={(e) => {
        const brut = e.target.value.replace(',', '.').trim();
        if (brut === '') return onValeur(null);
        const n = Number(brut);
        onValeur(Number.isFinite(n) ? n : null);
      }}
      {...props}
    />
  );
}
