import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../features/auth/authSlice';

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
