/**
 * Décisions d'autorisation, pures et testables.
 *
 * La source de vérité du rôle reste `public.utilisateurs.role`, relu à chaque
 * requête par `conseillerConnecte()` (session.ts). Ces fonctions ne font que
 * l'interpréter — aucun accès base, aucun cookie.
 */

/**
 * `utilisateurs.role` vaut `admin` ou `conseiller` (contrat UTILISATEURS.md),
 * mais c'est du `varchar` libre : on compare sans casse ni espaces, et seul
 * `admin` exact ouvre l'administration (« administrateur », « Admin. » → non).
 */
export function roleEstAdministrateur(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === 'admin';
}

/** Un conseiller déjà résolu peut-il accéder à l'administration ? */
export function peutAdministrer(
  conseiller: { estAdministrateur: boolean } | null | undefined,
): boolean {
  return conseiller?.estAdministrateur === true;
}
