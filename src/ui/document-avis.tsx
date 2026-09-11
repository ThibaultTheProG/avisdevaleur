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
 *
 * La mise en page A4 de la maquette ne vaut que sous la variante `feuille`
 * (écran ≥ 48rem, ou impression — voir `globals.css`). En deçà, la feuille
 * suit la largeur de l'écran et se replie sur une colonne : jamais de défilement
 * horizontal, et le document imprimé depuis un téléphone reste l'A4 d'origine.
 */

function LigneCarac({ ligne }: { ligne: LigneCaracteristique }) {
  return (
    <div className="flex items-center justify-between gap-[16px] border-t border-[var(--neutral-100)] px-[16px] py-[13px] text-[14px] text-[var(--neutral-700)] feuille:px-[20px]">
      <span className="min-w-0">{ligne.libelle}</span>
      {ligne.dpe !== undefined ? (
        ligne.dpe ? (
          <PastilleDpe
            lettre={ligne.dpe}
            className="size-[26px] shrink-0 rounded-[8px] text-[13px]"
          />
        ) : (
          <span className="shrink-0 font-display text-[14px] font-bold text-black">
            {TIRET_ABSENCE}
          </span>
        )
      ) : (
        <span className="shrink-0 text-right font-display text-[14px] font-bold text-black">
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
    <div className="min-w-0 flex-1">
      <div className="mb-[10px] text-[11.5px] font-bold tracking-[1.4px] text-[var(--neutral-600)] uppercase">
        {titre}
      </div>
      <div className="font-display text-[17px] font-bold text-black">{nom}</div>
      {lignes.length > 0 && (
        <div className="mt-[6px] text-[13.5px] leading-[1.7] text-[var(--neutral-700)]">
          {/* Une adresse e-mail est un seul mot : sans coupure possible, elle
              déborderait de la colonne. */}
          {lignes.map((ligne) => (
            <span key={ligne} className="block wrap-anywhere">
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
      <div className="mx-auto mb-[16px] flex max-w-[794px] flex-wrap items-center justify-between gap-[12px] print:hidden">
        <Link
          href={`/avis/${avisId}`}
          className="inline-flex items-center gap-[6px] text-[14px] font-bold text-[var(--neutral-700)] transition hover:text-black"
        >
          <ArrowLeft className="size-[18px]" />
          Retour à l’avis de valeur
        </Link>
        <BoutonImprimer />
      </div>

      <article
        data-document-avis
        className="mx-auto flex w-full max-w-[794px] flex-col rounded-[18px] bg-white px-[20px] pt-[26px] pb-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.14)] feuille:rounded-none feuille:px-[62px] feuille:pt-[56px] feuille:pb-[44px] print:shadow-none [@media_screen_and_(min-width:48rem)]:min-h-[1123px]"
      >
        {/* En-tête : logo + coordonnées société. */}
        <header className="flex flex-col items-start gap-[16px] border-b-2 border-[var(--youlive-orange-soft)] pb-[20px] feuille:flex-row feuille:justify-between feuille:pb-[26px]">
          <Image src="/logo-youlive.svg" alt="Youlive Immobilier" width={124} height={44} priority />
          <div className="text-[12px] leading-[1.7] text-[var(--neutral-700)] feuille:text-right">
            <span className="block">{doc.societe.raisonSociale}</span>
            <span className="block">{doc.societe.adresse}</span>
            <span className="block">{doc.societe.contact}</span>
          </div>
        </header>

        {/* Titre. */}
        <div className="mt-[28px] feuille:mt-[40px]">
          <div className="text-[12.5px] font-bold tracking-[2px] text-[var(--youlive-orange)]">
            {doc.surTitre}
          </div>
          <h1 className="mt-[8px] font-display text-[32px] leading-[1.15] font-bold text-black feuille:text-[42px]">
            {doc.titre}
          </h1>
          <div className="mt-[8px] text-[14px] text-[var(--neutral-700)]">{doc.etabliLe}</div>
        </div>

        {/* Demandeur / bien. */}
        <div className="mt-[28px] flex flex-col gap-[22px] feuille:mt-[38px] feuille:flex-row feuille:gap-[40px]">
          <BlocIdentite
            titre="Demandeur"
            nom={doc.demandeur.nom}
            lignes={doc.demandeur.contact}
          />
          <BlocIdentite titre="Bien concerné" nom={doc.bien.titre} lignes={doc.bien.lignes} />
        </div>

        {/* Caractéristiques principales. */}
        <div className="mt-[26px] overflow-hidden rounded-[18px] border border-[var(--neutral-100)] feuille:mt-[34px]">
          <div className="bg-[var(--app-bg)] px-[16px] py-[14px] text-[12px] font-bold tracking-[1.2px] text-[var(--neutral-600)] uppercase feuille:px-[20px]">
            Caractéristiques principales
          </div>
          {doc.caracteristiques.map((ligne) => (
            <LigneCarac key={ligne.libelle} ligne={ligne} />
          ))}
          {doc.travaux && (
            <div className="border-t border-[var(--neutral-100)] px-[16px] py-[13px] feuille:px-[20px]">
              <span className="text-[14px] text-[var(--neutral-700)]">{doc.travaux.libelle}</span>
              <p className="mt-[4px] font-display text-[14px] leading-[1.5] font-bold break-words text-black">
                {doc.travaux.texte}
              </p>
            </div>
          )}
        </div>

        {/* Valeur intrinsèque retenue — sur une colonne, le montant passe en tête. */}
        <div className="mt-[24px] flex flex-col-reverse items-start gap-[10px] rounded-[22px] border-2 border-[var(--youlive-orange-soft)] bg-[var(--youlive-orange-faint)] px-[20px] py-[20px] feuille:mt-[30px] feuille:flex-row feuille:items-center feuille:justify-between feuille:gap-[24px] feuille:px-[30px] feuille:py-[28px]">
          <div className="text-[14px] leading-[1.5] text-[var(--neutral-700)] feuille:max-w-[300px] feuille:text-[14.5px]">
            {doc.legende}
          </div>
          <div className="feuille:text-right">
            <span className="text-[12px] font-bold tracking-[1.4px] text-[var(--youlive-orange-ink)]">
              Valeur intrinsèque retenue
            </span>
            <span className="mt-[4px] block font-display text-[34px] leading-[1.1] font-bold text-[var(--youlive-orange)] feuille:text-[46px]">
              {doc.valeurRetenue}
            </span>
          </div>
        </div>

        {/* Conseiller / signature. `break-inside-avoid` : à l'impression, les
            coordonnées du conseiller et la signature ne sont jamais coupées en deux. */}
        <div className="mt-[28px] flex flex-col gap-[22px] feuille:mt-[34px] feuille:flex-row feuille:gap-[40px] print:break-inside-avoid">
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

        {/* Pied : mention juridique intégrale. À l'écran d'un téléphone, le corps
            de 9,5 px de la feuille serait illisible : il ne vaut que sur la feuille. */}
        <div className="mt-auto pt-[26px] feuille:pt-[30px]">
          <div className="rounded-[14px] bg-[var(--app-bg)] px-[14px] py-[14px] text-[11px] leading-[1.6] text-[var(--neutral-700)] feuille:px-[18px] feuille:py-[16px] feuille:text-justify feuille:text-[9.5px] feuille:leading-[1.65]">
            {doc.mentionJuridique}
          </div>
          <div className="mt-[12px] flex flex-col gap-[4px] text-[10.5px] text-[var(--neutral-600)] feuille:flex-row feuille:justify-between feuille:gap-[16px] feuille:text-[9.5px]">
            <span>{doc.ligneLegale}</span>
            <span className="shrink-0">{doc.pagination}</span>
          </div>
        </div>
      </article>
    </div>
  );
}
