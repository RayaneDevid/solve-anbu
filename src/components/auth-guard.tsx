import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export function RequireAuth() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}

export function RequireChefAnbu() {
  const { isAuthenticated, isChefAnbu } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isChefAnbu) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.status === 'active') {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && user?.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}
