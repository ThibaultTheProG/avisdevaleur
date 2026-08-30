/**
 * Identité de l'agence et mentions légales du document client (écran 8).
 *
 * Toutes ces chaînes sont **reprises mot pour mot de la maquette**
 * (`design_handoff_avis_de_valeur/Canvas.dc.html`, bloc `1o`). SCREENS.md § 8 :
 * « texte à reprendre mot pour mot depuis la maquette ». Elles ne viennent
 * d'aucune base — à faire valider par le client avant mise en service, et à
 * déplacer vers l'écran 9 si elles doivent devenir éditables.
 */

export const SOCIETE = {
  raisonSociale: 'SAS JMG Youlive Immobilier',
  adresse: "14 rue de l'Océan, 85100 Les Sables-d'Olonne",
  contact: 'contact@youlive-immobilier.fr · www.youlive-immobilier.fr',

  /** Lieu d'établissement de l'avis (« Établi le … aux Sables-d'Olonne »). */
  lieu: "aux Sables-d'Olonne",

  /**
   * Mention juridique intégrale — pied de page, Nunito 9.5/1.65, justifiée.
   * Reprise à l'identique de la maquette.
   */
  mentionJuridique:
    "La SAS JMG Youlive immobilier rappelle que le présent avis de valeur a été " +
    "donné en tenant compte des renseignements fournis par le(s) demandeur(s), du " +
    "constat réalisé lors de la visite du bien par le représentant de la SAS JMG. " +
    "Elle rappelle aussi que le présent avis de valeur n'a aucune force " +
    "obligatoire ; il ne constitue qu'une simple information ayant pour but " +
    "d'éclairer le demandeur. Cet avis de valeur ne peut être assimilé à une " +
    "expertise, laquelle doit être établie par un expert immobilier en possession " +
    "de paramètres et autres documents plus complets nécessaires à ce travail.",

  /** Ligne société sous la mention (RCS, carte professionnelle). */
  ligneLegale:
    'SAS JMG Youlive Immobilier — RCS La Roche-sur-Yon 902 345 678 — ' +
    'Carte professionnelle CPI 8501 2022 000 000 123',
} as const;
