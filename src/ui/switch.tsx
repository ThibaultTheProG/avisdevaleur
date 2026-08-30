'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/src/lib/utils';

/**
 * Interrupteur — COMPONENTS.md § Interrupteur.
 * Piste 46×28, bouton 22 px, retrait 3 px, transition 180 ms.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-[28px] w-[46px] shrink-0 cursor-pointer items-center rounded-full p-[3px]',
        'transition-colors duration-[180ms] ease-[var(--ease)] outline-none',
        'focus-visible:shadow-[var(--ring-focus)] disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-[var(--youlive-orange)] data-[state=unchecked]:bg-[var(--neutral-300)]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-[22px] rounded-full bg-white',
          'transition-transform duration-[180ms] ease-[var(--ease)]',
          'data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
