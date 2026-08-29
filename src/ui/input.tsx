import * as React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Champ — COMPONENTS.md § Champ.
 * Bordure 1,5 px, rayon 14, focus orange + halo. L'unité (m², €, %, €/m²)
 * n'est pas rendue ici : elle est posée par ChampMesure (src/ui/champ.tsx),
 * alignée à droite dans le champ.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 rounded-[14px] border-[1.5px] border-[var(--neutral-200)] bg-white',
        'px-[14px] py-[13px] text-[15px] text-black outline-none transition',
        'placeholder:text-[var(--neutral-500)]',
        'focus-visible:border-[var(--youlive-orange)] focus-visible:shadow-[var(--ring-focus)]',
        'aria-invalid:border-[var(--minus)] aria-invalid:text-[var(--minus)]',
        'disabled:bg-[var(--neutral-100)] disabled:text-[var(--neutral-500)]',
        // Lecture seule / calculé : bordure pointillée, fond grisé.
        'read-only:border-dashed read-only:border-[var(--neutral-300)] read-only:bg-[#F5F3EF] read-only:text-[var(--neutral-600)]',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
