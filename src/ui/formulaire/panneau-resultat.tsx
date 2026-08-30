'use client';

import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { euros, eurosSignes, pourcentageSigne } from '@/src/calcul/formater';
import type { Resultat } from '@/src/calcul/types';
import { Button } from '@/src/ui/button';
import { cn } from '@/src/lib/utils';

/**
 * Panneau de résultat — COMPONENTS.md § PanneauResultat.
 * Barre collante dépliable sur mobile, colonne collante de 296 px sur desktop.
 * Jamais d'animation sur les montants : la lisibilité prime.
 */

type Props = {
  resultat: Resultat;
  /** À l'étape 1 le calcul n'a pas encore de valeur. */
  avantCalcul: boolean;
  tendancePourcentage: number;
  derniereEtape: boolean;
  enregistrement: boolean;
  onPrecedent?: () => void;
  onSuivant?: () => void;
  onEnregistrer: () => void;
  titreSuivant?: string;
};

function Ventilation({ resultat, tendancePourcentage }: Pick<Props, 'resultat' | 'tendancePourcentage'>) {
  const lignes: [string, string][] = [
    ['Prix de référence', euros(resultat.prixReference)],
    [
      'DPE',
      resultat.contributionDpe === 0
        ? euros(0)
        : eurosSignes(resultat.contributionDpe, resultat.contributionDpe > 0 ? 'majoration' : 'minoration'),
    ],
    ['Majorations', eurosSignes(resultat.totalMajorations, 'majoration')],
    ['Minorations', eurosSignes(resultat.totalMinorations, 'minoration')],
    ['Tendance du marché', pourcentageSigne(tendancePourcentage)],
  ];
  return (
    <dl className="flex flex-col">
      {lignes.map(([cle, valeur], index) => (
        <div
          key={cle}
          className={cn(
            'flex items-baseline justify-between gap-[12px] py-[9px]',
            index > 0 && 'border-t border-dashed border-[var(--neutral-200)]',
          )}
        >
          <dt className="text-[13.5px] text-[var(--neutral-700)]">{cle}</dt>
          <dd className="font-display text-[14.5px] font-bold text-black">{valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PanneauResultat(props: Props) {
  const {
    resultat,
    avantCalcul,
    tendancePourcentage,
    derniereEtape,
    enregistrement,
    onPrecedent,
    onSuivant,
    onEnregistrer,
    titreSuivant,
  } = props;
  const [deplie, setDeplie] = useState(false);

  const retenue = avantCalcul ? null : resultat.valeurRetenue;

  return (
    <>
      {/* ─── Desktop : colonne collante ─── */}
      <aside className="hidden w-[296px] shrink-0 border-l border-[var(--neutral-100)] bg-white p-[22px] lg:block">
        <div className="sticky top-[22px] flex flex-col gap-[14px]">
          <h3 className="text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
            Résultat en direct
          </h3>

          <div className="rounded-[18px] bg-[var(--app-bg)] p-[14px]">
            <p className="text-[12.5px] text-[var(--neutral-700)]">Valeur intrinsèque</p>
            <p className="mt-[2px] font-display text-[22px] leading-[1.15] font-bold text-black">
              {euros(avantCalcul ? null : resultat.valeurIntrinseque)}
            </p>
          </div>

          <div className="rounded-[18px] border-2 border-[var(--youlive-orange-soft)] bg-[var(--youlive-orange-faint)] p-[14px]">
            <p className="text-[12.5px] text-[var(--neutral-700)]">Valeur retenue</p>
            <p className="mt-[2px] font-display text-[32px] leading-[1.1] font-bold text-[var(--youlive-orange)]">
              {euros(retenue)}
            </p>
          </div>

          {avantCalcul ? (
            <p className="text-[12.5px] leading-[1.4] text-[var(--neutral-600)] italic">
              Le calcul démarre à l’étape 2.
            </p>
          ) : (
            <Ventilation resultat={resultat} tendancePourcentage={tendancePourcentage} />
          )}

          <Button
            type="button"
            onClick={onEnregistrer}
            disabled={!derniereEtape || enregistrement}
            taille="pleine"
          >
            {enregistrement ? 'Enregistrement…' : 'Enregistrer l’avis de valeur'}
          </Button>
          {!derniereEtape && (
            <p className="text-[12px] text-[var(--neutral-600)] italic">
              Disponible à la dernière étape.
            </p>
          )}
        </div>
      </aside>

      {/* ─── Mobile : barre collante, dépliable en récapitulatif ─── */}
      {deplie && (
        <button
          type="button"
          aria-label="Replier le détail"
          onClick={() => setDeplie(false)}
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
        />
      )}
      <div className="sticky bottom-0 z-40 lg:hidden">
        {deplie && (
          <div className="rounded-t-[26px] bg-white px-[18px] pt-[10px] pb-[16px] shadow-[var(--shadow-sheet)]">
            <span className="mx-auto block h-[4px] w-[44px] rounded-full bg-[var(--neutral-300)]" />
            <div className="mt-[14px]">
              <Ventilation resultat={resultat} tendancePourcentage={tendancePourcentage} />
            </div>
            <div className="mt-[12px] rounded-[18px] bg-[var(--youlive-orange-faint)] p-[14px]">
              <p className="text-[12.5px] text-[var(--neutral-700)]">Valeur retenue</p>
              <p className="mt-[2px] font-display text-[30px] leading-[1.1] font-bold text-[var(--youlive-orange)]">
                {euros(retenue)}
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'border-t border-[var(--neutral-100)] bg-white px-[18px] pt-[12px] pb-[16px]',
            !deplie && 'shadow-[var(--shadow-sticky)]',
          )}
        >
          <div className="flex items-center justify-between gap-[12px]">
            <div className="min-w-0">
              <p className="text-[12.5px] text-[var(--neutral-700)]">Valeur retenue</p>
              <p className="font-display text-[26px] leading-[1.1] font-bold text-black">
                {euros(retenue)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeplie((v) => !v)}
              aria-expanded={deplie}
              className="flex shrink-0 cursor-pointer items-center gap-[6px] text-[13px] font-bold text-[var(--youlive-orange-ink)]"
            >
              Détail
              <span className="grid size-[26px] place-items-center rounded-full bg-[var(--youlive-orange-soft)]">
                <ChevronUp className={cn('size-[15px] transition', deplie && 'rotate-180')} />
              </span>
            </button>
          </div>

          <div className="mt-[12px] flex gap-[10px]">
            {onPrecedent && (
              <Button type="button" variant="secondary" onClick={onPrecedent} className="w-[120px] px-0">
                Précédent
              </Button>
            )}
            {derniereEtape ? (
              <Button type="button" onClick={onEnregistrer} disabled={enregistrement} className="flex-1 px-[16px]">
                {enregistrement ? 'Enregistrement…' : 'Enregistrer l’avis de valeur'}
              </Button>
            ) : (
              <Button type="button" onClick={onSuivant} className="flex-1 px-[16px]">
                Suivant{titreSuivant ? ` · ${titreSuivant}` : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
