import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TIRET_ABSENCE } from '@/src/calcul/formater';
import type { DonneesDocument, LigneCaracteristique } from '@/src/document/document';
import { BoutonImprimer } from '@/src/ui/bouton-imprimer';
import { PastilleDpe } from '@/src/ui/pastille-dpe';

/**
 * Écran 8 — Document « Avis de valeur » remis au client (SCREENS.md § 8, bloc `1o`).
 * Feuille A4 sobre, imprimable telle quelle (`@media print` masque la coquille
 * applicative et la barre d'actions).
 */

function LigneCarac({ ligne }: { ligne: LigneCaracteristique }) {
  return (
    <div className="flex items-center justify-between gap-[16px] border-t border-[var(--neutral-100)] px-[20px] py-[13px] text-[14px] text-[var(--neutral-700)]">
      <span>{ligne.libelle}</span>
      {ligne.dpe !== undefined ? (
        ligne.dpe ? (
          <PastilleDpe lettre={ligne.dpe} className="size-[26px] rounded-[8px] text-[13px]" />
        ) : (
          <span className="font-display text-[14px] font-bold text-black">{TIRET_ABSENCE}</span>
        )
      ) : (
        <span className="font-display text-[14px] font-bold text-black">
          {ligne.valeur ?? TIRET_ABSENCE}
        </span>
      )}
    </div>
  );
}

function BlocIdentite({
  titre,
  nom,
  lignes,
}: {
  titre: string;
  nom: string;
  lignes: string[];
}) {
  return (
    <div className="flex-1">
      <div className="mb-[10px] text-[11.5px] font-bold tracking-[1.4px] text-[var(--neutral-600)] uppercase">
        {titre}
      </div>
      <div className="font-display text-[17px] font-bold text-black">{nom}</div>
      {lignes.length > 0 && (
        <div className="mt-[6px] text-[13.5px] leading-[1.7] text-[var(--neutral-700)]">
          {lignes.map((ligne) => (
            <span key={ligne} className="block">
              {ligne}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentAvis({
  avisId,
  doc,
}: {
  avisId: string;
  doc: DonneesDocument;
}) {
  return (
    <div className="min-h-full bg-[var(--app-bg)] px-[16px] py-[20px] print:bg-white print:p-0">
      {/* Barre d'actions — jamais imprimée. */}
      <div className="mx-auto mb-[16px] flex max-w-[794px] items-center justify-between gap-[12px] print:hidden">
        <Link
          href={`/avis/${avisId}`}
          className="inline-flex items-center gap-[6px] text-[14px] font-bold text-[var(--neutral-700)] transition hover:text-black"
        >
          <ArrowLeft className="size-[18px]" />
          Retour à l’avis de valeur
        </Link>
        <BoutonImprimer />
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <article
          data-document-avis
          className="mx-auto flex w-[794px] min-h-[1123px] flex-col bg-white px-[62px] pt-[56px] pb-[44px] shadow-[0_8px_30px_rgba(0,0,0,0.14)] print:min-h-0 print:w-auto print:shadow-none"
        >
          {/* En-tête : logo + coordonnées société. */}
          <header className="flex items-start justify-between border-b-2 border-[var(--youlive-orange-soft)] pb-[26px]">
            <Image src="/logo-youlive.svg" alt="Youlive Immobilier" width={124} height={44} priority />
            <div className="text-right text-[12px] leading-[1.7] text-[var(--neutral-700)]">
              <span className="block">{doc.societe.raisonSociale}</span>
              <span className="block">{doc.societe.adresse}</span>
              <span className="block">{doc.societe.contact}</span>
            </div>
          </header>

          {/* Titre. */}
          <div className="mt-[40px]">
            <div className="text-[12.5px] font-bold tracking-[2px] text-[var(--youlive-orange)]">
              {doc.surTitre}
            </div>
            <h1 className="mt-[8px] font-display text-[42px] leading-[1.15] font-bold text-black">
              {doc.titre}
            </h1>
            <div className="mt-[8px] text-[14px] text-[var(--neutral-700)]">{doc.etabliLe}</div>
          </div>

          {/* Demandeur / bien. */}
          <div className="mt-[38px] flex gap-[40px]">
            <BlocIdentite
              titre="Demandeur"
              nom={doc.demandeur.nom}
              lignes={doc.demandeur.contact}
            />
            <BlocIdentite titre="Bien concerné" nom={doc.bien.titre} lignes={doc.bien.lignes} />
          </div>

          {/* Caractéristiques principales. */}
          <div className="mt-[34px] overflow-hidden rounded-[18px] border border-[var(--neutral-100)]">
            <div className="bg-[var(--app-bg)] px-[20px] py-[14px] text-[12px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase">
              Caractéristiques principales
            </div>
            {doc.caracteristiques.map((ligne) => (
              <LigneCarac key={ligne.libelle} ligne={ligne} />
            ))}
          </div>

          {/* Valeur retenue. */}
          <div className="mt-[30px] flex items-center justify-between gap-[24px] rounded-[22px] border-2 border-[var(--youlive-orange-soft)] bg-[var(--youlive-orange-faint)] px-[30px] py-[28px]">
            <div className="max-w-[300px] text-[14.5px] leading-[1.5] text-[var(--neutral-700)]">
              {doc.legende}
            </div>
            <div className="text-right">
              <span className="text-[12px] font-bold tracking-[1.4px] text-[var(--youlive-orange-ink)]">
                Valeur retenue
              </span>
              <span className="mt-[4px] block font-display text-[46px] leading-[1.1] font-bold text-[var(--youlive-orange)]">
                {doc.valeurRetenue}
              </span>
            </div>
          </div>

          {/* Conseiller / signature. */}
          <div className="mt-[34px] flex gap-[40px]">
            <BlocIdentite
              titre={doc.conseiller.titre}
              nom={doc.conseiller.nom}
              lignes={doc.conseiller.contact}
            />
            <div className="flex-1">
              <div className="mb-[10px] text-[11.5px] font-bold tracking-[1.4px] text-[var(--neutral-600)] uppercase">
                Signature
              </div>
              <div className="h-[78px] border-b border-[var(--neutral-200)]" />
              <div className="mt-[8px] text-[12px] text-[var(--neutral-600)]">{doc.signature}</div>
            </div>
          </div>

          {/* Pied : mention juridique intégrale. */}
          <div className="mt-auto pt-[30px]">
            <div className="rounded-[14px] bg-[var(--app-bg)] px-[18px] py-[16px] text-justify text-[9.5px] leading-[1.65] text-[var(--neutral-700)]">
              {doc.mentionJuridique}
            </div>
            <div className="mt-[12px] flex justify-between gap-[16px] text-[9.5px] text-[var(--neutral-600)]">
              <span>{doc.ligneLegale}</span>
              <span className="shrink-0">{doc.pagination}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
