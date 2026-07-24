import { useMemo } from 'react'
import { NAV_ITEMS, MENU_SECTIONS } from '../config/menu'
import { useCurrentUser } from './useAuth'

function matchesPermission(item, permissions, isSuperuser) {
  if (!item.permission) return true
  if (isSuperuser) return true
  return permissions.includes(item.permission)
}

function matchesRole(item, role, isSuperuser) {
  if (!item.roles) return true
  if (isSuperuser) return true
  return item.roles.includes(role)
}

function isItemVisible(item, { permissions, role, isSuperuser }) {
  return matchesPermission(item, permissions, isSuperuser) &&
         matchesRole(item, role, isSuperuser)
}

export function useNavigation() {
  const { user, permissions, role, isSuperuser } = useCurrentUser()
  const userPermissions = permissions || []
  const userRole = role || ''
  const userIsSuperuser = isSuperuser || false

  const visibleItems = useMemo(() => {
    const auth = { permissions: userPermissions, role: userRole, isSuperuser: userIsSuperuser }
    return NAV_ITEMS.filter(item => isItemVisible(item, auth))
  }, [userPermissions, userRole, userIsSuperuser])

  const sections = useMemo(() => {
    const grouped = {}
    visibleItems.forEach(item => {
      const section = item.section || 'main'
      if (!grouped[section]) grouped[section] = []
      grouped[section].push(item)
    })
    return grouped
  }, [visibleItems])

  const hasAdminSection = useMemo(() => {
    return visibleItems.some(item => item.section === 'admin')
  }, [visibleItems])

  const canAccess = useMemo(() => {
    return (itemId) => {
      const item = NAV_ITEMS.find(i => i.id === itemId)
      if (!item) return false
      return isItemVisible(item, { permissions: userPermissions, role: userRole, isSuperuser: userIsSuperuser })
    }
  }, [userPermissions, userRole, userIsSuperuser])

  return {
    items: visibleItems,
    sections,
    hasAdminSection,
    canAccess,
    sectionLabels: MENU_SECTIONS,
  }
}
