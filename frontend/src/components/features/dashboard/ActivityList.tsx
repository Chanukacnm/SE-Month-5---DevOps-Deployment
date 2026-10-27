import { memo } from 'react';
import type { Activity } from '@/types';
import { formatRelative, initials } from '@/utils/format';

export const ActivityList = memo(function ActivityList({ items }: { items: Activity[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-600 dark:text-slate-400">No recent activity.</p>;
  return (
    <ol className="flex flex-col gap-4">
      {items.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {initials(a.actor)}
          </span>
          <div className="text-sm">
            <p>
              <span className="font-medium">{a.actor}</span> {a.action} <span className="font-medium">{a.target}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <time dateTime={a.at}>{formatRelative(a.at)}</time>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
});
