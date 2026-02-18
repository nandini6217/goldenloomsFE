'use client';

import { cn } from '@/lib/utils';

type SpinnerProps = { className?: string };

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn('inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary', className)}
      aria-label="Loading"
    />
  );
}
