'use client';

import { cn } from '@/lib/utils';

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorAlert({ message, onRetry, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-800',
        className
      )}
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-medium text-red-700 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
