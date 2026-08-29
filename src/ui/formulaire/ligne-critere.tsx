'use client';

import type { Critere } from '@/src/calcul/catalogue';
import { euros, pourcentage } from '@/src/calcul/formater';
import type { Categorie, LigneSaisie, Referentiel } from '@/src/calcul/types';
import { Switch } from '@/src/ui/switch';
import { cn } from '@/src/lib/utils';
import { ChampNombre } from './champ';

/**
 * Ligne de critère — COMPONENTS.md § RowCritere.
 * Carte blanche, rayon 18, padding 14. La ligne de contrôle est en retrait de
 * 58 px, alignée sous le libellé. Une ligne désactivée grise ses champs mais
 * conserve les valeurs saisies.
 */
export function LigneCritere({
  critere,
  categorie,
  saisie,
  contribution,
  plafonnee,
  referentiel,
  onChange,
}: {
  critere: Critere;
  categorie: Categorie;
  saisie: LigneSaisie | undefined;
  contribution: number | null;
  plafonnee?: boolean;
  referentiel: Referentiel;
  onChange: (saisie: LigneSaisie) => void;
}) {
  const ligne: LigneSaisie = saisie ?? { active: false };
  const active = ligne.active;
  const majoration = categorie === 'majoration';
  const modifier = (champ: Partial<LigneSaisie>) => onChange({ ...ligne, ...champ });

  const plafond = critere.plafond ? referentiel.plafonds[critere.plafond] : null;
  const plancher = critere.plancher ?? 0;

  return (
    <div
      className={cn(
        'rounded-[18px] border bg-white p-[14px] transition',
        active
          ? majoration
            ? 'border-[var(--plus-bg)] shadow-[var(--shadow-row)]'
            : 'border-[var(--minus-bg)] shadow-[var(--shadow-row)]'
          : 'border-[var(--neutral-100)]',
      )}
    >
      <div className="flex items-start gap-[12px]">
        <Switch
          checked={active}
          onCheckedChange={(coche) => modifier({ active: coche })}
          aria-label={critere.libelle}
          className="mt-[2px]"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[14.5px] leading-[1.3] font-bold',
              active ? 'text-black' : 'text-[var(--neutral-700)]',
            )}
          >
            {critere.libelle}
          </p>
          {critere.aide && (
            <p className="mt-[2px] text-[12.5px] leading-[1.4] text-[var(--neutral-600)] italic">
              {critere.aide}
            </p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 font-display text-[15.5px] font-bold',
            !active
              ? 'text-[var(--neutral-400)]'
              : majoration
                ? 'text-[var(--plus)]'
                : 'text-[var(--minus)]',
          )}
        >
          {contribution === null
            ? '—'
            : `${majoration ? '+' : '−'} ${euros(Math.abs(contribution))}`}
        </span>
      </div>

      {active && (
        <div className="mt-[12px] pl-[58px]">
          {critere.kind === 'surface' && (
            <div className="flex flex-col gap-[8px]">
              {critere.options && (
                <PastillesOptions
                  options={critere.options}
                  valeur={ligne.option ?? null}
                  onValeur={(option) => modifier({ option })}
                />
              )}
              <div className="flex items-center gap-[10px]">
                <ChampNombre
                  libelle="Surface"
                  unite="m²"
                  valeur={ligne.surface}
                  onValeur={(surface) => modifier({ surface })}
                  className="max-w-[160px]"
                />
                {critere.tauxRef && (
                  <span className="mt-[22px] text-[12.5px] text-[var(--neutral-600)] italic">
                    × {pourcentage(referentiel.tauxSurface[critere.tauxRef], 0)} du prix au m²
                  </span>
                )}
              </div>
            </div>
          )}

          {critere.kind === 'pourcentage' && (
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[12px]">
                <input
                  type="range"
                  min={0}
                  max={(plafond ?? 0.3) * 100}
                  step={0.5}
                  value={(ligne.pourcentage ?? plancher) * 100}
                  onChange={(e) => modifier({ pourcentage: Number(e.target.value) / 100 })}
                  aria-label={`${critere.libelle} — pourcentage`}
                  className="h-[6px] flex-1 accent-[var(--youlive-orange)]"
                />
                <ChampNombre
                  libelle="Taux"
                  unite="%"
                  valeur={
                    ligne.pourcentage === null || ligne.pourcentage === undefined
                      ? null
                      : Math.round(ligne.pourcentage * 1000) / 10
                  }
                  onValeur={(v) => modifier({ pourcentage: v === null ? null : v / 100 })}
                  className="w-[104px]"
                />
              </div>
              <p className="text-[12.5px] text-[var(--neutral-600)] italic">
                {pourcentage(plancher, 0)} — {pourcentage(plafond ?? 0.3, 0)} maximum
                {plafonnee && (
                  <span className="ml-[6px] text-[var(--minus)] not-italic">
                    ramené au plafond
                  </span>
                )}
              </p>
            </div>
          )}

          {critere.kind === 'coutM2' && (
            <div className="flex items-end gap-[10px]">
              <ChampNombre
                libelle="Surface"
                unite="m²"
                valeur={ligne.surface}
                onValeur={(surface) => modifier({ surface })}
                className="max-w-[150px]"
              />
              <span className="pb-[15px] text-[14px] text-[var(--neutral-600)]">×</span>
              <ChampNombre
                libelle="Coût"
                unite="€/m²"
                valeur={
                  ligne.coutM2 ?? (critere.coutM2Ref ? referentiel.coutM2[critere.coutM2Ref] : null)
                }
                onValeur={(coutM2) => modifier({ coutM2 })}
                className="max-w-[160px]"
              />
            </div>
          )}

          {critere.kind === 'montant' && (
            <ChampNombre
              libelle="Montant"
              unite="€"
              valeur={ligne.montant}
              onValeur={(montant) => modifier({ montant })}
              className="max-w-[200px]"
            />
          )}

          {critere.kind === 'options' && critere.options && (
            <PastillesOptions
              options={critere.options}
              valeur={ligne.option ?? null}
              onValeur={(option) => modifier({ option })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PastillesOptions({
  options,
  valeur,
  onValeur,
}: {
  options: { valeur: string; libelle: string }[];
  valeur: string | null;
  onValeur: (valeur: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {options.map((option) => {
        const choisi = valeur === option.valeur;
        return (
          <button
            key={option.valeur}
            type="button"
            aria-pressed={choisi}
            onClick={() => onValeur(option.valeur)}
            className={cn(
              'min-h-[44px] rounded-full border-2 px-[16px] text-[13.5px] font-bold transition',
              choisi
                ? 'border-[var(--youlive-orange)] bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]'
                : 'border-[var(--neutral-200)] bg-white text-[var(--neutral-700)]',
            )}
          >
            {option.libelle}
          </button>
        );
      })}
    </div>
  );
}

