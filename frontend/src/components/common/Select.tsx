import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { controlClasses, describedBy, Field } from './Field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: ReactNode;
  options: ReadonlyArray<SelectOption>;
  hint?: ReactNode;
  error?: string;
  hideLabel?: boolean;
  /** Renders a disabled first option, useful when there is no sensible default. */
  placeholder?: string;
  containerClassName?: string;
}

/**
 * Native <select> — gets keyboard, screen reader and mobile picker support for free.
 * Pass `multiple` for multi-select (Ctrl/Cmd/Shift + click, or Space with arrow keys).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, hint, error, hideLabel, placeholder, containerClassName, className, id: idProp, multiple, required, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const multiHint = multiple ? 'Hold Ctrl (Cmd on Mac) to select more than one.' : undefined;
  const fullHint = hint || multiHint ? [hint, multiHint].filter(Boolean).join(' ') : undefined;

  return (
    <Field id={id} label={label} hint={fullHint} error={error} required={required} hideLabel={hideLabel} className={containerClassName}>
      <select
        ref={ref}
        id={id}
        multiple={multiple}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, fullHint, error)}
        className={cn(controlClasses(Boolean(error)), multiple ? 'py-2' : 'h-10 pr-8', className)}
        {...rest}
      >
        {placeholder && !multiple && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
});
