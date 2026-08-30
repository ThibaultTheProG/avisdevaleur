'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function FormulaireConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [aide, setAide] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await fetch('/api/connexion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, motDePasse, seSouvenir }),
      });
      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => ({}));
        setErreur(corps.erreur ?? 'Identifiants incorrects.');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setErreur('Connexion impossible. Vérifiez votre réseau.');
    } finally {
      setEnCours(false);
    }
  }

  const champ =
    'w-full rounded-[14px] border-[1.5px] border-[var(--neutral-200)] bg-white ' +
    'px-[14px] py-[13px] text-[15px] text-black placeholder:text-[var(--neutral-500)] ' +
    'outline-none transition focus:border-[var(--youlive-orange)] ' +
    'focus:shadow-[var(--ring-focus)]';

  return (
    <form onSubmit={soumettre} className="flex w-full flex-col gap-[14px]" noValidate>
      {erreur && (
        <p
          role="alert"
          className="rounded-[14px] bg-[var(--minus-bg)] px-[14px] py-[12px] text-[13.5px] text-[var(--minus)]"
        >
          {erreur}
        </p>
      )}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="email" className="text-[13.5px] font-bold text-black">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@youlive-immobilier.fr"
          className={champ}
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label htmlFor="motDePasse" className="text-[13.5px] font-bold text-black">
            Mot de passe
          </label>
          <button
            type="button"
            onClick={() => setAfficherMdp((v) => !v)}
            className="cursor-pointer text-[13px] font-bold text-[var(--youlive-orange-ink)]"
          >
            {afficherMdp ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        <input
          id="motDePasse"
          name="motDePasse"
          type={afficherMdp ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className={champ}
        />
      </div>

      <label className="flex items-center gap-[9px] text-[13.5px] text-[var(--neutral-700)]">
        <input
          type="checkbox"
          checked={seSouvenir}
          onChange={(e) => setSeSouvenir(e.target.checked)}
          className="size-[18px] accent-[var(--youlive-orange)]"
        />
        Se souvenir de moi
      </label>

      <button
        type="submit"
        disabled={enCours}
        className="mt-[4px] min-h-[48px] w-full cursor-pointer rounded-[16px] bg-[var(--youlive-orange)] px-[30px] py-[15px] font-display text-[16px] font-bold text-white shadow-[var(--shadow-primary)] transition active:bg-[var(--youlive-orange-pressed)] active:shadow-none disabled:bg-[var(--neutral-100)] disabled:text-[var(--neutral-500)] disabled:shadow-none"
      >
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-[12.5px] leading-[1.45] text-[var(--neutral-600)]">
        Connectez-vous avec les identifiants que vous utilisez déjà sur l&apos;outil de
        facturation Youlive.
      </p>

      <button
        type="button"
        onClick={() => setAide((v) => !v)}
        className="cursor-pointer self-start text-[13px] font-bold text-[var(--youlive-orange-ink)]"
      >
        Mot de passe oublié ?
      </button>
      {aide && (
        <p className="rounded-[14px] bg-[var(--youlive-orange-faint)] px-[14px] py-[12px] text-[12.5px] leading-[1.45] text-[var(--neutral-700)]">
          Votre mot de passe est celui de l&apos;outil de facturation Youlive : il n&apos;est
          pas géré ici. Rapprochez-vous de votre administrateur pour le réinitialiser.
        </p>
      )}
    </form>
  );
}
