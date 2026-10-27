import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary, PageLoader } from '@/components/common';
import { useSimulatedEvents } from '@/hooks/useSimulatedEvents';
import { useIsAuthenticated } from '@/stores/authStore';
import { Header } from './Header';
import { RouteAnnouncer } from './RouteAnnouncer';
import { Sidebar } from './Sidebar';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[70] rounded-md bg-brand-700 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to main content
    </a>
  );
}

export function AppLayout() {
  const location = useLocation();
  useSimulatedEvents(useIsAuthenticated());

  return (
    <div className="flex min-h-screen">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">
          {/* Route-level boundary: a crash in one page keeps the shell (and navigation) usable. */}
          <ErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <RouteAnnouncer />
    </div>
  );
}
