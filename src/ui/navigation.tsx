'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { House, LogOut, Menu, Settings, X } from 'lucide-react';
import { Badge } from '@/src/ui/badge';
import { cn } from '@/src/lib/utils';

/** Navigation — COMPONENTS.md § Navigation. */

export type ConseillerNav = {
  nomComplet: string;
  email: string | null;
  estAdministrateur: boolean;
};

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? '')
    .join('');
}

function entrees(estAdministrateur: boolean) {
  return [
    { href: '/avis', libelle: 'Mes avis de valeur', Icone: House, admin: false },
    ...(estAdministrateur
      ? [
          {
            href: '/administration/parametres',
            libelle: 'Administration',
            Icone: Settings,
            admin: true,
          },
        ]
      : []),
  ];
}

function BlocUtilisateur({ conseiller }: { conseiller: ConseillerNav }) {
  return (
    <div className="flex items-center gap-[10px] border-t border-[var(--neutral-100)] pt-[14px]">
      <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--youlive-orange-soft)] font-display text-[14px] font-bold text-[var(--youlive-orange-ink)]">
        {initiales(conseiller.nomComplet)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-bold text-black">
          {conseiller.nomComplet}
        </span>
        {conseiller.email && (
          <span className="block truncate text-[12px] text-[var(--neutral-600)]">
            {conseiller.email}
          </span>
        )}
      </span>
    </div>
  );
}

function LienDeconnexion({ className }: { className?: string }) {
  return (
    <form action="/api/deconnexion" method="post" className={className}>
      <button
        type="submit"
        className="flex min-h-[44px] w-full items-center gap-[10px] rounded-[14px] px-[12px] text-[14.5px] font-bold text-[var(--minus)] transition hover:bg-[var(--minus-bg)]"
      >
        <LogOut className="size-[18px]" />
        Déconnexion
      </button>
    </form>
  );
}

/** Rail latéral fixe, à partir de 1024 px. */
export function MenuLateral({ conseiller }: { conseiller: ConseillerNav }) {
  const chemin = usePathname();
  return (
    <nav className="hidden w-[232px] shrink-0 flex-col gap-[6px] border-r border-[var(--neutral-100)] bg-white px-[16px] py-[22px] lg:flex">
      <Link href="/avis" className="mb-[22px] px-[12px]">
        <Image src="/logo-youlive.svg" alt="Youlive Immobilier" width={112} height={40} priority />
      </Link>

      {entrees(conseiller.estAdministrateur).map(({ href, libelle, Icone }) => {
        const actif = chemin === href || chemin.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={actif ? 'page' : undefined}
            className={cn(
              'flex min-h-[44px] items-center gap-[10px] rounded-[14px] px-[12px] text-[14.5px] font-bold transition',
              actif
                ? 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]'
                : 'text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] hover:text-black',
            )}
          >
            <Icone className="size-[18px]" />
            {libelle}
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-[10px]">
        <LienDeconnexion />
        <BlocUtilisateur conseiller={conseiller} />
      </div>
    </nav>
  );
}

/** En-tête mobile : logo, bouton menu, et la feuille déroulante. */
export function EnteteMobile({ conseiller }: { conseiller: ConseillerNav }) {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--neutral-100)] bg-white px-[18px] py-[12px]">
        <Link href="/avis">
          <Image src="/logo-youlive.svg" alt="Youlive Immobilier" width={98} height={35} priority />
        </Link>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="grid size-[44px] place-items-center rounded-[12px] text-black transition hover:bg-[var(--neutral-100)]"
        >
          {ouvert ? <X className="size-[22px]" /> : <Menu className="size-[22px]" />}
        </button>
      </header>

      {ouvert && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOuvert(false)}
            className="fixed inset-0 z-20 bg-black/35"
          />
          <nav className="absolute inset-x-0 z-30 flex flex-col gap-[6px] rounded-b-[22px] bg-white px-[18px] pt-[10px] pb-[18px] shadow-[var(--shadow-card)]">
            {entrees(conseiller.estAdministrateur).map(({ href, libelle, Icone, admin }) => {
              const actif = chemin === href || chemin.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOuvert(false)}
                  aria-current={actif ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[48px] items-center gap-[10px] rounded-[14px] px-[12px] text-[15px] font-bold transition',
                    actif
                      ? 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]'
                      : 'text-[var(--neutral-700)]',
                  )}
                >
                  <Icone className="size-[18px]" />
                  {libelle}
                  {admin && (
                    <Badge ton="type" className="ml-auto text-[11px] tracking-[0.6px]">
                      ADMIN
                    </Badge>
                  )}
                </Link>
              );
            })}
            <LienDeconnexion className="mt-[4px]" />
            <BlocUtilisateur conseiller={conseiller} />
          </nav>
        </>
      )}
    </div>
  );
}
