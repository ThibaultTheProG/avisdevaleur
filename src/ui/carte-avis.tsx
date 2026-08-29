import Link from 'next/link';
import { Building2, House } from 'lucide-react';
import { dateCourte, euros } from '@/src/calcul/formater';
import type { AvisResume } from '@/src/donnees/avis';
import { Badge } from '@/src/ui/badge';

/** Carte d'avis de valeur — COMPONENTS.md § Carte d'avis de valeur. */
export function CarteAvis({ avis }: { avis: AvisResume }) {
  const Icone = avis.type === 'maison' ? House : Building2;
  const brouillon = avis.statut === 'brouillon';
  const lieu = [avis.adresse, [avis.codePostal, avis.ville].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');

  return (
    <li>
      <Link
        href={brouillon ? `/avis/${avis.id}/etape/1` : `/avis/${avis.id}`}
        className="block rounded-[20px] bg-white p-[16px] shadow-[var(--shadow-card)] transition hover:shadow-[0_4px_14px_rgb(0_0_0/0.08)] lg:rounded-[18px] lg:px-[20px]"
      >
        {/* Mobile : carte. Desktop : ligne de tableau. */}
        <div className="flex items-center gap-[14px] lg:grid lg:grid-cols-[52px_1.1fr_1.6fr_0.7fr_0.9fr] lg:gap-[16px]">
          <span className="grid size-[44px] shrink-0 place-items-center rounded-[14px] bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]">
            <Icone className="size-[22px]" />
          </span>

          <span className="min-w-0 flex-1 lg:flex-none">
            <span className="block truncate font-display text-[15.5px] font-bold text-black">
              {avis.clientNom || 'Client à renseigner'}
            </span>
            <span className="mt-[2px] block truncate text-[13px] text-[var(--neutral-600)] lg:hidden">
              {lieu || '—'}
            </span>
            <span className="mt-[6px] flex flex-wrap items-center gap-[6px] lg:hidden">
              <Badge ton="type">{avis.type === 'maison' ? 'Maison' : 'Appartement'}</Badge>
              {brouillon && <Badge ton="etat">Brouillon</Badge>}
              <span className="text-[12.5px] text-[var(--neutral-600)]">
                {dateCourte(avis.modifieLe)}
              </span>
            </span>
          </span>

          <span className="hidden min-w-0 lg:block">
            <span className="block truncate text-[14px] text-[var(--neutral-700)]">
              {lieu || '—'}
            </span>
            {brouillon && (
              <Badge ton="etat" className="mt-[6px]">
                Brouillon
              </Badge>
            )}
          </span>

          <span className="hidden text-[13.5px] text-[var(--neutral-600)] lg:block">
            {dateCourte(avis.modifieLe)}
          </span>

          <span className="shrink-0 text-right font-display text-[17px] font-bold text-black lg:text-[18px]">
            {euros(avis.valeurRetenue)}
          </span>
        </div>
      </Link>
    </li>
  );
}
