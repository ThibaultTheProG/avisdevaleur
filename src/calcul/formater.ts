/**
 * Formatage français (REGLES_DE_CALCUL.md § Formatage).
 *
 * Espace insécable comme séparateur de milliers et avant « % », virgule
 * décimale, « € » suffixé. L'absence de valeur s'écrit « — », jamais « 0 € ».
 * L'arrondi à l'euro n'a lieu qu'ici : le calcul, lui, garde sa précision.
 */

/** Espace insécable — Intl produit parfois l'insécable étroit (U+202F). */
const INSECABLE = ' ';
export const TIRET_ABSENCE = '—';

const EUROS = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function normaliserEspaces(texte: string): string {
  return texte.replace(/[    ]/g, INSECABLE);
}

/** « 361 200 € », ou « — » si la valeur est absente. */
export function euros(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) {
    return TIRET_ABSENCE;
  }
  return normaliserEspaces(EUROS.format(Math.round(valeur)));
}

/**
 * Contribution signée : « + 19 200 € » / « − 33 600 € », espace après le signe,
 * et un vrai signe moins U+2212 comme dans la maquette.
 */
export function eurosSignes(
  valeur: number | null | undefined,
  sens: 'majoration' | 'minoration',
): string {
  if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) {
    return TIRET_ABSENCE;
  }
  const signe = sens === 'majoration' ? '+' : '−';
  return `${signe}${INSECABLE}${euros(Math.abs(valeur))}`;
}

/** Prend un taux (0.075) et rend « 7,5 % ». */
export function pourcentage(taux: number | null | undefined, decimalesMax = 1): string {
  if (taux === null || taux === undefined || !Number.isFinite(taux)) {
    return TIRET_ABSENCE;
  }
  const texte = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: decimalesMax,
  }).format(taux * 100);
  return `${normaliserEspaces(texte)}${INSECABLE}%`;
}

/** Taux signé : « +5 % » / « −10 % » (sans espace après le signe, comme les libellés). */
export function pourcentageSigne(taux: number | null | undefined): string {
  if (taux === null || taux === undefined || !Number.isFinite(taux)) {
    return TIRET_ABSENCE;
  }
  if (taux === 0) return pourcentage(0);
  const signe = taux > 0 ? '+' : '−';
  return `${signe}${pourcentage(Math.abs(taux))}`;
}

/** « 120 m² », ou « — ». */
export function metresCarres(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) {
    return TIRET_ABSENCE;
  }
  const texte = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(valeur);
  return `${normaliserEspaces(texte)}${INSECABLE}m²`;
}

/** « 3 200 €/m² », ou « — ». */
export function eurosParM2(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) {
    return TIRET_ABSENCE;
  }
  const texte = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(valeur);
  return `${normaliserEspaces(texte)}${INSECABLE}€/m²`;
}

/** « 22 août 2026 ». Accepte les chaînes timestamptz de PostgreSQL. */
export function dateLongue(valeur: string | Date | null | undefined): string {
  if (!valeur) return TIRET_ABSENCE;
  const date = valeur instanceof Date ? valeur : new Date(valeur);
  if (Number.isNaN(date.getTime())) return TIRET_ABSENCE;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** « 22/08/2026 ». */
export function dateCourte(valeur: string | Date | null | undefined): string {
  if (!valeur) return TIRET_ABSENCE;
  const date = valeur instanceof Date ? valeur : new Date(valeur);
  if (Number.isNaN(date.getTime())) return TIRET_ABSENCE;
  return new Intl.DateTimeFormat('fr-FR').format(date);
}
