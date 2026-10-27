import { memo } from 'react';
import { Icon, type IconName, Skeleton } from '@/components/common';
import type { Metric } from '@/types';
import { cn } from '@/utils/cn';
import { formatMetric } from '@/utils/format';

const ICONS: Record<Metric['id'], IconName> = { users: 'users', revenue: 'chart', orders: 'download', conversion: 'check' };

/** Presentational: receives data, renders it. No fetching or store access. */
export const MetricCard = memo(function MetricCard({ metric }: { metric: Metric }) {
  const up = metric.change >= 0;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</h3>
        <span className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
          <Icon name={ICONS[metric.id]} size={18} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatMetric(metric.value, metric.format)}</p>
      <p className={cn('mt-1 flex items-center gap-1 text-sm font-medium', up ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
        <Icon name={up ? 'arrowUp' : 'arrowDown'} size={14} />
        <span>
          <span className="sr-only">{up ? 'Up' : 'Down'} </span>
          {Math.abs(metric.change)}%
        </span>
        <span className="font-normal text-slate-600 dark:text-slate-400">vs last month</span>
      </p>
    </article>
  );
});

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-28" />
    </div>
  );
}
