import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, fallback, redirectTo = '/forbidden' }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;
  const allowed = Array.isArray(allowedRoles) ? allowedRoles.includes(userRole) : userRole === allowedRoles;

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
