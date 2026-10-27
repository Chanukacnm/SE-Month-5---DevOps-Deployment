import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Alert } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  /** Restrict to these roles. Omit to allow any signed-in user. */
  roles?: Role[];
  children?: ReactNode;
}

/**
 * Guards a route subtree. Unauthenticated users are sent to /login with the
 * attempted location in state so they land back where they were after sign-in.
 */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Alert variant="warning" title="Access restricted">
        Your role ({user.role}) doesn't have permission to view this page. Ask an administrator for access.
      </Alert>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
