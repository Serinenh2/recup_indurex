import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/useAuth'

export default function RequirePermission({ permission, permissions, requireAll = false, redirectTo = '/dashboard', children }) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  const perms = permissions || (permission ? [permission] : [])
  const granted = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)

  if (!granted) return <Navigate to={redirectTo} replace />
  return children
}
