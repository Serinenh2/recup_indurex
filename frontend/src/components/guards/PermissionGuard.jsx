import { usePermissions } from '../../hooks/useAuth'

export default function PermissionGuard({ permission, permissions, requireAll = false, fallback = null, children }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  const perms = permissions || (permission ? [permission] : [])
  const granted = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)

  if (!granted) return fallback
  return children
}
