import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Shared label / hint / error chrome so every form control is wired up the same way. */
interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

export const hintId = (id: string) => `${id}-hint`;
export const errorId = (id: string) => `${id}-error`;

export function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? hintId(id) : null, error ? errorId(id) : null].filter(Boolean).join(' ') || undefined;
}

export function Field({ id, label, hint, error, required, hideLabel, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-slate-800 dark:text-slate-200', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span className="ml-0.5 text-red-700 dark:text-red-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={hintId(id)} className="text-xs text-slate-600 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId(id)} className="flex items-center gap-1 text-sm text-red-700 dark:text-red-400">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

export const controlClasses = (invalid: boolean) =>
  cn(
    'w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:disabled:bg-slate-800',
    invalid
      ? 'border-red-600 focus:ring-red-500/40 dark:border-red-400'
      : 'border-slate-500 focus:border-brand-600 focus:ring-brand-500/40 dark:border-slate-500',
  );
