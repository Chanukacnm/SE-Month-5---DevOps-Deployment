import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { SkipLink } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useIsAuthenticated } from '@/stores/authStore';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <span className="flex items-center gap-2 font-semibold">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          AdminFlow
        </span>
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to AdminFlow</h1>
          <p className="mb-6 mt-1 text-sm text-slate-600 dark:text-slate-400">Manage users, metrics and notifications for your workspace.</p>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <LoginForm onSuccess={() => navigate(from, { replace: true })} />
          </div>
          <div id="demo-creds" className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-300">
            <p className="font-semibold">Demo accounts</p>
            <p>
              Admin: <code>admin@adminflow.io</code> / <code>Admin@123</code>
            </p>
            <p>
              Editor: <code>editor@adminflow.io</code> / <code>Editor@123</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
