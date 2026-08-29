'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Toasts de confirmation (« Avis de valeur enregistré »).
 * Thème clair fixe : la maquette n'a pas de mode sombre, ce qui évite la
 * dépendance next-themes qu'installe la version d'origine de shadcn.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    style={
      {
        '--normal-bg': 'var(--surface)',
        '--normal-text': 'var(--ink)',
        '--normal-border': 'var(--neutral-200)',
        '--border-radius': 'var(--radius-card)',
      } as React.CSSProperties
    }
    {...props}
  />
);

export { Toaster };
