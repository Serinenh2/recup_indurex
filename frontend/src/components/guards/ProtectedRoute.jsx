import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0D1B0A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Chargement...</p>
      </div>
    </div>
  )
}

function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0D1B0A]">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-4xl font-bold text-red-600">403</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accès refusé</h1>
        <p className="text-slate-500 max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <a href="/dashboard" className="btn-primary inline-flex">
          Retour au tableau de bord
        </a>
      </div>
    </div>
  )
}

const ROLE_HIERARCHY = {
  SUPERADMIN: 100, ADMIN: 80,
  RECUPERATEUR: 60, RESPONSABLE_COLLECTE: 60,
  AGENT_COLLECTE: 40, RESPONSABLE_DECHARGE: 40,
  OBSERVATEUR: 10,
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

export default function ProtectedRoute({
  children,
  roles,
  role,
  permission,
  permissions,
  requireAll = false,
  redirectTo = '/dashboard',
  showForbidden = false,
}) {
  const { user, loading: isLoading, isAuthenticated, isSuperuser: isSuper, role: userRole, permissions: userPerms } = useCurrentUser()
  const location = useLocation()

  const loading = isLoading
  const isSuperuser = isSuper
  const userPermsList = Array.isArray(userPerms) ? userPerms : []

  if (loading) return <LoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role || roles) {
    const allowed = normalizeArray(roles || role)
    const hasRole = isSuperuser || allowed.includes(userRole)
    if (!hasRole) {
      if (showForbidden) return <ForbiddenPage />
      return <Navigate to={redirectTo} replace />
    }
  }

  if (permission || permissions) {
    const required = normalizeArray(permissions || permission)
    const hasPerm = isSuperuser || (requireAll
      ? required.every(p => userPermsList.includes(p))
      : required.some(p => userPermsList.includes(p))
    )
    if (!hasPerm) {
      if (showForbidden) return <ForbiddenPage />
      return <Navigate to={redirectTo} replace />
    }
  }

  return children
}
