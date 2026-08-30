'use client';

import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ETAPES } from './etapes';


type Props = {
  etape: number;
  /** Étapes terminées, donc cliquables. */
  terminees: number[];
  /** Nombre de lignes actives, indexé par numéro d'étape (3 et 4). */
  compteurs?: Record<number, number>;
  onAller: (etape: number) => void;
};

/**
 * Fil d'étapes — COMPONENTS.md § Stepper. Rangée compacte, rail à partir de `xl`.
 *
 * Le handoff annonce le rail dès 1024 px (DESIGN_TOKENS.md § Points de rupture)
 * mais dessine à 1400 px : à 1024, menu 232 + rail 238 + panneau 296 + marges 94
 * ne laissent que 164 px de contenu, moins qu'un seul bouton. Le rail attend donc
 * `xl` ; en dessous, cette rangée porte les mêmes informations, titre compris.
 */
export function FilEtapesMobile({ etape, terminees, onAller }: Props) {
  return (
    <div className="xl:hidden">
      <ol className="flex items-center">
        {ETAPES.map((_, index) => {
          const numero = index + 1;
          const fini = terminees.includes(numero) && numero !== etape;
          const courante = numero === etape;
          const accessible = fini;
          return (
            <li key={numero} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!accessible}
                onClick={() => accessible && onAller(numero)}
                aria-current={courante ? 'step' : undefined}
                aria-label={`Étape ${numero} — ${ETAPES[index]}`}
                className={cn(
                  'grid shrink-0 cursor-pointer place-items-center rounded-full font-display font-bold transition',
                  'disabled:cursor-default',
                  courante
                    ? 'size-[38px] border-[2.5px] border-[var(--youlive-orange)] bg-white text-[15px] text-[var(--youlive-orange)]'
                    : fini
                      ? 'size-[32px] bg-[var(--youlive-orange)] text-white'
                      : 'size-[32px] bg-[var(--neutral-100)] text-[14px] text-[var(--neutral-600)]',
                )}
              >
                {fini ? <Check className="size-[16px]" /> : numero}
              </button>
              {numero < ETAPES.length && (
                <span
                  className={cn(
                    'mx-[4px] h-[2px] flex-1',
                    numero < etape ? 'bg-[var(--youlive-orange)]' : 'bg-[var(--neutral-200)]',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-[16px] text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
        Étape {etape} sur {ETAPES.length}
      </p>
      <h2 className="mt-[4px] font-display text-[21px] leading-[1.2] font-bold text-black">
        {ETAPES[etape - 1]}
      </h2>
    </div>
  );
}

export function RailEtapes({ etape, terminees, compteurs, onAller }: Props) {
  return (
    <nav className="hidden w-[238px] shrink-0 xl:block">
      <ol className="flex flex-col gap-[4px]">
        {ETAPES.map((titre, index) => {
          const numero = index + 1;
          const courante = numero === etape;
          const fini = terminees.includes(numero) && !courante;
          const compteur = compteurs?.[numero];
          return (
            <li key={numero}>
              <button
                type="button"
                disabled={!fini}
                onClick={() => fini && onAller(numero)}
                aria-current={courante ? 'step' : undefined}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-[10px] rounded-[14px] px-[12px] py-[11px] text-left text-[14px] font-bold transition',
                  'disabled:cursor-default',
                  courante
                    ? 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]'
                    : fini
                      ? 'text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]'
                      : 'text-[var(--neutral-500)]',
                )}
              >
                <span
                  className={cn(
                    'grid size-[24px] shrink-0 place-items-center rounded-full text-[12.5px]',
                    courante
                      ? 'bg-[var(--youlive-orange)] text-white'
                      : fini
                        ? 'bg-[var(--youlive-orange)] text-white'
                        : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
                  )}
                >
                  {fini ? <Check className="size-[13px]" /> : numero}
                </span>
                <span className="min-w-0 flex-1 truncate">{titre}</span>
                {compteur !== undefined && compteur > 0 && (
                  <span className="font-display text-[13px] text-[var(--plus)]">{compteur}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-[14px] px-[12px] text-[12px] leading-[1.4] text-[var(--neutral-500)] italic">
        Cliquez sur une étape terminée pour y revenir.
      </p>
    </nav>
  );
}
