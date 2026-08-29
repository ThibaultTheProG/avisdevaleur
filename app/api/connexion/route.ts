import { NextResponse } from 'next/server';
import { verifierIdentifiants } from '@/src/auth/identifiants';
import { ouvrirSession } from '@/src/auth/session';

// bcrypt exige le runtime Node : surtout pas Edge.
export const runtime = 'nodejs';

const MESSAGES: Record<string, string> = {
  identifiants: 'Identifiants incorrects.',
  trop_de_tentatives:
    'Trop de tentatives. Réessayez dans quelques minutes.',
  requete: 'Renseignez votre email et votre mot de passe.',
};

export async function POST(requete: Request) {
  let corps: unknown;
  try {
    corps = await requete.json();
  } catch {
    return NextResponse.json({ erreur: MESSAGES.requete }, { status: 400 });
  }

  const { email, motDePasse, seSouvenir } = (corps ?? {}) as Record<string, unknown>;
  if (typeof email !== 'string' || typeof motDePasse !== 'string' || !email || !motDePasse) {
    return NextResponse.json({ erreur: MESSAGES.requete }, { status: 400 });
  }

  const ip =
    requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const resultat = await verifierIdentifiants(email, motDePasse, ip);

  if (!resultat.ok) {
    // Message volontairement identique pour un email inconnu et un mot de
    // passe faux : ne jamais révéler l'existence d'un compte.
    return NextResponse.json(
      { erreur: MESSAGES[resultat.raison] },
      { status: resultat.raison === 'trop_de_tentatives' ? 429 : 401 },
    );
  }

  await ouvrirSession(resultat.idapimo, {
    userAgent: requete.headers.get('user-agent'),
    ip,
    seSouvenir: seSouvenir !== false,
  });

  return NextResponse.json({ ok: true });
}
