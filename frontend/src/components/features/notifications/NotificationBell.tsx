import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useNotificationStore, useUnreadCount } from '@/stores/notificationStore';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/format';
import { KIND_STYLES } from './kindStyles';

/** Disclosure popover: button toggles a panel; Escape or outside click closes and returns focus. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unread = useUnreadCount();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapperRef, close, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const recent = notifications.slice(0, 5);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Icon name="bell" size={22} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[11px] font-bold text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-xs font-medium text-brand-700 hover:underline disabled:text-slate-500 disabled:no-underline dark:text-brand-300"
            >
              Mark all as read
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">You're all caught up.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {recent.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800',
                      !n.read && 'bg-brand-50/60 dark:bg-brand-900/20',
                    )}
                  >
                    <Icon name={KIND_STYLES[n.kind].icon} className={cn('mt-0.5 shrink-0', KIND_STYLES[n.kind].text)} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        {n.title}
                        {!n.read && <span className="sr-only"> (unread)</span>}
                      </span>
                      {n.message && <span className="block text-xs text-slate-600 dark:text-slate-400">{n.message}</span>}
                      <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{formatRelative(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/notifications"
            onClick={close}
            className="block border-t border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-brand-700 hover:bg-slate-50 dark:border-slate-700 dark:text-brand-300 dark:hover:bg-slate-800"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
