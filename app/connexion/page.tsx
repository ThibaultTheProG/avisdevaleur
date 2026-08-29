import Image from 'next/image';
import { redirect } from 'next/navigation';
import { conseillerConnecte } from '@/src/auth/session';
import { FormulaireConnexion } from './formulaire';

export const runtime = 'nodejs';

export const metadata = { title: 'Connexion — Avis de valeur' };

export default async function PageConnexion() {
  if (await conseillerConnecte()) redirect('/');

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* Colonne gauche — desktop uniquement (écran 1c). */}
      <aside className="relative hidden overflow-hidden bg-[var(--youlive-orange-soft)] px-[56px] py-[64px] lg:flex lg:w-[46%] lg:flex-col lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[140px] -bottom-[160px] size-[460px] rounded-full border-[28px] border-[rgba(242,140,30,0.16)]"
        />
        <div className="relative z-10 max-w-[440px]">
          <Image
            src="/logo-youlive.svg"
            alt="Youlive Immobilier"
            width={167}
            height={60}
            priority
          />
          <h1 className="mt-[40px] font-display text-[40px] leading-[1.1] font-bold text-black">
            L&apos;avis de valeur, en quelques minutes.
          </h1>
          <p className="mt-[18px] text-[15px] leading-[1.5] text-[var(--neutral-700)]">
            Un réseau où l&apos;humain compte autant que l&apos;immobilier.
            <br />
            Youlive Immobilier — Les Sables-d&apos;Olonne.
          </p>
        </div>
      </aside>

      {/* Colonne droite — et écran mobile complet (écran 1b). */}
      <section className="flex flex-1 items-center justify-center px-[26px] py-[40px]">
        <div className="w-full max-w-[376px]">
          <div className="flex flex-col items-center lg:hidden">
            <Image
              src="/logo-youlive.svg"
              alt="Youlive Immobilier"
              width={128}
              height={46}
              priority
            />
            <p className="mt-[10px] font-display text-[18px] font-bold text-[var(--neutral-700)]">
              Avis de valeur
            </p>
          </div>

          <h2 className="mt-[30px] mb-[22px] font-display text-[26px] leading-[1.15] font-bold text-black lg:mt-0 lg:text-[28px]">
            Connexion
          </h2>

          <FormulaireConnexion />
        </div>
      </section>
    </main>
  );
}
