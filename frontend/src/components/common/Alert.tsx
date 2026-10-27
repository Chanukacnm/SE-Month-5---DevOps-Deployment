import type { ReactNode } from 'react';
import type { NotificationKind } from '@/types';
import { cn } from '@/utils/cn';
import { Icon, type IconName } from './Icon';

export interface AlertProps {
  variant?: NotificationKind;
  title?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  /** Interrupting announcement (role="alert") vs polite (role="status"). Defaults by variant. */
  assertive?: boolean;
  className?: string;
}

const STYLES: Record<NotificationKind, { box: string; icon: IconName; label: string }> = {
  info: { box: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100', icon: 'info', label: 'Information' },
  success: {
    box: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    icon: 'check',
    label: 'Success',
  },
  warning: {
    box: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
    icon: 'warning',
    label: 'Warning',
  },
  error: { box: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100', icon: 'error', label: 'Error' },
};

/** Status message. Colour is never the only signal: each variant has an icon and a hidden text label. */
export function Alert({ variant = 'info', title, children, onDismiss, assertive, className }: AlertProps) {
  const style = STYLES[variant];
  const isAssertive = assertive ?? (variant === 'error' || variant === 'warning');

  return (
    <div role={isAssertive ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg border p-4 text-sm', style.box, className)}>
      <Icon name={style.icon} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <span className="sr-only">{style.label}: </span>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1')}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-8 w-8 shrink-0 rounded-md p-1.5 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current dark:hover:bg-white/10"
        >
          <Icon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
