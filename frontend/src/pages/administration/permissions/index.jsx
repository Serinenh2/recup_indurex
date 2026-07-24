import { useState, useEffect, useMemo } from 'react'
import {
  Key, Shield, Search, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Users, Layers, Eye, Plus, Pencil, Trash2, Info, Filter,
  ArrowUpDown, ArrowUp, ArrowDown, Hash
} from 'lucide-react'
import { useAuthStore } from '../../../store'
import api from '../../../api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ACTION_META = {
  view:    { label: 'Lire',     icon: Eye,      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  add:     { label: 'Créer',    icon: Plus,     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  change:  { label: 'Modifier', icon: Pencil,   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  delete:  { label: 'Supprimer',icon: Trash2,   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {sub && <p className="text-[0.65rem] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function PermissionDetailDrawer({ open, perm, roles, allPerms, onClose }) {
  const [selectedPerm, setSelectedPerm] = useState(perm)

  useEffect(() => { setSelectedPerm(perm) }, [perm])

  if (!open || !selectedPerm) return null

  const permKey = `${selectedPerm.app_label}.${selectedPerm.codename}`
  const action = selectedPerm.codename.split('_')[0]
  const meta = ACTION_META[action] || { label: action, color: 'badge-gray' }
  const rolesWithPerm = roles.filter(r => r.permissions_list?.includes(permKey))

  const relatedPerms = allPerms.filter(
    p => p.app_label === selectedPerm.app_label && p.id !== selectedPerm.id
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white dark:bg-[#16240D] shadow-2xl border-l border-[#E2E8F0] dark:border-[#2B3D1E] overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-white dark:bg-[#16240D] border-b border-[#E2E8F0] dark:border-[#2B3D1E] p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold">Détails de la Permission</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2B3D1E]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Permission identity */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white flex-shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedPerm.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{selectedPerm.app_label}</p>
            </div>
          </div>

          {/* Details card */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">Codename:</span>
              <code className="font-mono text-xs bg-slate-100 dark:bg-[#2B3D1E] px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                {selectedPerm.codename}
              </code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">Clé complète:</span>
              <code className="font-mono text-xs bg-slate-100 dark:bg-[#2B3D1E] px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                {permKey}
              </code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">Action:</span>
              <span className={clsx('badge text-xs', meta.color)}>{meta.label}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">ID:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{selectedPerm.id}</span>
            </div>
          </div>

          {/* Assigned roles */}
          <div className="card p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Rôles assignés ({rolesWithPerm.length})
            </p>
            {rolesWithPerm.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucun rôle n'a cette permission</p>
            ) : (
              <div className="space-y-2">
                {rolesWithPerm.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1B0A] border border-[#E2E8F0] dark:border-[#2B3D1E]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium">{r.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{r.user_count} utilisateur(s)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related permissions in same module */}
          {relatedPerms.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-3">Autres permissions dans « {selectedPerm.app_label} »</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {relatedPerms.map(p => {
                  const a = p.codename.split('_')[0]
                  const m = ACTION_META[a] || { label: a, color: 'badge-gray' }
                  return (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1A2E10] text-sm cursor-pointer"
                      onClick={() => setSelectedPerm(p)}>
                      <span className={clsx('badge text-[0.6rem]', m.color)}>{m.label}</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate">{p.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AdminPermissionsPage() {
  const [roles, setRoles] = useState([])
  const [allPerms, setAllPerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [expandedModules, setExpandedModules] = useState({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPerm, setSelectedPerm] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/accounts/roles/'),
        api.get('/accounts/permissions/'),
      ])
      setRoles(rolesRes.data)
      setAllPerms(permsRes.data)
    } catch {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const modules = useMemo(() => {
    const map = {}
    allPerms.forEach(p => {
      if (!map[p.app_label]) map[p.app_label] = []
      map[p.app_label].push(p)
    })
    return map
  }, [allPerms])

  const moduleList = useMemo(() => Object.keys(modules).sort(), [modules])

  const actionCounts = useMemo(() => {
    const counts = {}
    allPerms.forEach(p => {
      const action = p.codename.split('_')[0]
      counts[action] = (counts[action] || 0) + 1
    })
    return counts
  }, [allPerms])

  const filteredGrouped = useMemo(() => {
    const result = {}
    Object.entries(modules).forEach(([module, perms]) => {
      if (moduleFilter && module !== moduleFilter) return
      let filtered = perms
      if (actionFilter) {
        filtered = filtered.filter(p => p.codename.split('_')[0] === actionFilter)
      }
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.codename.toLowerCase().includes(q) ||
          module.toLowerCase().includes(q)
        )
      }
      if (filtered.length > 0) result[module] = filtered
    })
    return result
  }, [modules, moduleFilter, actionFilter, search])

  const visibleCount = useMemo(() =>
    Object.values(filteredGrouped).reduce((sum, perms) => sum + perms.length, 0),
    [filteredGrouped]
  )

  const toggleModule = (module) => {
    setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }))
  }

  const expandAll = () => {
    const all = {}
    Object.keys(filteredGrouped).forEach(m => { all[m] = true })
    setExpandedModules(all)
  }

  const collapseAll = () => setExpandedModules({})

  const openDrawer = (perm) => { setSelectedPerm(perm); setDrawerOpen(true) }

  const getRolesWithPerm = (permKey) => roles.filter(r => r.permissions_list?.includes(permKey))

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Permissions</h1>
            <p className="text-sm text-slate-500">{allPerms.length} permissions dans {moduleList.length} modules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="btn-secondary btn-sm">Tout déplier</button>
          <button onClick={collapseAll} className="btn-secondary btn-sm">Tout replier</button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Key} label="Permissions totales" value={allPerms.length}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
        <StatCard icon={Layers} label="Modules" value={moduleList.length}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
          sub={moduleList.map(m => modules[m]?.[0]?.app_label).filter(Boolean).slice(0, 3).join(', ') + (moduleList.length > 3 ? '...' : '')} />
        <StatCard icon={Shield} label="Rôles configurés" value={roles.length}
          color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" />
        <StatCard icon={Users} label="Utilisateurs actifs" value={roles.reduce((s, r) => s + r.user_count, 0)}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" />
      </div>

      {/* Action breakdown */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Répartition par action</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).map(([action, count]) => {
            const meta = ACTION_META[action] || { label: action, color: 'badge-gray' }
            return (
              <button key={action}
                onClick={() => setActionFilter(actionFilter === action ? '' : action)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                  actionFilter === action
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-400'
                    : 'border-[#E2E8F0] dark:border-[#2B3D1E] hover:bg-slate-50 dark:hover:bg-[#1A2E10]'
                )}>
                <span className={clsx('badge text-[0.6rem]', meta.color)}>{meta.label}</span>
                <span className="font-bold text-slate-900 dark:text-white">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 dark:bg-[#1A2E10] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Rechercher une permission..." />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
              className="input w-auto min-w-[160px]">
              <option value="">Tous les modules</option>
              {moduleList.map(m => (
                <option key={m} value={m}>{m} ({modules[m]?.length || 0})</option>
              ))}
            </select>
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
              className="input w-auto min-w-[140px]">
              <option value="">Toutes les actions</option>
              {Object.entries(ACTION_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          {(search || moduleFilter || actionFilter) && (
            <span className="text-xs text-slate-400">{visibleCount} résultat(s)</span>
          )}
        </div>
      </div>

      {/* Module groups */}
      <div className="space-y-3">
        {Object.entries(filteredGrouped).length === 0 ? (
          <div className="card p-12 text-center">
            <Key className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Aucune permission trouvée</p>
            <p className="text-xs text-slate-300 mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          Object.entries(filteredGrouped).map(([module, perms]) => {
            const expanded = expandedModules[module]
            const uniqueActions = [...new Set(perms.map(p => p.codename.split('_')[0]))]
            return (
              <div key={module} className="card overflow-hidden">
                {/* Module header */}
                <button onClick={() => toggleModule(module)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-[#1A2E10] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{module}</span>
                        <span className="badge badge-gray text-[0.6rem]">{perms.length} perm.</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {uniqueActions.map(a => {
                          const m = ACTION_META[a] || { label: a, color: 'badge-gray' }
                          return (
                            <span key={a} className={clsx('badge text-[0.55rem]', m.color)}>{m.label}</span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {roles.filter(r => r.permissions_list?.some(p => p.startsWith(module + '.'))).length} rôle(s)
                    </span>
                    {expanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* Permissions table */}
                {expanded && (
                  <div className="border-t border-[#E2E8F0] dark:border-[#2B3D1E]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#1A2E10]">
                            <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Permission</th>
                            <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Action</th>
                            <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Codename</th>
                            <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Rôles</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {perms.map(p => {
                            const action = p.codename.split('_')[0]
                            const meta = ACTION_META[action] || { label: action, color: 'badge-gray' }
                            const permKey = `${p.app_label}.${p.codename}`
                            const rolesWithPerm = getRolesWithPerm(permKey)
                            return (
                              <tr key={p.id}
                                className="border-t border-[#E2E8F0] dark:border-[#2B3D1E] hover:bg-slate-50 dark:hover:bg-[#1A2E10] cursor-pointer"
                                onClick={() => openDrawer(p)}>
                                <td className="px-4 py-2.5">
                                  <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={clsx('badge text-xs', meta.color)}>{meta.label}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <code className="font-mono text-xs bg-slate-100 dark:bg-[#2B3D1E] px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                    {p.codename}
                                  </code>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-wrap gap-1">
                                    {rolesWithPerm.length === 0 ? (
                                      <span className="text-xs text-slate-400 italic">—</span>
                                    ) : rolesWithPerm.slice(0, 3).map(r => (
                                      <span key={r.id} className="badge badge-blue text-[0.6rem]">{r.name}</span>
                                    ))}
                                    {rolesWithPerm.length > 3 && (
                                      <span className="badge badge-gray text-[0.6rem]">+{rolesWithPerm.length - 3}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2.5">
                                  <button onClick={(e) => { e.stopPropagation(); openDrawer(p) }}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E]" title="Détails">
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Detail drawer */}
      <PermissionDetailDrawer open={drawerOpen} perm={selectedPerm} roles={roles} allPerms={allPerms}
        onClose={() => { setDrawerOpen(false); setSelectedPerm(null) }} />
    </div>
  )
}
