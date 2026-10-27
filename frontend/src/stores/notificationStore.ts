import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification, NotificationKind, Toast } from '@/types';
import { createId } from '@/utils/id';

const MAX_INBOX = 50;
const TOAST_TIMEOUT_MS = 5000;

interface NotifyInput {
  kind: NotificationKind;
  title: string;
  message?: string;
  /** Also keep a copy in the notification inbox (bell). Defaults to false for plain toasts. */
  persist?: boolean;
}

interface NotificationState {
  /** Inbox shown in the header bell and on /notifications. */
  notifications: AppNotification[];
  /** Short-lived toasts rendered in the live region. */
  toasts: Toast[];
  notify: (input: NotifyInput) => string;
  dismissToast: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'welcome',
          kind: 'info',
          title: 'Welcome to AdminFlow',
          message: 'Use the search on the Users page to find anyone in your organisation.',
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
      toasts: [],

      notify: ({ kind, title, message, persist: keep = false }) => {
        const id = createId('ntf');
        set((s) => ({
          toasts: [...s.toasts, { id, kind, title, message }],
          notifications: keep
            ? [{ id, kind, title, message, createdAt: new Date().toISOString(), read: false }, ...s.notifications].slice(0, MAX_INBOX)
            : s.notifications,
        }));
        setTimeout(() => get().dismissToast(id), kind === 'error' ? TOAST_TIMEOUT_MS * 2 : TOAST_TIMEOUT_MS);
        return id;
      },

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'adminflow-notifications',
      partialize: (s) => ({ notifications: s.notifications }),
    },
  ),
);

export const useUnreadCount = () => useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

/** Imperative helper for non-React code (e.g. React Query callbacks). */
export const notify = (input: NotifyInput) => useNotificationStore.getState().notify(input);
