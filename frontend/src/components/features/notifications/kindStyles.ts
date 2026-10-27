import type { IconName } from '@/components/common';
import type { NotificationKind } from '@/types';

export const KIND_STYLES: Record<NotificationKind, { icon: IconName; text: string; border: string; label: string }> = {
  info: { icon: 'info', text: 'text-sky-700 dark:text-sky-300', border: 'border-l-sky-600', label: 'Info' },
  success: { icon: 'check', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-l-emerald-600', label: 'Success' },
  warning: { icon: 'warning', text: 'text-amber-700 dark:text-amber-300', border: 'border-l-amber-500', label: 'Warning' },
  error: { icon: 'error', text: 'text-red-700 dark:text-red-300', border: 'border-l-red-600', label: 'Error' },
};
