import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, PageLoader } from '@/components/common';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { ToastViewport } from '@/components/features/notifications/ToastViewport';
import { AppLayout } from '@/components/layout/AppLayout';
import { watchSystemTheme } from '@/stores/themeStore';

// Route-level code splitting: each page is its own chunk, fetched on first visit.
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const OnboardPage = lazy(() => import('@/pages/OnboardPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      {
        path: 'users/onboard',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <OnboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  useEffect(() => watchSystemTheme(), []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* Portalled to <body> so toasts stay announced while a modal makes #root inert. */}
        {createPortal(<ToastViewport />, document.body)}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
