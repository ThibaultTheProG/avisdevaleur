import { euros, eurosParM2, metresCarres, pourcentage } from '@/src/calcul/formater';
import type { Resultat } from '@/src/calcul/types';

/** Bloc de calcul — COMPONENTS.md § BlocPrixReference. */
export function BlocPrixReference({
  resultat,
  prixM2,
  surfaceHabitable,
  tauxDecote,
  surfaceMediane,
}: {
  resultat: Resultat;
  prixM2: number | null;
  surfaceHabitable: number | null;
  tauxDecote: number;
  surfaceMediane: number | null;
}) {
  const d = resultat.detailDecote;

  return (
    <section className="rounded-[22px] border-2 border-[var(--youlive-orange-soft)] bg-white p-[18px] shadow-[var(--shadow-calc)]">
      <h3 className="text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
        Calcul du prix de référence
      </h3>

      <dl className="mt-[14px] flex flex-col gap-[9px]">
        <div className="flex items-baseline justify-between gap-[12px]">
          <dt className="text-[14px] text-[var(--neutral-700)]">
            Valeur de base
            {surfaceHabitable !== null && prixM2 !== null && (
              <span className="block text-[12.5px] text-[var(--neutral-600)] italic">
                {metresCarres(surfaceHabitable)} × {eurosParM2(prixM2)}
              </span>
            )}
          </dt>
          <dd className="font-display text-[15.5px] font-bold text-black">
            {euros(d?.valeurDeBase ?? null)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-[12px]">
          <dt className="text-[14px] text-[var(--neutral-700)]">
            Décote grande surface
            {d && d.surfaceExcedent > 0 && surfaceMediane !== null && (
              <span className="block text-[12.5px] text-[var(--neutral-600)] italic">
                {metresCarres(d.surfaceExcedent)} au-delà de {metresCarres(surfaceMediane)},
                valorisés à {pourcentage(tauxDecote, 0)}
              </span>
            )}
          </dt>
          <dd className="font-display text-[15.5px] font-bold text-[var(--minus)]">
            {d && d.decoteSurface > 0 ? `− ${euros(d.decoteSurface)}` : euros(d ? 0 : null)}
          </dd>
        </div>
      </dl>

      <div className="my-[14px] border-t border-dashed border-[var(--neutral-300)]" />

      <div className="flex items-baseline justify-between gap-[12px]">
        <span className="font-display text-[15.5px] font-bold text-black">Prix de référence</span>
        <span className="font-display text-[24px] leading-[1.15] font-bold text-[var(--youlive-orange)] lg:text-[34px]">
          {euros(resultat.prixReference)}
        </span>
      </div>

      <p className="mt-[10px] text-[12.5px] leading-[1.4] text-[var(--neutral-600)] italic">
        Toutes les majorations et minorations s’appliquent sur ce montant.
      </p>
    </section>
  );
}
