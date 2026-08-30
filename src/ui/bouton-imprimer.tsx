'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/src/ui/button';

/** Déclenche l'impression / export PDF du navigateur. Masqué à l'impression. */
export function BoutonImprimer() {
  return (
    <Button type="button" taille="compact" onClick={() => window.print()}>
      <Printer className="size-[16px]" />
      Imprimer / enregistrer en PDF
    </Button>
  );
}
