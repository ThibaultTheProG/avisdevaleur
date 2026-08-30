'use client';

import { useState } from 'react';
import { ArrowLeft, Building2, House } from 'lucide-react';
import Link from 'next/link';
import type { TypeBien } from '@/src/calcul/types';
import { metresCarres } from '@/src/calcul/formater';
import { Button } from '@/src/ui/button';
import { cn } from '@/src/lib/utils';
import { demarrerAvis } from './actions';

export function ChoixTypeBien({
  medianes,
}: {
  medianes: Record<TypeBien, number>;
}) {
  const [type, setType] = useState<TypeBien | null>(null);

  const cartes = [
    { valeur: 'maison' as const, libelle: 'Maison', Icone: House },
    { valeur: 'appartement' as const, libelle: 'Appartement', Icone: Building2 },
  ];

  return (
    <form
      action={demarrerAvis}
      className="mx-auto w-full max-w-[620px] px-[20px] py-[24px] lg:px-[34px] lg:py-[30px]"
    >
      <Link
        href="/avis"
        className="inline-flex items-center gap-[6px] text-[14px] font-bold text-[var(--neutral-700)] transition hover:text-black"
      >
        <ArrowLeft className="size-[18px]" />
        Retour
      </Link>

      <h1 className="mt-[16px] font-display text-[26px] leading-[1.15] font-bold text-black lg:text-[28px]">
        Quel bien allez-vous évaluer ?
      </h1>
      <p className="mt-[8px] text-[14.5px] leading-[1.45] text-[var(--neutral-700)]">
        Le formulaire et le barème DPE s’adaptent au type de bien.
      </p>

      <div className="mt-[22px] flex flex-col gap-[12px] sm:flex-row">
        {cartes.map(({ valeur, libelle, Icone }) => {
          const choisi = type === valeur;
          return (
            <button
              key={valeur}
              type="button"
              onClick={() => setType(valeur)}
              aria-pressed={choisi}
              className={cn(
                'flex-1 cursor-pointer rounded-[22px] border-2 bg-white p-[26px] text-left transition',
                choisi
                  ? 'border-[var(--youlive-orange)] shadow-[var(--shadow-calc)]'
                  : 'border-[var(--neutral-100)] shadow-[var(--shadow-card)] hover:border-[var(--neutral-300)]',
              )}
            >
              <span
                className={cn(
                  'grid size-[72px] place-items-center rounded-[22px] transition',
                  choisi
                    ? 'bg-[var(--youlive-orange)] text-white'
                    : 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]',
                )}
              >
                <Icone className="size-[34px]" />
              </span>
              <span className="mt-[16px] block font-display text-[19px] font-bold text-black">
                {libelle}
              </span>
              <span className="mt-[4px] block text-[13px] leading-[1.4] text-[var(--neutral-600)]">
                Surface médiane de référence : {metresCarres(medianes[valeur])}
              </span>
            </button>
          );
        })}
      </div>

      <input type="hidden" name="type" value={type ?? ''} />
      <Button type="submit" taille="pleine" disabled={!type} className="mt-[26px]">
        Commencer
      </Button>
    </form>
  );
}
