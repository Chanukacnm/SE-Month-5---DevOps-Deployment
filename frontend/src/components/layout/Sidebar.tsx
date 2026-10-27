import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '@/components/common';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useUnreadCount } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

const NAV: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/users', label: 'Users', icon: 'users' },
  { to: '/users/onboard', label: 'Onboard member', icon: 'userPlus' },
  { to: '/notifications', label: 'Notifications', icon: 'bell' },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const unread = useUnreadCount();
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300',
                isActive ? 'bg-brand-800 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Icon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.to === '/notifications' && unread > 0 && (
              <span className="rounded-full bg-brand-300 px-2 text-xs font-semibold text-slate-950">
                {unread}
                <span className="sr-only"> unread</span>
              </span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-4 text-white">
      <img src="/favicon.svg" alt="" width={32} height={32} />
      <span className="text-lg font-semibold tracking-tight">AdminFlow</span>
    </div>
  );
}

export function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useFocusTrap(drawerRef, open);

  // Close the drawer on navigation and on Escape.
  useEffect(() => setOpen(false), [location.pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Main" className="hidden w-64 shrink-0 flex-col bg-slate-900 px-3 lg:flex">
        <Brand />
        <NavItems />
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-slate-900 px-3 motion-safe:animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-2 text-slate-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300"
              >
                <Icon name="close" />
              </button>
            </div>
            <nav aria-label="Main">
              <NavItems onNavigate={() => setOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
