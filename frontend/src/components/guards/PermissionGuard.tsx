import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: string | string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAll?: boolean;
}

export default function PermissionGuard({
  children,
  requiredPermissions,
  fallback,
  redirectTo = '/forbidden',
  requireAll = false,
}: PermissionGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPermissions = user.permissions || [];
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  const hasPermission = requireAll
    ? required.every((perm) => userPermissions.includes(perm))
    : required.some((perm) => userPermissions.includes(perm));

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
