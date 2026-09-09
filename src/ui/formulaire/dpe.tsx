'use client';

import { euros, pourcentageSigne } from '@/src/calcul/formater';
import type { LettreDpe } from '@/src/calcul/types';
import { couleursDpe, LETTRES_DPE } from '@/src/ui/pastille-dpe';
import { cn } from '@/src/lib/utils';

export function SelecteurDpe({
  valeur,
  onValeur,
  taux,
  contribution,
  bareme,
}: {
  valeur: LettreDpe | null;
  onValeur: (lettre: LettreDpe | null) => void;
  taux: number | null;
  contribution: number | null;
  bareme: 'maison' | 'appartement';
}) {
  const bonus = (taux ?? 0) > 0;
  const neutre = taux === 0;

  return (
    <div className="flex flex-col gap-[10px]">
      <span className="text-[13.5px] font-bold text-black">Diagnostic de performance (DPE)</span>

      <div role="radiogroup" aria-label="Lettre DPE" className="flex gap-[6px]">
        {LETTRES_DPE.map((lettre) => {
          const choisi = valeur === lettre;
          return (
            <button
              key={lettre}
              type="button"
              role="radio"
              aria-checked={choisi}
              onClick={() => onValeur(choisi ? null : lettre)}
              style={couleursDpe(lettre)}
              className={cn(
                'h-[50px] flex-1 cursor-pointer rounded-[14px] font-display text-[18px] font-bold transition lg:h-[52px] lg:w-[52px] lg:flex-none',
                choisi && 'outline-[3px] outline-offset-2 outline-black',
              )}
            >
              {lettre}
            </button>
          );
        })}
      </div>

      {valeur && taux !== null && (
        <div
          className={cn(
            'rounded-[14px] px-[14px] py-[12px]',
            neutre
              ? 'bg-[var(--neutral-100)]'
              : bonus
                ? 'bg-[var(--plus-bg)]'
                : 'bg-[var(--minus-bg)]',
          )}
        >
          <div className="flex items-center justify-between gap-[12px]">
            <span className="text-[13.5px] font-bold text-black">
              DPE {valeur} ·{' '}
              {neutre ? 'neutre' : `${bonus ? 'bonus' : 'malus'} ${pourcentageSigne(taux)}`}
            </span>
            <span
              className={cn(
                'font-display text-[15.5px] font-bold',
                neutre
                  ? 'text-[var(--neutral-600)]'
                  : bonus
                    ? 'text-[var(--plus)]'
                    : 'text-[var(--minus)]',
              )}
            >
              {contribution === null || neutre
                ? euros(contribution)
                : `${bonus ? '+' : '−'} ${euros(Math.abs(contribution))}`}
            </span>
          </div>
          <p className="mt-[4px] text-[12.5px] text-[var(--neutral-600)] italic">
            barème {bareme}
          </p>
        </div>
      )}
    </div>
  );
}
