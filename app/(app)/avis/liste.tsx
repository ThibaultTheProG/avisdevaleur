'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { dateLongue } from '@/src/calcul/formater';
import type { AvisResume } from '@/src/donnees/avis';
import { Button } from '@/src/ui/button';
import { CarteAvis } from '@/src/ui/carte-avis';

function sansAccents(texte: string) {
  return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function ListeAvis({
  avis,
  prenom,
}: {
  avis: AvisResume[];
  prenom: string;
}) {
  const [recherche, setRecherche] = useState('');

  const filtres = useMemo(() => {
    const terme = sansAccents(recherche.trim());
    if (!terme) return avis;
    return avis.filter((a) =>
      sansAccents(
        [a.clientNom, a.adresse, a.codePostal, a.ville].filter(Boolean).join(' '),
      ).includes(terme),
    );
  }, [avis, recherche]);

  // État vide — écran 1e du handoff.
  if (avis.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-[26px] py-[48px] text-center">
        <span className="grid size-[124px] place-items-center rounded-full bg-[var(--youlive-orange-soft)]">
          <Image src="/pictogramme-youlive.svg" alt="" width={58} height={58} />
        </span>
        <h1 className="mt-[26px] font-display text-[26px] leading-[1.15] font-bold text-black">
          Bienvenue {prenom}
        </h1>
        <p className="mt-[12px] max-w-[400px] text-[15px] leading-[1.45] text-[var(--neutral-700)]">
          Vous n’avez pas encore d’avis de valeur. Créez le premier pour le retrouver ici, le
          modifier et le remettre à votre client.
        </p>
        <Button asChild taille="pleine" className="mt-[26px] max-w-[340px]">
          <Link href="/avis/nouveau">
            <Plus className="size-[18px]" />
            Nouvel avis de valeur
          </Link>
        </Button>
      </div>
    );
  }

  const dernier = avis[0];

  return (
    <div className="mx-auto w-full max-w-[1060px] px-[20px] py-[24px] lg:px-[34px] lg:py-[30px]">
      <div className="flex flex-wrap items-start justify-between gap-[16px]">
        <div>
          <h1 className="font-display text-[26px] leading-[1.15] font-bold text-black lg:text-[28px]">
            Mes avis de valeur
          </h1>
          <p className="mt-[6px] text-[14px] text-[var(--neutral-600)]">
            {avis.length} avis · dernier le {dateLongue(dernier?.modifieLe)}
          </p>
        </div>
        <Button asChild className="hidden lg:inline-flex">
          <Link href="/avis/nouveau">
            <Plus className="size-[18px]" />
            Nouvel avis de valeur
          </Link>
        </Button>
      </div>

      <Button asChild taille="pleine" className="mt-[18px] lg:hidden">
        <Link href="/avis/nouveau">
          <Plus className="size-[18px]" />
          Nouvel avis de valeur
        </Link>
      </Button>

      <div className="relative mt-[18px]">
        <Search className="pointer-events-none absolute top-1/2 left-[14px] size-[18px] -translate-y-1/2 text-[var(--neutral-500)]" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un client, une adresse…"
          aria-label="Rechercher un client, une adresse"
          className="w-full rounded-[14px] border-[1.5px] border-[var(--neutral-200)] bg-white py-[13px] pr-[14px] pl-[42px] text-[15px] outline-none transition placeholder:text-[var(--neutral-500)] focus:border-[var(--youlive-orange)] focus:shadow-[var(--ring-focus)]"
        />
      </div>

      {/* En-têtes de colonnes — desktop seulement. */}
      <div className="mt-[22px] hidden grid-cols-[52px_1.1fr_1.6fr_0.7fr_0.9fr] gap-[16px] px-[20px] pb-[10px] text-[11.5px] font-bold tracking-[1.1px] text-[var(--neutral-600)] uppercase lg:grid">
        <span>Type</span>
        <span>Client</span>
        <span>Adresse du bien</span>
        <span>Date</span>
        <span className="text-right">Valeur retenue</span>
      </div>

      {filtres.length === 0 ? (
        <p className="mt-[26px] text-center text-[14.5px] text-[var(--neutral-600)]">
          Aucun avis de valeur ne correspond à « {recherche.trim()} ».
        </p>
      ) : (
        <ul className="mt-[10px] flex flex-col gap-[10px] lg:mt-0">
          {filtres.map((a) => (
            <CarteAvis key={a.id} avis={a} />
          ))}
        </ul>
      )}
    </div>
  );
}
