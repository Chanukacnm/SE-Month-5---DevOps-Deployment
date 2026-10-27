import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { controlClasses, describedBy, Field } from './Field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  hideLabel?: boolean;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, hideLabel, leftIcon, containerClassName, className, id: idProp, type = 'text', required, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} hideLabel={hideLabel} className={containerClassName}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-slate-400">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={id}
          type={isPassword && revealed ? 'text' : type}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClasses(Boolean(error)), 'h-10', leftIcon && 'pl-10', isPassword && 'pr-16', className)}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
            aria-controls={id}
            className="absolute inset-y-1 right-1 rounded-md px-2 text-xs font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-brand-300 dark:hover:bg-slate-800"
          >
            {revealed ? 'Hide' : 'Show'}
            <span className="sr-only"> password</span>
          </button>
        )}
      </div>
    </Field>
  );
});
