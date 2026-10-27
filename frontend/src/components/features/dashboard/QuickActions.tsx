import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@/components/common';
import { notify } from '@/stores/notificationStore';

const linkClass =
  'flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-brand-700 dark:hover:bg-slate-800';

const ACTIONS: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/users?new=1', label: 'Add a user', icon: 'plus' },
  { to: '/users/onboard', label: 'Onboard a team member', icon: 'userPlus' },
  { to: '/notifications', label: 'Review notifications', icon: 'bell' },
];

export function QuickActions() {
  return (
    <ul className="grid gap-2">
      {ACTIONS.map((a) => (
        <li key={a.to}>
          <Link to={a.to} className={linkClass}>
            <Icon name={a.icon} className="text-brand-700 dark:text-brand-300" />
            {a.label}
          </Link>
        </li>
      ))}
      <li>
        <button
          type="button"
          className={`${linkClass} w-full`}
          onClick={() => notify({ kind: 'success', title: 'Report queued', message: 'The monthly report will be emailed to you shortly.', persist: true })}
        >
          <Icon name="download" className="text-brand-700 dark:text-brand-300" />
          Export monthly report
        </button>
      </li>
    </ul>
  );
}
