import { useState } from 'react';
import { Button, Card, Icon, Tabs } from '@/components/common';
import { KIND_STYLES } from '@/components/features/notifications/kindStyles';
import { PageHeader } from '@/components/layout/PageHeader';
import { notify, useNotificationStore } from '@/stores/notificationStore';
import type { AppNotification } from '@/types';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/format';

function NotificationList({ items }: { items: AppNotification[] }) {
  const markRead = useNotificationStore((s) => s.markRead);
  const remove = useNotificationStore((s) => s.remove);

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Nothing here. You're all caught up.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((n) => {
        const style = KIND_STYLES[n.kind];
        return (
          <li key={n.id} className={cn('flex gap-3 py-4', !n.read && 'font-medium')}>
            <Icon name={style.icon} className={cn('mt-0.5 shrink-0', style.text)} />
            <div className="flex-1 text-sm">
              <p>
                <span className="sr-only">
                  {style.label}
                  {n.read ? '' : ', unread'}:{' '}
                </span>
                {n.title}
              </p>
              {n.message && <p className="font-normal text-slate-600 dark:text-slate-400">{n.message}</p>}
              <p className="mt-1 text-xs font-normal text-slate-600 dark:text-slate-400">
                <time dateTime={n.createdAt}>{formatRelative(n.createdAt)}</time>
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              {!n.read && (
                <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                  Mark read<span className="sr-only">: {n.title}</span>
                </Button>
              )}
              <Button size="sm" variant="ghost" aria-label={`Remove notification: ${n.title}`} onClick={() => remove(n.id)}>
                <Icon name="close" size={16} />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const [tab, setTab] = useState('all');
  const unread = notifications.filter((n) => !n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="System events and updates about your workspace."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => notify({ kind: 'info', title: 'Test notification', message: 'Notifications are working.', persist: true })}
            >
              Send test
            </Button>
            <Button variant="secondary" onClick={markAllRead} disabled={unread.length === 0}>
              Mark all as read
            </Button>
            <Button variant="danger" onClick={clearAll} disabled={notifications.length === 0}>
              Clear all
            </Button>
          </>
        }
      />
      <Card>
        <Card.Body>
          <Tabs
            label="Notification filter"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'all', label: `All (${notifications.length})`, content: <NotificationList items={notifications} /> },
              { id: 'unread', label: `Unread (${unread.length})`, content: <NotificationList items={unread} /> },
            ]}
          />
        </Card.Body>
      </Card>
    </>
  );
}
