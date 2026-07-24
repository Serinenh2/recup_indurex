import { useCan } from '../../hooks/useAuth'

export default function Can({ do: permission, not, fallback = null, children }) {
  const { can, cannot } = useCan()

  if (permission) {
    if (cannot(permission)) return fallback
  } else if (not) {
    if (can(not)) return fallback
  }

  return children
}
