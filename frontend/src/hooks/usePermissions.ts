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

const ROLE_HIERARCHY: Record<string, number> = {
  SUPERADMIN: 100,
  ADMIN: 80,
  RESPONSABLE_COLLECTE: 60,
  AGENT_COLLECTE: 40,
  RESPONSABLE_DECHARGE: 40,
  OBSERVATEUR: 10,
};

export function useCan() {
  const user = useAuthStore((s) => s.user);
  const perms = user?.permissions || [];
  const isSuperuser = user?.is_superuser || false;

  return {
    can: (permission: string) => isSuperuser || perms.includes(permission),
    cannot: (permission: string) => !(isSuperuser || perms.includes(permission)),
  };
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const perms = user?.permissions || [];
  const isSuperuser = user?.is_superuser || false;

  return {
    hasPermission: (p: string) => isSuperuser || perms.includes(p),
    hasAnyPermission: (ps: string[]) => isSuperuser || ps.some((p) => perms.includes(p)),
    hasAllPermissions: (ps: string[]) => isSuperuser || ps.every((p) => perms.includes(p)),
  };
}

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || '';
  const isSuperuser = user?.is_superuser || false;

  return {
    hasRole: (r: string) => isSuperuser || role === r,
    hasRoleOrAbove: (r: string) => {
      if (isSuperuser) return true;
      const currentLevel = ROLE_HIERARCHY[role] || 0;
      const requiredLevel = ROLE_HIERARCHY[r] || 0;
      return currentLevel >= requiredLevel;
    },
  };
}
