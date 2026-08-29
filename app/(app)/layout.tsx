import { redirect } from 'next/navigation';
import { conseillerConnecte } from '@/src/auth/session';
import { EnteteMobile, MenuLateral } from '@/src/ui/navigation';
import { Toaster } from '@/src/ui/sonner';

export const runtime = 'nodejs';

/** Coquille des pages authentifiées : rail latéral desktop, en-tête mobile. */
export default async function LayoutApplication({
  children,
}: {
  children: React.ReactNode;
}) {
  const conseiller = await conseillerConnecte();
  if (!conseiller) redirect('/connexion');

  const nav = {
    nomComplet: conseiller.nomComplet,
    email: conseiller.email,
    estAdministrateur: conseiller.estAdministrateur,
  };

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <MenuLateral conseiller={nav} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <EnteteMobile conseiller={nav} />
        {children}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
