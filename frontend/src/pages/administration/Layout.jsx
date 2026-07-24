import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useNavigation } from '../../hooks/useNavigation'
import clsx from 'clsx'

const BREADCRUMB_MAP = {
  '/administration': 'Administration',
  '/administration/users': 'Utilisateurs',
  '/administration/roles': 'Rôles',
  '/administration/permissions': 'Permissions',
  '/administration/audit-logs': 'Journal d\'audit',
  '/administration/organization': 'Organisation',
  '/administration/settings': 'Paramètres',
}

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const label = BREADCRUMB_MAP[path] || segment
    const isLast = index === segments.length - 1
    return { path, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
      <NavLink to="/dashboard" className="hover:text-primary-600 transition-colors">
        Accueil
      </NavLink>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {crumb.isLast ? (
            <span className="text-slate-900 dark:text-white font-medium">{crumb.label}</span>
          ) : (
            <NavLink to={crumb.path} className="hover:text-primary-600 transition-colors">
              {crumb.label}
            </NavLink>
          )}
        </span>
      ))}
    </nav>
  )
}

export default function AdministrationLayout() {
  const { sections } = useNavigation()
  const adminItems = sections.admin || []

  if (adminItems.length === 0) return null

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-2">
            <nav className="space-y-0.5">
              {adminItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A2E10]'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
