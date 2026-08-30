/**
 * Quel barème (quelle version du référentiel) s'applique quand on **modifie**
 * un avis de valeur.
 *
 * Le client n'a jamais tranché explicitement (cf. CLAUDE.md § Open points :
 * « c'est la seule décision jamais posée au client en ces termes »). Deux
 * lectures possibles :
 *
 *  - `'origine'` — on recalcule avec la version du référentiel qui a produit
 *    les montants **déjà remis au client**. L'avis modifié reste cohérent avec
 *    le document papier qu'il a en main. C'est le choix retenu par défaut.
 *  - `'jour'`    — on recalcule avec la version active (« barème du jour ») et
 *    on rattache l'avis à cette nouvelle version. C'est le comportement décrit
 *    dans le plan (« barème du jour »).
 *
 * Pour basculer : changer la seule constante `MODE_BAREME_MODIFICATION`.
 * Ce module n'a **aucune dépendance runtime** (ni base, ni Prisma) : il porte
 * uniquement la décision, pour rester testable et facile à retrouver.
 */

export type ModeBaremeModification = 'origine' | 'jour';

/** ⇦ Le seul point à changer si le client tranche pour le barème du jour. */
export const MODE_BAREME_MODIFICATION: ModeBaremeModification = 'origine';

/** Version du référentiel à charger : celle de l'avis, ou la version active. */
export type SourceBareme = 'version-avis' | 'version-active';

/**
 * Fonction pure. Un brouillon n'a jamais rien remis à personne : il suit
 * toujours le barème du jour. Un avis enregistré suit `mode`.
 */
export function sourceBareme(
  statut: string,
  mode: ModeBaremeModification = MODE_BAREME_MODIFICATION,
): SourceBareme {
  if (statut !== 'enregistre') return 'version-active';
  return mode === 'jour' ? 'version-active' : 'version-avis';
}
