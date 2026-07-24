import { create } from 'zustand'
import api from './api'
import { setSentryUser } from './sentry'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  login: async (username, password) => {
    const { data } = await api.post('/auth/token/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await api.get('/accounts/me/')
    set({ user: me.data, loading: false })
    setSentryUser(me.data)
    return me.data
  },

  logout: () => {
    localStorage.clear()
    set({ user: null })
    setSentryUser(null)
  },

  loadUser: async () => {
    const t = localStorage.getItem('access_token')
    if (!t) { set({ loading: false }); return }
    try {
      const { data } = await api.get('/accounts/me/')
      set({ user: data, loading: false })
      setSentryUser(data)
    } catch { set({ loading: false }) }
  },

  hasPermission: (perm) => {
    const user = get().user
    if (!user) return false
    if (user.is_superuser) return true
    return (user.permissions || []).includes(perm)
  },

  hasRole: (...roles) => {
    const user = get().user
    if (!user) return false
    return roles.includes(user.role)
  },

  hasRoleOrAbove: (minRole) => {
    const user = get().user
    if (!user) return false
    const hierarchy = {
      SUPERADMIN: 100, ADMIN: 80,
      RESPONSABLE_COLLECTE: 60, AGENT_COLLECTE: 40,
      RESPONSABLE_DECHARGE: 40, OBSERVATEUR: 10,
    }
    return (hierarchy[user.role] || 0) >= (hierarchy[minRole] || 0)
  },
}))
