import { NextResponse } from 'next/server';
import { conseillerConnecte } from '@/src/auth/session';

export const runtime = 'nodejs';

export async function GET() {
  const conseiller = await conseillerConnecte();
  if (!conseiller) {
    return NextResponse.json({ erreur: 'Non authentifié.' }, { status: 401 });
  }
  return NextResponse.json(conseiller);
}
