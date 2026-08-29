import { NextResponse } from 'next/server';
import { fermerSession } from '@/src/auth/session';

export const runtime = 'nodejs';

export async function POST(requete: Request) {
  await fermerSession();
  // Redirection plutôt que JSON : la déconnexion part d'un formulaire HTML,
  // et une réponse JSON s'afficherait telle quelle dans le navigateur.
  return NextResponse.redirect(new URL('/connexion', requete.url), { status: 303 });
}
