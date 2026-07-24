import { useState, useEffect, useMemo } from 'react'
import {
  Users, Plus, Search, Edit, Trash2, Eye, EyeOff, X,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Shield, Key, UserCheck, UserX, Filter,
  Mail, Phone, MapPin, AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '../../../store'
import api from '../../../api'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Can, useCan } from '../../../components/guards'

const ROLES = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  RECUPERATEUR: 'Récupérateur',
  RESPONSABLE_COLLECTE: 'Resp. Collecte',
  AGENT_COLLECTE: 'Agent Collecte',
  RESPONSABLE_DECHARGE: 'Resp. Décharge',
  OBSERVATEUR: 'Observateur',
}

const ROLE_BADGE = {
  SUPERADMIN: 'badge-red',
  ADMIN: 'badge-blue',
  RECUPERATEUR: 'badge-green',
  RESPONSABLE_COLLECTE: 'badge-green',
  AGENT_COLLECTE: 'badge-green',
  RESPONSABLE_DECHARGE: 'badge-yellow',
  OBSERVATEUR: 'badge-gray',
}

const PAGE_SIZE = 10

function UserFormDialog({ open, onClose, user, onSave, loading }) {
  const isEdit = !!user
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', wilaya: '', role: 'OBSERVATEUR', password: '',
  })

  useEffect(() => {
    if (open) {
      setErrors({})
      setShowPwd(false)
      setForm(user ? {
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        wilaya: user.wilaya || '',
        role: user.role || 'OBSERVATEUR',
        password: '',
      } : {
        username: '', email: '', first_name: '', last_name: '',
        phone: '', wilaya: '', role: 'OBSERVATEUR', password: '',
      })
    }
  }, [open, user])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = ' requis'
    if (!form.first_name.trim()) errs.first_name = ' requis'
    if (!form.last_name.trim()) errs.last_name = ' requis'
    if (!form.email.trim()) errs.email = ' requis'
    if (!isEdit && !form.password) errs.password = ' requis'
    if (!isEdit && form.password && form.password.length < 8) errs.password = ' min. 8 caractères'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (validate()) onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-[#16240D] rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#2B3D1E]">
          <div className="flex items-center gap-3">
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', isEdit ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}>
              {isEdit ? <Edit className="w-4 h-4 text-primary-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
            </div>
            <h3 className="text-lg font-bold">{isEdit ? 'Modifier' : 'Nouvel'} Utilisateur</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2B3D1E]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom <span className="text-red-500">*</span></label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} className={clsx('input', errors.first_name && 'ring-2 ring-red-500')} />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="label">Nom <span className="text-red-500">*</span></label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} className={clsx('input', errors.last_name && 'ring-2 ring-red-500')} />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
            </div>
          </div>
          <div>
            <label className="label">Nom d'utilisateur <span className="text-red-500">*</span></label>
            <input value={form.username} onChange={e => set('username', e.target.value)} className={clsx('input', errors.username && 'ring-2 ring-red-500')} disabled={isEdit} />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input value={form.email} onChange={e => set('email', e.target.value)} type="email" className={clsx('input', errors.email && 'ring-2 ring-red-500')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Téléphone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="0555555555" />
            </div>
            <div>
              <label className="label">Wilaya</label>
              <input value={form.wilaya} onChange={e => set('wilaya', e.target.value)} className="input" placeholder="16" maxLength={3} />
            </div>
          </div>
          <div>
            <label className="label">Rôle</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input">
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="label">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <input value={form.password} onChange={e => set('password', e.target.value)}
                  type={showPwd ? 'text' : 'password'} className={clsx('input pr-10', errors.password && 'ring-2 ring-red-500')} placeholder="Min. 8 caractères" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#2B3D1E]">
            <button onClick={onClose} className="btn-secondary btn-sm">Annuler</button>
            <Can do={isEdit ? 'accounts.change_user' : 'accounts.add_user'}>
              <button onClick={handleSave} disabled={loading} className="btn-primary btn-sm">
                {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({ open, onClose, onConfirm, userName, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-[#16240D] rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold">Supprimer l'utilisateur</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Voulez-vous vraiment supprimer <strong>{userName}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary btn-sm">Annuler</button>
          <Can do="accounts.delete_user">
            <button onClick={onConfirm} disabled={loading} className="btn-danger btn-sm">
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </Can>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordDialog({ open, onClose, onConfirm, userName, loading }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setPassword(''); setConfirm(''); setError(''); setShowPwd(false) }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    if (!password) { setError('Le mot de passe est requis'); return }
    if (password.length < 8) { setError('Min. 8 caractères'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    onConfirm(password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-[#16240D] rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold">Réinitialiser le mot de passe</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Nouveau mot de passe pour <strong>{userName}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <label className="label">Nouveau mot de passe</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min. 8 caractères" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirmer</label>
            <input value={confirm} onChange={e => setConfirm(e.target.value)}
              type={showPwd ? 'text' : 'password'} className="input" placeholder="Confirmer le mot de passe" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary btn-sm">Annuler</button>
            <Can do="accounts.change_user">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary btn-sm">
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDetailPanel({ open, user, onClose, onEdit, onResetPassword, onToggleActive }) {
  if (!open || !user) return null

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white dark:bg-[#16240D] shadow-2xl border-l border-[#E2E8F0] dark:border-[#2B3D1E] overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-white dark:bg-[#16240D] border-b border-[#E2E8F0] dark:border-[#2B3D1E] p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold">Détails Utilisateur</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2B3D1E]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-slate-500">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx('badge', ROLE_BADGE[user.role] || 'badge-gray')}>{ROLES[user.role] || user.role}</span>
                <span className={clsx('badge', user.is_active !== false ? 'badge-green' : 'badge-red')}>
                  {user.is_active !== false ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500">Email:</span>
              <span className="font-medium">{user.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500">Tél:</span>
              <span className="font-medium">{user.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500">Wilaya:</span>
              <span className="font-medium">{user.wilaya || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500">Superuser:</span>
              <span className="font-medium">{user.is_superuser ? 'Oui' : 'Non'}</span>
            </div>
          </div>

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-2">Permissions ({user.permissions.length})</p>
              <div className="flex flex-wrap gap-1">
                {user.permissions.slice(0, 20).map(p => (
                  <span key={p} className="badge badge-gray text-[0.6rem]">{p}</span>
                ))}
                {user.permissions.length > 20 && (
                  <span className="badge badge-gray text-[0.6rem]">+{user.permissions.length - 20}</span>
                )}
              </div>
            </div>
          )}

          {/* Groups */}
          {user.groups && user.groups.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-2">Groupes</p>
              <div className="flex flex-wrap gap-1">
                {user.groups.map(g => (
                  <span key={g} className="badge badge-blue">{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Can do="accounts.change_user">
              <button onClick={() => onEdit(user)} className="btn-secondary btn-sm w-full justify-start">
                <Edit className="w-4 h-4" /> Modifier
              </button>
            </Can>
            <Can do="accounts.change_user">
              <button onClick={() => onResetPassword(user)} className="btn-secondary btn-sm w-full justify-start">
                <Key className="w-4 h-4" /> Réinitialiser le mot de passe
              </button>
            </Can>
            <Can do="accounts.change_user">
              <button onClick={() => onToggleActive(user)} className={clsx('btn-sm w-full justify-start', user.is_active !== false ? 'btn-danger' : 'btn-success')}>
                {user.is_active !== false ? <><UserX className="w-4 h-4" /> Désactiver</> : <><UserCheck className="w-4 h-4" /> Activer</>}
              </button>
            </Can>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [sortField, setSortField] = useState('username')
  const [sortDir, setSortDir] = useState('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const currentUser = useAuthStore(s => s.user)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const { data } = await api.get('/accounts/users/', { params })
      setUsers(data.results || [])
      setCount(data.count || 0)
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, search, roleFilter])

  const filteredUsers = useMemo(() => {
    let list = [...users]
    if (statusFilter === 'active') list = list.filter(u => u.is_active !== false)
    if (statusFilter === 'inactive') list = list.filter(u => u.is_active === false)
    list.sort((a, b) => {
      const av = (a[sortField] || '').toString().toLowerCase()
      const bv = (b[sortField] || '').toString().toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, statusFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary-600" />
      : <ArrowDown className="w-3 h-3 text-primary-600" />
  }

  // CRUD handlers
  const handleCreate = () => { setSelectedUser(null); setFormOpen(true) }
  const handleEdit = (u) => { setSelectedUser(u); setFormOpen(true); setDetailOpen(false) }
  const handleView = (u) => { setSelectedUser(u); setDetailOpen(true) }
  const handleDelete = (u) => { setSelectedUser(u); setDeleteOpen(true); setDetailOpen(false) }
  const handleResetPassword = (u) => { setSelectedUser(u); setResetPwdOpen(true); setDetailOpen(false) }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (selectedUser) {
        const { password, ...patchData } = formData
        await api.patch(`/accounts/users/${selectedUser.id}/`, patchData)
        toast.success('Utilisateur modifié')
      } else {
        await api.post('/accounts/users/create/', formData)
        toast.success('Utilisateur créé')
      }
      setFormOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de l\'enregistrement'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/accounts/users/${selectedUser.id}/`)
      toast.success('Utilisateur supprimé')
      setDeleteOpen(false)
      setSelectedUser(null)
      if (detailOpen) setDetailOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmResetPassword = async (newPassword) => {
    setSaving(true)
    try {
      await api.post(`/accounts/users/${selectedUser.id}/reset-password/`, { new_password: newPassword })
      toast.success('Mot de passe réinitialisé')
      setResetPwdOpen(false)
      setSelectedUser(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la réinitialisation')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u) => {
    const newActive = u.is_active === false ? true : false
    try {
      await api.patch(`/accounts/users/${u.id}/`, { is_active: newActive })
      toast.success(newActive ? 'Utilisateur activé' : 'Utilisateur désactivé')
      setDetailOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la modification du statut')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Utilisateurs</h1>
            <p className="text-sm text-slate-500">{count} utilisateur(s) au total</p>
          </div>
        </div>
        <Can do="accounts.add_user">
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouvel Utilisateur
          </button>
        </Can>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 dark:bg-[#1A2E10] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Rechercher par nom, username ou email..." />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              className="input w-auto min-w-[160px]">
              <option value="">Tous les rôles</option>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="input w-auto min-w-[140px]">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#2B3D1E] bg-slate-50 dark:bg-[#1A2E10]">
                {[
                  { key: 'username', label: 'Utilisateur' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Rôle' },
                  { key: 'wilaya', label: 'Wilaya' },
                  { key: 'is_active', label: 'Statut' },
                ].map(col => (
                  <th key={col.key}
                    className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-1.5">
                      {col.label} <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-400">Aucun utilisateur trouvé</p>
                    <p className="text-xs text-slate-300 mt-1">Essayez de modifier vos filtres</p>
                  </td>
                </tr>
              ) : filteredUsers.map(u => {
                const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || 'U'
                return (
                  <tr key={u.id}
                    className="border-b border-[#E2E8F0] dark:border-[#2B3D1E] hover:bg-slate-50 dark:hover:bg-[#1A2E10] cursor-pointer"
                    onClick={() => handleView(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', ROLE_BADGE[u.role] || 'badge-gray')}>{ROLES[u.role] || u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.wilaya || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.is_active !== false ? 'badge-green' : 'badge-red')}>
                        {u.is_active !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Can do="accounts.change_user">
                          <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E]" title="Modifier">
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </Can>
                        <Can do="accounts.change_user">
                          <button onClick={() => handleResetPassword(u)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E]" title="Réinitialiser le mot de passe">
                            <Key className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </Can>
                        {u.id !== currentUser?.id && (
                          <Can do="accounts.delete_user">
                            <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10" title="Supprimer">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </Can>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] dark:border-[#2B3D1E]">
            <span className="text-xs text-slate-400">{count} résultat(s)</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page <= 1}
                className="px-2 py-1 rounded-lg text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                «
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400 px-3 font-medium">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
                className="px-2 py-1 rounded-lg text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserFormDialog open={formOpen} onClose={() => { setFormOpen(false); setSelectedUser(null) }}
        user={selectedUser} onSave={handleSave} loading={saving} />

      <DeleteDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedUser(null) }}
        onConfirm={handleConfirmDelete}
        userName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''} loading={saving} />

      <ResetPasswordDialog open={resetPwdOpen} onClose={() => { setResetPwdOpen(false); setSelectedUser(null) }}
        onConfirm={handleConfirmResetPassword}
        userName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''} loading={saving} />

      <UserDetailPanel open={detailOpen} user={selectedUser} onClose={() => { setDetailOpen(false); setSelectedUser(null) }}
        onEdit={handleEdit} onResetPassword={handleResetPassword} onToggleActive={handleToggleActive} />
    </div>
  )
}
