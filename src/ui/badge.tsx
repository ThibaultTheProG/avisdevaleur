import { cn } from '@/src/lib/utils';

/** Badge — COMPONENTS.md § Badges. Pastille rayon 999, padding 5/13, Nunito 12–12.5/700. */
const TONS = {
  type: 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]',
  etat: 'bg-[var(--youlive-orange-soft)] text-[var(--youlive-orange-ink)]',
  plus: 'bg-[var(--plus-bg)] text-[var(--plus)]',
  minus: 'bg-[var(--minus-bg)] text-[var(--minus)]',
  neutre: 'bg-[var(--neutral-100)] text-[var(--neutral-700)]',
} as const;

export function Badge({
  ton = 'neutre',
  className,
  children,
}: {
  ton?: keyof typeof TONS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-[13px] py-[5px] text-[12px] font-bold whitespace-nowrap',
        TONS[ton],
        className,
      )}
    >
      {children}
    </span>
  );
}
