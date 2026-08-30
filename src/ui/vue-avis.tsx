'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  FileText,
  House,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { dateLongue, euros } from '@/src/calcul/formater';
import type { EtapeResume } from '@/src/calcul/resumeEtapes';
import type { TypeBien } from '@/src/calcul/types';
import { Badge } from '@/src/ui/badge';
import { Button } from '@/src/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/ui/dialog';
import { ETAPES } from '@/src/ui/formulaire/etapes';

/**
 * Écran 7 — Consultation / modification d'un avis de valeur (SCREENS.md § 7).
 * Réservé aux avis enregistrés : un brouillon s'édite directement.
 */

type AvisVue = {
  id: string;
  type: TypeBien;
  clientNom: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  creeLe: string;
  modifieLe: string;
  /** Montants figés à l'enregistrement. */
  valeurIntrinseque: number | null;
  valeurRetenue: number | null;
};

type Props = {
  avis: AvisVue;
  etapes: readonly EtapeResume[];
  /** Vrai si une modification recalcule avec le barème d'origine de l'avis. */
  baremeOrigine: boolean;
  enregistrerModifications: (id: string) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
};

export function VueAvis({
  avis,
  etapes,
  baremeOrigine,
  enregistrerModifications,
  supprimer,
}: Props) {
  const router = useRouter();
  const [enregistrement, demarrerEnregistrement] = useTransition();
  const [suppression, demarrerSuppression] = useTransition();

  const Icone = avis.type === 'maison' ? House : Building2;
  const typeLibelle = avis.type === 'maison' ? 'Maison' : 'Appartement';
  const lieu = [
    avis.adresse,
    [avis.codePostal, avis.ville].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  function onEnregistrer() {
    demarrerEnregistrement(async () => {
      try {
        await enregistrerModifications(avis.id);
        toast.success('Modifications enregistrées.');
        router.refresh();
      } catch {
        toast.error('Enregistrement impossible.');
      }
    });
  }

  function onSupprimer() {
    // `supprimer` se termine par une redirection vers /avis : ne pas
    // l'entourer d'un try/catch, la redirection de Next passe par un throw.
    demarrerSuppression(async () => {
      await supprimer(avis.id);
    });
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-[20px] py-[24px] lg:px-[34px] lg:py-[30px]">
      <Link
        href="/avis"
        className="inline-flex items-center gap-[6px] text-[14px] font-bold text-[var(--neutral-700)] transition hover:text-black"
      >
        <ArrowLeft className="size-[18px]" />
        Mes avis de valeur
      </Link>

      {/* ─── En-tête ─── */}
      <header className="mt-[16px] flex items-start gap-[14px]">
        <span className="grid size-[46px] shrink-0 place-items-center rounded-[14px] bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]">
          <Icone className="size-[24px]" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[24px] leading-[1.15] font-bold text-black lg:text-[27px]">
            {avis.clientNom || 'Client à renseigner'}
          </h1>
          <p className="mt-[6px] flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[13px] text-[var(--neutral-600)]">
            <Badge ton="type">{typeLibelle}</Badge>
            <span>
              Créé le {dateLongue(avis.creeLe)} · modifié le {dateLongue(avis.modifieLe)}
            </span>
          </p>
          {lieu && (
            <p className="mt-[4px] text-[13.5px] text-[var(--neutral-700)]">{lieu}</p>
          )}
        </div>
      </header>

      {/* ─── Valeur retenue ─── */}
      <section className="mt-[20px] flex flex-wrap items-end justify-between gap-[16px] rounded-[22px] border-2 border-[var(--youlive-orange-soft)] bg-[var(--youlive-orange-faint)] p-[20px]">
        <div>
          <p className="text-[12px] font-bold tracking-[1.1px] text-[var(--neutral-600)] uppercase">
            Valeur retenue
          </p>
          <p className="mt-[4px] font-display text-[32px] leading-[1.05] font-bold text-[var(--youlive-orange)]">
            {euros(avis.valeurRetenue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[var(--neutral-600)]">Valeur intrinsèque</p>
          <p className="mt-[2px] font-display text-[17px] font-bold text-black">
            {euros(avis.valeurIntrinseque)}
          </p>
        </div>
      </section>

      {/* ─── Modifier une étape ─── */}
      <h2 className="mt-[26px] text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
        Modifier une étape
      </h2>
      <ol className="mt-[10px] flex flex-col gap-[10px]">
        {ETAPES.map((titre, index) => {
          const numero = index + 1;
          const { resume, total } = etapes[index];
          return (
            <li key={titre}>
              <Link
                href={`/avis/${avis.id}/etape/${numero}`}
                className="flex items-center gap-[14px] rounded-[18px] bg-white p-[16px] shadow-[var(--shadow-card)] transition hover:shadow-[0_4px_14px_rgb(0_0_0/0.08)]"
              >
                <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[var(--youlive-orange-soft)] font-display text-[13.5px] font-bold text-[var(--youlive-orange-ink)]">
                  {numero}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold text-black">
                    {titre}
                  </span>
                  <span className="mt-[2px] block truncate text-[13px] text-[var(--neutral-600)]">
                    {resume}
                  </span>
                </span>
                {total && (
                  <Badge ton={index === 2 ? 'plus' : 'minus'} className="shrink-0">
                    {total}
                  </Badge>
                )}
                <ChevronRight className="size-[18px] shrink-0 text-[var(--neutral-500)]" />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* ─── Pied ─── */}
      <div className="mt-[26px] flex flex-col gap-[10px]">
        <Button type="button" onClick={onEnregistrer} disabled={enregistrement} taille="pleine">
          {enregistrement ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </Button>
        <p className="text-center text-[12px] leading-[1.4] text-[var(--neutral-600)] italic">
          {baremeOrigine
            ? 'Recalcul avec le barème d’origine de l’avis, pour rester cohérent avec le document remis au client.'
            : 'Recalcul avec le barème du jour ; l’avis est rattaché à la version active du référentiel.'}
        </p>

        <Button asChild variant="secondary" taille="pleine">
          <Link href={`/avis/${avis.id}/document`}>
            <FileText className="size-[18px]" />
            Voir le document d’avis de valeur
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost-danger" taille="pleine" className="mt-[4px]">
              <Trash2 className="size-[18px]" />
              Supprimer cet avis de valeur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer cet avis de valeur ?</DialogTitle>
              <DialogDescription>
                L’avis de{' '}
                <span className="font-bold text-black">
                  {avis.clientNom || 'client à renseigner'}
                </span>{' '}
                ne sera plus listé. Un document déjà remis au client n’est pas repris.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button
                type="button"
                variant="ghost-danger"
                taille="compact"
                onClick={onSupprimer}
                disabled={suppression}
              >
                {suppression ? 'Suppression…' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
