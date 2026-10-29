'use client';

import { useId } from 'react';
import { ExternalLink } from 'lucide-react';
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
  lien,
  erreur,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<'input'> & {
  libelle: string;
  unite?: string;
  aide?: string;
  /** Source externe où le conseiller va chercher la valeur, ouverte dans un nouvel onglet. */
  lien?: { href: string; libelle: string };
  erreur?: string | null;
  inputClassName?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-[6px]', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[2px]">
        <label htmlFor={id} className="text-[13.5px] font-bold text-black">
          {libelle}
        </label>
        {lien && (
          <a
            href={lien.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[4px] text-[12.5px] font-semibold text-[var(--youlive-orange)] underline-offset-2 hover:underline"
          >
            {lien.libelle}
            <ExternalLink aria-hidden className="size-[13px]" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        )}
      </div>
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

/**
 * Champ de texte libre — même gabarit que `Champ` (libellé, aide), un
 * `textarea` de deux lignes à la place de l'`input`. Pas de redimensionnement :
 * la hauteur de la carte de critère reste prévisible.
 */
export function ChampTexte({
  libelle,
  aide,
  className,
  textareaClassName,
  ...props
}: React.ComponentProps<'textarea'> & {
  libelle: string;
  aide?: string;
  textareaClassName?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-[6px]', className)}>
      <label htmlFor={id} className="text-[13.5px] font-bold text-black">
        {libelle}
      </label>
      <textarea
        id={id}
        rows={2}
        className={cn(
          'w-full min-w-0 resize-none rounded-[14px] border-[1.5px] border-[var(--neutral-200)] bg-white px-[14px] py-[13px] text-[15px] leading-[1.45] text-black outline-none transition',
          'placeholder:text-[var(--neutral-500)]',
          'focus:border-[var(--youlive-orange)] focus:shadow-[var(--ring-focus)]',
          textareaClassName,
        )}
        {...props}
      />
      {aide && (
        <p className="text-[12.5px] leading-[1.4] text-[var(--neutral-600)] italic">{aide}</p>
      )}
    </div>
  );
}
