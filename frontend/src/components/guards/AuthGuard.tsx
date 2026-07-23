import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCurrentUser } from '../../features/auth/api';
import LoadingScreen from '../ui/LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const location = useLocation();

  if (authLoading || userLoading) return <LoadingScreen />;
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
