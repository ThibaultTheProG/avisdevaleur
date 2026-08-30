'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  LETTRES_DPE,
  LIBELLE_PLAFOND,
  LIBELLE_TENDANCE_ADMIN,
  pourcentVersRatio,
  ratioVersPourcent,
  validerReferentiel,
} from '@/src/administration/parametres';
import type { LettreDpe, Referentiel } from '@/src/calcul/types';
import { Button } from '@/src/ui/button';
import { PastilleDpe } from '@/src/ui/pastille-dpe';
import { cn } from '@/src/lib/utils';

/** Écran 9 — Administration · Paramètres (SCREENS.md § 9, bloc `1p`). */

const ONGLETS = [
  { id: 'surfaces', libelle: 'Surfaces & taux' },
  { id: 'dpe', libelle: 'Barème DPE' },
  { id: 'plafonds', libelle: 'Plafonds des critères' },
  { id: 'tendance', libelle: 'Tendance de marché' },
] as const;
type Onglet = (typeof ONGLETS)[number]['id'];

type Props = {
  referentiel: Referentiel;
  derniereModification: string;
  enregistrer: (contenu: Referentiel) => Promise<{ ok: boolean; erreurs: string[] }>;
};

export function FormulaireParametres({ referentiel, derniereModification, enregistrer }: Props) {
  const router = useRouter();
  const [contenu, setContenu] = useState<Referentiel>(referentiel);
  const [reference, setReference] = useState(() => JSON.stringify(referentiel));
  const [onglet, setOnglet] = useState<Onglet>('surfaces');
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [enCours, demarrer] = useTransition();

  const modifie = JSON.stringify(contenu) !== reference;
  const problemes = validerReferentiel(contenu);
  const enregistrable = modifie && problemes.length === 0 && !enCours;

  function maj(applique: (r: Referentiel) => void) {
    setContenu((prev) => {
      const suivant = structuredClone(prev);
      applique(suivant);
      return suivant;
    });
  }

  function onEnregistrer() {
    setErreurs([]);
    demarrer(async () => {
      const res = await enregistrer(contenu);
      if (!res.ok) {
        setErreurs(res.erreurs);
        toast.error('Enregistrement refusé.');
        return;
      }
      setReference(JSON.stringify(contenu));
      toast.success('Paramètres enregistrés — nouvelle version du barème publiée.');
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* En-tête. */}
      <header className="bg-[var(--app-bg)] px-[20px] pt-[24px] lg:px-[34px]">
        <div className="flex flex-wrap items-end justify-between gap-[16px]">
          <div>
            <h1 className="font-display text-[26px] leading-[1.15] font-bold text-black lg:text-[28px]">
              Paramètres
            </h1>
            <p className="mt-[4px] text-[14px] text-[var(--neutral-600)]">
              Valeurs de référence utilisées par les formulaires d’avis de valeur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[12px]">
            <span className="text-[13px] text-[var(--neutral-600)] italic">
              {derniereModification}
            </span>
            <Button type="button" onClick={onEnregistrer} disabled={!enregistrable}>
              {enCours ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>

        {/* Onglets. */}
        <div className="mt-[22px] flex flex-wrap gap-[6px]">
          {ONGLETS.map(({ id, libelle }) => (
            <button
              key={id}
              type="button"
              aria-current={onglet === id ? 'true' : undefined}
              onClick={() => setOnglet(id)}
              className={cn(
                'cursor-pointer rounded-t-[14px] px-[18px] py-[11px] font-display text-[14px] font-bold transition',
                onglet === id
                  ? 'border border-b-0 border-[var(--neutral-100)] bg-white text-[var(--youlive-orange-ink)]'
                  : 'text-[var(--neutral-600)] hover:text-black',
              )}
            >
              {libelle}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 border-t border-[var(--neutral-100)] bg-white px-[20px] py-[26px] lg:px-[34px]">
        {(erreurs.length > 0 || (modifie && problemes.length > 0)) && (
          <ul className="mb-[20px] flex flex-col gap-[4px] rounded-[14px] bg-[var(--minus-bg)] px-[16px] py-[12px] text-[13px] text-[var(--minus)]">
            {(erreurs.length > 0 ? erreurs : problemes).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="mx-auto grid max-w-[980px] gap-[18px]">
          {onglet === 'surfaces' && (
            <>
              <Carte
                titre="Surfaces médianes par défaut"
                description="Pré-remplissent le champ « surface médiane du quartier » à l’étape 2."
              >
                <div className="grid gap-[14px] sm:grid-cols-3">
                  <ChampBloc
                    libelle="Maison"
                    unite="m²"
                    valeur={contenu.surfaceMediane.maison}
                    onValeur={(v) => maj((r) => (r.surfaceMediane.maison = v))}
                  />
                  <ChampBloc
                    libelle="Appartement"
                    unite="m²"
                    valeur={contenu.surfaceMediane.appartement}
                    onValeur={(v) => maj((r) => (r.surfaceMediane.appartement = v))}
                  />
                  <ChampBloc
                    libelle="Décote des m² au-delà"
                    unite="%"
                    valeur={ratioVersPourcent(contenu.tauxDecoteGrandeSurface)}
                    onValeur={(v) => maj((r) => (r.tauxDecoteGrandeSurface = pourcentVersRatio(v)))}
                  />
                </div>
              </Carte>

              <Carte
                titre="Taux de surface"
                description="Part du prix au m² appliquée aux surfaces annexes."
              >
                <div className="grid gap-[14px] sm:grid-cols-3">
                  <ChampBloc
                    libelle="Véranda / loggia"
                    unite="%"
                    valeur={ratioVersPourcent(contenu.tauxSurface.veranda)}
                    onValeur={(v) => maj((r) => (r.tauxSurface.veranda = pourcentVersRatio(v)))}
                  />
                  <ChampBloc
                    libelle="Annexe / cave / cellier"
                    unite="%"
                    valeur={ratioVersPourcent(contenu.tauxSurface.annexe)}
                    onValeur={(v) => maj((r) => (r.tauxSurface.annexe = pourcentVersRatio(v)))}
                  />
                </div>
              </Carte>

              <Carte
                titre="Coûts au m²"
                description="Montants pré-remplis, ajustables par le conseiller sur chaque avis."
              >
                <div className="grid gap-[14px] sm:grid-cols-3">
                  <ChampBloc
                    libelle="Rafraîchissement"
                    unite="€/m²"
                    valeur={contenu.coutM2.rafraichissement}
                    onValeur={(v) => maj((r) => (r.coutM2.rafraichissement = v))}
                  />
                  <ChampBloc
                    libelle="Rénovation complète"
                    unite="€/m²"
                    valeur={contenu.coutM2.renovation}
                    onValeur={(v) => maj((r) => (r.coutM2.renovation = v))}
                  />
                </div>
              </Carte>

              <div className="flex items-center gap-[12px] rounded-[20px] border-[1.5px] border-dashed border-[var(--neutral-200)] px-[22px] py-[18px] text-[var(--neutral-500)]">
                <span className="grid size-[30px] place-items-center rounded-full bg-[var(--app-bg)]">
                  <Plus className="size-[16px]" />
                </span>
                <span className="font-display text-[14px] font-bold">
                  Ajouter un groupe de paramètres — à venir
                </span>
              </div>
            </>
          )}

          {onglet === 'dpe' && (
            <Carte titre="Barème DPE" description="Deux jeux distincts selon le type de bien.">
              <div className="grid grid-cols-[52px_1fr_1fr] items-center gap-[8px]">
                <span />
                <span className="text-center text-[12px] font-bold tracking-[0.6px] text-[var(--neutral-600)]">
                  MAISON
                </span>
                <span className="text-center text-[12px] font-bold tracking-[0.6px] text-[var(--neutral-600)]">
                  APPARTEMENT
                </span>
                {LETTRES_DPE.map((lettre) => (
                  <DpeLigne
                    key={lettre}
                    lettre={lettre}
                    maison={ratioVersPourcent(contenu.dpe.maison[lettre])}
                    appartement={ratioVersPourcent(contenu.dpe.appartement[lettre])}
                    onMaison={(v) => maj((r) => (r.dpe.maison[lettre] = pourcentVersRatio(v)))}
                    onAppartement={(v) =>
                      maj((r) => (r.dpe.appartement[lettre] = pourcentVersRatio(v)))
                    }
                  />
                ))}
              </div>
            </Carte>
          )}

          {onglet === 'plafonds' && (
            <Carte titre="Plafonds des critères ajustables">
              <div className="flex flex-col gap-[10px]">
                {(Object.keys(LIBELLE_PLAFOND) as (keyof Referentiel['plafonds'])[]).map((cle) => (
                  <div key={cle} className="flex items-center gap-[12px]">
                    <span className="flex-1 text-[14px] text-[var(--neutral-700)]">
                      {LIBELLE_PLAFOND[cle]}
                    </span>
                    <ChampCompact
                      unite="%"
                      className="w-[96px] shrink-0"
                      valeur={ratioVersPourcent(contenu.plafonds[cle])}
                      onValeur={(v) => maj((r) => (r.plafonds[cle] = pourcentVersRatio(v)))}
                    />
                  </div>
                ))}
              </div>
            </Carte>
          )}

          {onglet === 'tendance' && (
            <Carte titre="Tendance de marché">
              <div className="grid gap-[14px] sm:grid-cols-3">
                {(Object.keys(LIBELLE_TENDANCE_ADMIN) as (keyof Referentiel['tendance'])[]).map(
                  (cle) => (
                    <ChampBloc
                      key={cle}
                      libelle={LIBELLE_TENDANCE_ADMIN[cle]}
                      unite="%"
                      valeur={ratioVersPourcent(contenu.tendance[cle])}
                      onValeur={(v) => maj((r) => (r.tendance[cle] = pourcentVersRatio(v)))}
                    />
                  ),
                )}
              </div>
            </Carte>
          )}
        </div>
      </div>
    </div>
  );
}

function Carte({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[var(--neutral-100)] p-[20px_22px] shadow-[var(--shadow-card)]">
      <h2 className="font-display text-[16px] font-bold text-black">{titre}</h2>
      {description && (
        <p className="mt-[4px] mb-[16px] text-[13px] leading-[1.5] text-[var(--neutral-600)]">
          {description}
        </p>
      )}
      {!description && <div className="h-[14px]" />}
      {children}
    </section>
  );
}

const affiche = (valeur: number) => (Number.isFinite(valeur) ? String(valeur) : '');
const lit = (texte: string) => (texte.trim() === '' ? Number.NaN : Number(texte));

function ChampBloc({
  libelle,
  unite,
  valeur,
  onValeur,
}: {
  libelle: string;
  unite: string;
  valeur: number;
  onValeur: (valeur: number) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-[6px] text-[13px] font-bold text-black">{libelle}</span>
      <span className="flex items-center gap-[8px] rounded-[12px] border-[1.5px] border-[var(--neutral-200)] bg-white px-[14px] py-[3px] focus-within:border-[var(--youlive-orange)] focus-within:shadow-[var(--ring-focus)]">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={affiche(valeur)}
          onChange={(e) => onValeur(lit(e.target.value))}
          className="w-full min-w-0 py-[8px] text-[14.5px] text-black outline-none"
        />
        <span className="shrink-0 text-[13px] text-[var(--neutral-600)]">{unite}</span>
      </span>
    </label>
  );
}

function ChampCompact({
  unite,
  valeur,
  onValeur,
  className,
}: {
  unite: string;
  valeur: number;
  onValeur: (valeur: number) => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-[6px] rounded-[11px] border-[1.5px] border-[var(--neutral-200)] bg-white px-[12px] focus-within:border-[var(--youlive-orange)] focus-within:shadow-[var(--ring-focus)]',
        className ?? 'w-full',
      )}
    >
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={affiche(valeur)}
        onChange={(e) => onValeur(lit(e.target.value))}
        className="w-full min-w-0 py-[9px] text-right text-[14px] text-black outline-none"
      />
      <span className="shrink-0 text-[13px] text-[var(--neutral-600)]">{unite}</span>
    </span>
  );
}

function DpeLigne({
  lettre,
  maison,
  appartement,
  onMaison,
  onAppartement,
}: {
  lettre: LettreDpe;
  maison: number;
  appartement: number;
  onMaison: (valeur: number) => void;
  onAppartement: (valeur: number) => void;
}) {
  return (
    <>
      <PastilleDpe lettre={lettre} className="size-[34px] rounded-[11px] text-[15px]" />
      <ChampCompact unite="%" valeur={maison} onValeur={onMaison} />
      <ChampCompact unite="%" valeur={appartement} onValeur={onAppartement} />
    </>
  );
}
