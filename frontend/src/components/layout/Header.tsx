import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/common';
import { NotificationBell } from '@/components/features/notifications/NotificationBell';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import { initials } from '@/utils/format';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    notify({ kind: 'info', title: 'Signed out', message: 'You have been signed out securely.' });
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-expanded={sidebarOpen}
        aria-controls="mobile-nav"
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Icon name="menu" size={22} />
      </button>

      <div className="flex-1" />

      <ThemeToggle />
      <NotificationBell />

      {user && (
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-700">
          <span
            aria-hidden="true"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 sm:flex dark:bg-brand-900 dark:text-brand-100"
          >
            {initials(user.name)}
          </span>
          <div className="hidden text-sm leading-tight md:block">
            <p className="font-medium">{user.name}</p>
            <p className="capitalize text-slate-600 dark:text-slate-400">{user.role}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} leftIcon={<Icon name="logout" size={18} />}>
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </Button>
        </div>
      )}
    </header>
  );
}
