import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export function useHasRole(allowedRoles: string | string[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

export function useHasPermission(requiredPermissions: string | string[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  const userPermissions = user.permissions || [];
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  return required.some((perm) => userPermissions.includes(perm));
}

export function useHasAllPermissions(requiredPermissions: string | string[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  const userPermissions = user.permissions || [];
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  return required.every((perm) => userPermissions.includes(perm));
}

export function useIsAdmin(): boolean {
  return useHasRole(['SUPERADMIN', 'ADMIN']);
}

export function useIsSuperAdmin(): boolean {
  return useHasRole('SUPERADMIN');
}

export function useCanManageUsers(): boolean {
  return useHasPermission([
    'accounts.add_user',
    'accounts.change_user',
    'accounts.delete_user',
    'accounts.view_user',
  ]);
}

export function useCanManageRoles(): boolean {
  return useHasPermission([
    'auth.add_group',
    'auth.change_group',
    'auth.delete_group',
    'auth.view_group',
  ]);
}

export function useCanManagePermissions(): boolean {
  return useHasPermission([
    'auth.add_permission',
    'auth.change_permission',
    'auth.delete_permission',
    'auth.view_permission',
  ]);
}
