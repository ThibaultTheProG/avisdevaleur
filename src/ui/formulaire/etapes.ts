/**
 * Les 5 étapes du formulaire (README du handoff § Principe structurant).
 * Module neutre — ni serveur ni client — pour être importable des deux côtés :
 * une constante exportée depuis un module `'use client'` n'est pas fiable
 * lorsqu'un composant serveur la lit.
 */
export const ETAPES = [
  'Le client et le bien',
  'Caractéristiques et prix de base',
  'Majorations',
  'Minorations',
  'Tendance du marché',
] as const;

export const NB_ETAPES = ETAPES.length;
