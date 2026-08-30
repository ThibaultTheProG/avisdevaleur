'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { criteres } from '@/src/calcul/catalogue';
import { calculerAvis } from '@/src/calcul/calculer';
import { euros, eurosSignes, pourcentageSigne } from '@/src/calcul/formater';
import type {
  AvisDraft,
  Categorie,
  CranTendance,
  LigneSaisie,
  Referentiel,
} from '@/src/calcul/types';
import type { AvisComplet, EntetesAvis } from '@/src/donnees/avis';
import { Badge } from '@/src/ui/badge';
import { Button } from '@/src/ui/button';
import { cn } from '@/src/lib/utils';
import { BlocPrixReference } from './bloc-prix-reference';
import { Champ, ChampNombre } from './champ';
import { SelecteurDpe } from './dpe';
import { LigneCritere } from './ligne-critere';
import { PanneauResultat } from './panneau-resultat';
import { ETAPES } from './etapes';
import { FilEtapesMobile, RailEtapes } from './stepper';

const CRANS: { valeur: CranTendance; libelle: string }[] = [
  { valeur: 'haussier', libelle: 'Marché haussier' },
  { valeur: 'equilibre', libelle: 'Marché équilibré' },
  { valeur: 'baissier', libelle: 'Marché baissier' },
];

type Props = {
  avis: AvisComplet;
  referentiel: Referentiel;
  etape: number;
  sauvegarder: (id: string, draft: AvisDraft, entetes: EntetesAvis) => Promise<{ ok: boolean }>;
  finaliser: (id: string, draft: AvisDraft, entetes: EntetesAvis) => Promise<void>;
};

export function FormulaireAvis({ avis, referentiel, etape, sauvegarder, finaliser }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<AvisDraft>(avis.draft);
  const [entetes, setEntetes] = useState<EntetesAvis>({
    clientNom: avis.client.nom,
    clientTelephone: avis.client.telephone,
    clientEmail: avis.client.email,
    adresse: avis.bien.adresse,
    codePostal: avis.bien.codePostal,
    ville: avis.bien.ville,
  });
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [brouillonEnregistre, setBrouillonEnregistre] = useState(false);
  const [enCours, demarrer] = useTransition();
  const refSurface = useRef<HTMLInputElement>(null);

  // Recalcul en direct : fonction pure, synchrone, sans bouton « calculer ».
  const resultat = useMemo(() => calculerAvis(draft, referentiel), [draft, referentiel]);

  const contributions = useMemo(
    () => Object.fromEntries(resultat.contributions.map((c) => [c.cle, c])),
    [resultat],
  );

  const compteurs = useMemo(
    () => ({
      3: criteres(draft.type, 'majoration').filter((c) => draft.lignes[c.cle]?.active).length,
      4: criteres(draft.type, 'minoration').filter((c) => draft.lignes[c.cle]?.active).length,
    }),
    [draft],
  );

  const terminees = useMemo(
    () => Array.from({ length: etape }, (_, i) => i + 1),
    [etape],
  );

  const majDraft = (champ: Partial<AvisDraft>) => setDraft((d) => ({ ...d, ...champ }));
  const majLigne = (cle: string, saisie: LigneSaisie) =>
    setDraft((d) => ({ ...d, lignes: { ...d.lignes, [cle]: saisie } }));

  /** Surface habitable et prix au m² sont requis pour quitter l'étape 2. */
  function valider(): boolean {
    if (etape !== 2) return true;
    const nouvelles: Record<string, string> = {};
    if (draft.surfaceHabitable === null || draft.surfaceHabitable === undefined) {
      nouvelles.surfaceHabitable = 'Renseignez la surface habitable.';
    }
    if (draft.prixM2 === null || draft.prixM2 === undefined) {
      nouvelles.prixM2 = 'Renseignez le prix au m².';
    }
    setErreurs(nouvelles);
    if (Object.keys(nouvelles).length > 0) {
      refSurface.current?.focus();
      return false;
    }
    return true;
  }

  function allerA(cible: number) {
    if (cible > etape && !valider()) return;
    demarrer(async () => {
      const { ok } = await sauvegarder(avis.id, draft, entetes);
      if (!ok) {
        toast.error('Enregistrement impossible.');
        return;
      }
      setBrouillonEnregistre(true);
      router.push(`/avis/${avis.id}/etape/${cible}`);
    });
  }

  function enregistrerDefinitivement() {
    if (!valider()) return;
    demarrer(async () => {
      await finaliser(avis.id, draft, entetes);
    });
  }

  const typeLibelle = draft.type === 'maison' ? 'Maison' : 'Appartement';

  return (
    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* En-tête */}
        <header className="px-[18px] pt-[18px] lg:px-[34px] lg:pt-[26px]">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="min-w-0">
              <Link
                href={avis.statut === 'brouillon' ? '/avis' : `/avis/${avis.id}`}
                className="inline-flex items-center gap-[6px] text-[13.5px] font-bold text-[var(--neutral-700)] transition hover:text-black"
              >
                <ArrowLeft className="size-[17px]" />
                {avis.statut === 'brouillon' ? 'Retour' : 'Retour à l’avis de valeur'}
              </Link>
              <h1 className="mt-[8px] font-display text-[22px] leading-[1.15] font-bold text-black lg:text-[26px]">
                {avis.statut === 'brouillon' ? 'Nouvel avis de valeur' : 'Avis de valeur'}
              </h1>
              <p className="mt-[4px] truncate text-[13.5px] text-[var(--neutral-600)]">
                {[typeLibelle, entetes.clientNom, entetes.adresse].filter(Boolean).join(' · ')}
              </p>
            </div>
            {brouillonEnregistre && (
              <Badge ton="etat" className="hidden lg:inline-flex">
                Brouillon enregistré
              </Badge>
            )}
          </div>

          <div className="mt-[18px]">
            <FilEtapesMobile
              etape={etape}
              terminees={terminees}
              compteurs={compteurs}
              onAller={allerA}
            />
          </div>
        </header>

        <div className="flex min-w-0 flex-1 gap-[26px] px-[18px] pt-[18px] pb-[24px] lg:px-[34px] lg:pt-[26px]">
          <RailEtapes etape={etape} terminees={terminees} compteurs={compteurs} onAller={allerA} />

          <main className="flex min-w-0 flex-1 flex-col gap-[14px]">
            <div className="hidden lg:block">
              <p className="text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
                Étape {etape} sur {ETAPES.length}
              </p>
              <h2 className="mt-[4px] font-display text-[24px] leading-[1.2] font-bold text-black">
                {ETAPES[etape - 1]}
              </h2>
            </div>

            {etape === 1 && (
              <div className="flex flex-col gap-[13px]">
                <Champ
                  libelle="Nom du client"
                  value={entetes.clientNom ?? ''}
                  onChange={(e) => setEntetes((v) => ({ ...v, clientNom: e.target.value }))}
                  placeholder="M. et Mme Dupont"
                />
                <Champ
                  libelle="Téléphone"
                  type="tel"
                  inputMode="tel"
                  value={entetes.clientTelephone ?? ''}
                  onChange={(e) => setEntetes((v) => ({ ...v, clientTelephone: e.target.value }))}
                />
                <Champ
                  libelle="Email"
                  type="email"
                  inputMode="email"
                  value={entetes.clientEmail ?? ''}
                  onChange={(e) => setEntetes((v) => ({ ...v, clientEmail: e.target.value }))}
                />
                <Champ
                  libelle="Adresse du bien"
                  value={entetes.adresse ?? ''}
                  onChange={(e) => setEntetes((v) => ({ ...v, adresse: e.target.value }))}
                  placeholder="12 rue des Ormes"
                />
                <div className="grid grid-cols-[110px_1fr] gap-[10px]">
                  <Champ
                    libelle="Code postal"
                    inputMode="numeric"
                    value={entetes.codePostal ?? ''}
                    onChange={(e) => setEntetes((v) => ({ ...v, codePostal: e.target.value }))}
                  />
                  <Champ
                    libelle="Ville"
                    value={entetes.ville ?? ''}
                    onChange={(e) => setEntetes((v) => ({ ...v, ville: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {etape === 2 && (
              <div className="flex flex-col gap-[14px]">
                <ChampNombre
                  ref={refSurface}
                  libelle="Surface habitable"
                  unite="m²"
                  valeur={draft.surfaceHabitable}
                  onValeur={(surfaceHabitable) => majDraft({ surfaceHabitable })}
                  erreur={erreurs.surfaceHabitable}
                />
                <ChampNombre
                  libelle="Prix au m² médian du quartier"
                  unite="€"
                  valeur={draft.prixM2}
                  onValeur={(prixM2) => majDraft({ prixM2 })}
                  erreur={erreurs.prixM2}
                />
                <ChampNombre
                  libelle="Surface médiane du quartier"
                  unite="m²"
                  valeur={draft.surfaceMedianeQuartier}
                  onValeur={(surfaceMedianeQuartier) => majDraft({ surfaceMedianeQuartier })}
                  aide={`Au-delà de cette surface médiane, une décote de ${Math.round(referentiel.tauxDecoteGrandeSurface * 100)} % est appliquée sur les mètres carrés supplémentaires.`}
                />
                <SelecteurDpe
                  valeur={draft.dpe ?? null}
                  onValeur={(dpe) => majDraft({ dpe })}
                  bareme={draft.type}
                  taux={draft.dpe ? referentiel.dpe[draft.type][draft.dpe] : null}
                  contribution={draft.dpe ? resultat.contributionDpe : null}
                />
                <BlocPrixReference
                  resultat={resultat}
                  prixM2={draft.prixM2 ?? null}
                  surfaceHabitable={draft.surfaceHabitable ?? null}
                  tauxDecote={referentiel.tauxDecoteGrandeSurface}
                  surfaceMediane={draft.surfaceMedianeQuartier ?? null}
                />
              </div>
            )}

            {(etape === 3 || etape === 4) && (
              <ListeCriteres
                categorie={etape === 3 ? 'majoration' : 'minoration'}
                draft={draft}
                referentiel={referentiel}
                contributions={contributions}
                total={etape === 3 ? resultat.totalMajorations : resultat.totalMinorations}
                onLigne={majLigne}
              />
            )}

            {etape === 5 && (
              <div className="flex flex-col gap-[14px]">
                <div className="flex flex-col gap-[10px]">
                  {CRANS.map(({ valeur, libelle }) => {
                    const taux = referentiel.tendance[valeur];
                    const choisi = draft.tendanceCran === valeur;
                    const ajuste = choisi && draft.tendancePourcentage !== taux;
                    return (
                      <button
                        key={valeur}
                        type="button"
                        role="radio"
                        aria-checked={choisi}
                        onClick={() =>
                          majDraft({ tendanceCran: valeur, tendancePourcentage: taux })
                        }
                        className={cn(
                          'flex cursor-pointer items-center justify-between gap-[12px] rounded-[18px] border-2 bg-white p-[16px] text-left transition',
                          choisi
                            ? 'border-[var(--youlive-orange)] bg-[var(--youlive-orange-faint)]'
                            : 'border-[var(--neutral-100)]',
                        )}
                      >
                        <span className="font-display text-[15.5px] font-bold text-black">
                          {libelle}
                          {ajuste && (
                            <Badge ton="neutre" className="ml-[8px] align-middle">
                              ajusté
                            </Badge>
                          )}
                        </span>
                        <span className="font-display text-[15.5px] font-bold text-[var(--youlive-orange-ink)]">
                          {pourcentageSigne(taux)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <ChampNombre
                  libelle="Pourcentage appliqué"
                  unite="%"
                  valeur={Math.round(draft.tendancePourcentage * 1000) / 10}
                  onValeur={(v) => majDraft({ tendancePourcentage: (v ?? 0) / 100 })}
                  aide="Modifier ce champ n’annule pas le cran choisi : il le marque comme ajusté."
                  className="max-w-[200px]"
                />

                <Recapitulatif resultat={resultat} tendance={draft.tendancePourcentage} />
              </div>
            )}

            {/* Pied de contenu — desktop */}
            <div className="mt-[10px] hidden items-center justify-between gap-[12px] lg:flex">
              <Button
                type="button"
                variant="secondary"
                onClick={() => allerA(etape - 1)}
                disabled={etape === 1 || enCours}
              >
                Précédent
              </Button>
              <div className="flex items-center gap-[10px]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => allerA(etape)}
                  disabled={enCours}
                >
                  Enregistrer le brouillon
                </Button>
                {etape < ETAPES.length && (
                  <Button type="button" onClick={() => allerA(etape + 1)} disabled={enCours}>
                    Suivant · {ETAPES[etape]}
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <PanneauResultat
        resultat={resultat}
        avantCalcul={etape === 1}
        tendancePourcentage={draft.tendancePourcentage}
        derniereEtape={etape === ETAPES.length}
        enregistrement={enCours}
        onPrecedent={etape > 1 ? () => allerA(etape - 1) : undefined}
        onSuivant={() => allerA(etape + 1)}
        onEnregistrer={enregistrerDefinitivement}
        titreSuivant={ETAPES[etape]}
      />
    </div>
  );
}

function ListeCriteres({
  categorie,
  draft,
  referentiel,
  contributions,
  total,
  onLigne,
}: {
  categorie: Categorie;
  draft: AvisDraft;
  referentiel: Referentiel;
  contributions: Record<string, { montant: number; plafonnee?: boolean }>;
  total: number;
  onLigne: (cle: string, saisie: LigneSaisie) => void;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between gap-[12px]">
        <span className="text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
          Total
        </span>
        <Badge ton={categorie === 'majoration' ? 'plus' : 'minus'}>
          {eurosSignes(total, categorie)}
        </Badge>
      </div>

      {criteres(draft.type, categorie).map((critere) => (
        <LigneCritere
          key={critere.cle}
          critere={critere}
          categorie={categorie}
          saisie={draft.lignes[critere.cle]}
          contribution={contributions[critere.cle]?.montant ?? null}
          plafonnee={contributions[critere.cle]?.plafonnee}
          referentiel={referentiel}
          onChange={(saisie) => onLigne(critere.cle, saisie)}
        />
      ))}
    </div>
  );
}

function Recapitulatif({
  resultat,
  tendance,
}: {
  resultat: ReturnType<typeof calculerAvis>;
  tendance: number;
}) {
  return (
    <section className="rounded-[22px] bg-white p-[18px] shadow-[var(--shadow-card)]">
      <h3 className="text-[11.5px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
        Récapitulatif
      </h3>
      <dl className="mt-[12px] flex flex-col">
        {(
          [
            ['Prix de référence', euros(resultat.prixReference)],
            [
              'DPE',
              resultat.contributionDpe === 0
                ? euros(0)
                : eurosSignes(
                    resultat.contributionDpe,
                    resultat.contributionDpe > 0 ? 'majoration' : 'minoration',
                  ),
            ],
            ['Majorations', eurosSignes(resultat.totalMajorations, 'majoration')],
            ['Minorations', eurosSignes(resultat.totalMinorations, 'minoration')],
            ['Valeur intrinsèque', euros(resultat.valeurIntrinseque)],
            ['Tendance du marché', pourcentageSigne(tendance)],
          ] as [string, string][]
        ).map(([cle, valeur], index) => (
          <div
            key={cle}
            className={cn(
              'flex items-baseline justify-between gap-[12px] py-[9px]',
              index > 0 && 'border-t border-dashed border-[var(--neutral-200)]',
            )}
          >
            <dt className="text-[14px] text-[var(--neutral-700)]">{cle}</dt>
            <dd className="font-display text-[15px] font-bold text-black">{valeur}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-[12px] rounded-[18px] bg-[var(--youlive-orange-faint)] p-[16px]">
        <p className="text-[12.5px] text-[var(--neutral-700)]">Valeur retenue</p>
        <p className="mt-[2px] font-display text-[30px] leading-[1.1] font-bold text-[var(--youlive-orange)]">
          {euros(resultat.valeurRetenue)}
        </p>
      </div>
    </section>
  );
}
