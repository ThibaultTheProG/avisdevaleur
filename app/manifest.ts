import type { MetadataRoute } from 'next';

/**
 * Manifeste de la PWA. Servi sur /manifest.webmanifest.
 *
 * Application 100 % en ligne : pas de service worker, donc pas de mode
 * hors-ligne (README du handoff). Chrome n'exige plus de service worker pour
 * l'installation depuis son menu depuis la version 108 (mobile) / 112
 * (desktop) ; seule la bannière automatique en réclame encore un, et un
 * gestionnaire `fetch` vide pour l'obtenir dégraderait les performances sans
 * rien apporter ici.
 *
 * Vocabulaire : « avis de valeur », jamais « estimation ».
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Avis de valeur — Youlive Immobilier',
    short_name: 'Avis de valeur',
    description:
      'Rédigez, retrouvez et remettez à vos clients leurs avis de valeur.',
    lang: 'fr',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Fond de l'écran de démarrage Android : le fond d'application.
    background_color: '#faf9f7',
    // Teinte de la barre système : l'en-tête de l'application est blanc.
    theme_color: '#ffffff',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icone-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icone-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Pictogramme réduit à la zone sûre de 80 % du gabarit Android.
      {
        src: '/icone-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icone-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
