import type { Metric } from '@/types';

const numberFmt = new Intl.NumberFormat('en-US');
const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
const relativeFmt = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

export function formatMetric(value: number, format: Metric['format']): string {
  if (format === 'currency') return currencyFmt.format(value);
  if (format === 'percent') return `${value.toFixed(1)}%`;
  return numberFmt.format(value);
}

export const formatCompact = (value: number) => compactFmt.format(value);
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

export function formatRelative(iso: string, now = Date.now()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return relativeFmt.format(diffSec, 'second');
  if (abs < 3600) return relativeFmt.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return relativeFmt.format(Math.round(diffSec / 3600), 'hour');
  return relativeFmt.format(Math.round(diffSec / 86400), 'day');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
