import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

/**
 * Bouton — COMPONENTS.md § Boutons.
 * Les variantes sont celles du handoff, pas celles de shadcn par défaut.
 * Hauteur tactile minimale 48 px sur mobile : le conseiller saisit debout.
 */
const boutonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-display font-bold ' +
    'transition-all outline-none disabled:pointer-events-none ' +
    'focus-visible:shadow-[var(--ring-focus)] ' +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        primary:
          'rounded-[16px] bg-[var(--youlive-orange)] text-white shadow-[var(--shadow-primary)] ' +
          'active:bg-[var(--youlive-orange-pressed)] active:shadow-none ' +
          'disabled:bg-[var(--neutral-100)] disabled:text-[var(--neutral-500)] disabled:shadow-none',
        secondary:
          'rounded-[16px] border-[1.5px] border-[var(--neutral-400)] bg-white text-black ' +
          'active:bg-[var(--neutral-100)] ' +
          'disabled:bg-[var(--neutral-100)] disabled:text-[var(--neutral-500)] disabled:border-transparent',
        'ghost-danger':
          'rounded-[16px] text-[var(--minus)] hover:bg-[var(--minus-bg)] disabled:text-[var(--neutral-500)]',
        ghost:
          'rounded-[14px] text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] hover:text-black',
      },
      taille: {
        // Mobile pleine largeur : padding vertical 15–16 px, ≥ 48 px de haut.
        pleine: 'min-h-[48px] w-full px-[30px] py-[15px] text-[16px]',
        defaut: 'min-h-[48px] px-[30px] py-[13px] text-[15px] md:min-h-0',
        compact: 'min-h-[40px] px-[16px] py-[9px] text-[14px]',
        icone: 'size-[44px] rounded-[12px] p-0',
      },
    },
    defaultVariants: { variant: 'primary', taille: 'defaut' },
  },
);

function Button({
  className,
  variant,
  taille,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof boutonVariants> & { asChild?: boolean }) {
  const Composant = asChild ? Slot.Root : 'button';
  return (
    <Composant
      data-slot="button"
      className={cn(boutonVariants({ variant, taille, className }))}
      {...props}
    />
  );
}

export { Button, boutonVariants };
