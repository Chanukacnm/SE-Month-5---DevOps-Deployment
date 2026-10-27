import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { errorId } from './Field';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, id: idProp, className, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const descId = description ? `${id}-desc` : undefined;
  const ids = [descId, error ? errorId(id) : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={ids}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-500 accent-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:accent-brand-400"
          {...rest}
        />
        <div className="text-sm">
          <label htmlFor={id} className="font-medium text-slate-800 dark:text-slate-200">
            {label}
          </label>
          {description && (
            <p id={descId} className="text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={errorId(id)} className="text-sm text-red-700 dark:text-red-400">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
});
