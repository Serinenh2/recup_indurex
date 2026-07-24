import { useRole } from '../../hooks/useAuth'

export default function RoleGuard({ role, roles, fallback = null, children }) {
  const { hasRole, hasRoleOrAbove } = useRole()

  const target = roles || (role ? [role] : [])
  const granted = target.some(r => hasRoleOrAbove(r) || hasRole(r))

  if (!granted) return fallback
  return children
}
