import { useMemo } from 'react'
import { useAuthStore } from '../store'

const ROLE_HIERARCHY = {
  SUPERADMIN: 100,
  ADMIN: 80,
  RECUPERATEUR: 60,
  RESPONSABLE_COLLECTE: 60,
  AGENT_COLLECTE: 40,
  RESPONSABLE_DECHARGE: 40,
  OBSERVATEUR: 10,
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

export function useCurrentUser() {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const isAuthenticated = !!user && !loading

  return useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    id: user?.id ?? null,
    username: user?.username ?? '',
    fullName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email ?? '',
    role: user?.role ?? null,
    roleDisplay: user?.role_display ?? '',
    isSuperuser: user?.is_superuser ?? false,
    isStaff: user?.is_staff ?? false,
    permissions: user?.permissions ?? [],
    groups: user?.groups ?? [],
    wilaya: user?.wilaya ?? '',
    phone: user?.phone ?? '',
  }), [user, loading])
}

export function usePermissions() {
  const { isAuthenticated, permissions, isSuperuser } = useCurrentUser()

  const hasPermission = useMemo(() => {
    return (perm) => {
      if (!isAuthenticated) return false
      if (isSuperuser) return true
      return permissions.includes(perm)
    }
  }, [isAuthenticated, isSuperuser, permissions])

  const hasAnyPermission = useMemo(() => {
    return (perms) => {
      if (!isAuthenticated) return false
      if (isSuperuser) return true
      const list = normalizeArray(perms)
      return list.some(p => permissions.includes(p))
    }
  }, [isAuthenticated, isSuperuser, permissions])

  const hasAllPermissions = useMemo(() => {
    return (perms) => {
      if (!isAuthenticated) return false
      if (isSuperuser) return true
      const list = normalizeArray(perms)
      return list.every(p => permissions.includes(p))
    }
  }, [isAuthenticated, isSuperuser, permissions])

  const permissionsByModule = useMemo(() => {
    const grouped = {}
    permissions.forEach(p => {
      const [module] = p.split('.')
      if (!grouped[module]) grouped[module] = []
      grouped[module].push(p)
    })
    return grouped
  }, [permissions])

  const canView = useMemo(() => (model) => hasPermission(`${model}.view_${model.split('.').pop()}`), [hasPermission])
  const canAdd = useMemo(() => (model) => hasPermission(`${model}.add_${model.split('.').pop()}`), [hasPermission])
  const canChange = useMemo(() => (model) => hasPermission(`${model}.change_${model.split('.').pop()}`), [hasPermission])
  const canDelete = useMemo(() => (model) => hasPermission(`${model}.delete_${model.split('.').pop()}`), [hasPermission])
  const canApprove = useMemo(() => (model) => hasPermission(`${model}.approve_${model.split('.').pop()}`), [hasPermission])
  const canReject = useMemo(() => (model) => hasPermission(`${model}.reject_${model.split('.').pop()}`), [hasPermission])
  const canValidate = useMemo(() => (model) => hasPermission(`${model}.validate_${model.split('.').pop()}`), [hasPermission])
  const canExport = useMemo(() => (model) => hasPermission(`${model}.export_${model.split('.').pop()}`) || hasPermission(`${model}.view_${model.split('.').pop()}`), [hasPermission])
  const canPrint = useMemo(() => (model) => hasPermission(`${model}.print_${model.split('.').pop()}`) || hasPermission(`${model}.view_${model.split('.').pop()}`), [hasPermission])

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissionsByModule,
    canView,
    canAdd,
    canChange,
    canDelete,
    canApprove,
    canReject,
    canValidate,
    canExport,
    canPrint,
  }
}

export function useCan() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  const { isSuperuser } = useCurrentUser()

  const can = useMemo(() => {
    return (perm, ...extra) => {
      if (Array.isArray(perm)) return hasAnyPermission(perm)
      if (extra.length > 0) return hasAnyPermission([perm, ...extra])
      return hasPermission(perm)
    }
  }, [hasPermission, hasAnyPermission])

  const cannot = useMemo(() => {
    return (perm, ...extra) => !can(perm, ...extra)
  }, [can])

  return useMemo(() => ({
    can,
    cannot,
    isSuperuser,
  }), [can, cannot, isSuperuser])
}

export function useRole() {
  const { user, isAuthenticated, role, isSuperuser } = useCurrentUser()

  const hasRole = useMemo(() => {
    return (...roles) => {
      if (!isAuthenticated) return false
      return roles.includes(role)
    }
  }, [isAuthenticated, role])

  const hasRoleOrAbove = useMemo(() => {
    return (minRole) => {
      if (!isAuthenticated) return false
      if (isSuperuser) return true
      const userLevel = ROLE_HIERARCHY[role] || 0
      const minLevel = ROLE_HIERARCHY[minRole] || 0
      return userLevel >= minLevel
    }
  }, [isAuthenticated, isSuperuser, role])

  return useMemo(() => ({
    role,
    hasRole,
    hasRoleOrAbove,
    isSuperuser,
    isAdmin: hasRole('SUPERADMIN', 'ADMIN'),
    isCollecte: hasRole('RESPONSABLE_COLLECTE', 'AGENT_COLLECTE'),
    isDecharge: hasRole('RESPONSABLE_DECHARGE'),
    isObservateur: hasRole('OBSERVATEUR'),
  }), [role, hasRole, hasRoleOrAbove, isSuperuser])
}

export function useAuthorization() {
  const user = useCurrentUser()
  const perms = usePermissions()
  const role = useRole()
  const can = useCan()

  return useMemo(() => ({
    ...user,
    ...perms,
    ...role,
    ...can,
  }), [user, perms, role, can])
}
