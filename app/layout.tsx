import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import "./globals.css";

// Texte courant : Nunito (DESIGN_TOKENS.md § Typographie).
const nunito = Nunito({
  variable: "--font-texte",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// Titres et montants : All Round Gothic, police licenciée non disponible sur
// Google Fonts. Quicksand est le repli retenu par la maquette, à remplacer par
// un @font-face une fois les fichiers achetés.
const quicksand = Quicksand({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Avis de valeur — Youlive Immobilier",
  description:
    "Rédigez, retrouvez et remettez à vos clients leurs avis de valeur.",
  // Le lien vers /manifest.webmanifest est ajouté par app/manifest.ts.
  applicationName: "Avis de valeur",
  // L'icône d'onglet vient de la convention de fichier app/icon.svg ; iOS,
  // qui ignore le manifeste, prend app/apple-icon.png.
  appleWebApp: {
    capable: true,
    title: "Avis de valeur",
    // En-tête blanc : texte sombre dans la barre d'état.
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Teinte de la barre système, alignée sur l'en-tête blanc de l'application.
  themeColor: "#ffffff",
  // Les encoches ne doivent pas rogner le contenu une fois installée.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${nunito.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
