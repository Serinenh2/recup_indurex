import { useState, useEffect } from 'react'
import { Key, Shield, ChevronDown, ChevronUp, Loader2, Check, X, Search } from 'lucide-react'
import api from '../../../api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const MODULE_LABELS = {
  accounts: 'Utilisateurs',
  recuperateurs: 'Récupérateurs',
  traceability: 'Traçabilité',
  bsd: 'BSD',
  bl: 'Bordereau de Livraison',
  bc: 'Bon de Commande',
  declarations: 'Déclarations',
  inspections: 'Inspections',
  operateurs: 'Opérateurs',
  administration: 'Administration',
  nomenclature: 'Nomenclature',
  archive: 'Archive',
  ai_assistant: 'IA Assistant',
}

const ACTION_LABELS = { view: 'Lire', add: 'Créer', change: 'Modifier', delete: 'Supprimer' }
const ACTION_COLORS = { view: 'bg-blue-100 text-blue-700', add: 'bg-green-100 text-green-700', change: 'bg-amber-100 text-amber-700', delete: 'bg-red-100 text-red-700' }

export default function PermissionsPage() {
  const [roles, setRoles] = useState([])
  const [allPerms, setAllPerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/accounts/roles/'),
      api.get('/accounts/permissions/'),
    ]).then(([rolesRes, permsRes]) => {
      setRoles(rolesRes.data)
      setAllPerms(permsRes.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const groupedPerms = allPerms.reduce((acc, p) => {
    if (!acc[p.app_label]) acc[p.app_label] = []
    acc[p.app_label].push(p)
    return acc
  }, {})

  const filteredGrouped = Object.entries(groupedPerms).reduce((acc, [module, perms]) => {
    const filtered = search
      ? perms.filter(p =>
          p.codename.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (MODULE_LABELS[module] || module).toLowerCase().includes(search.toLowerCase())
        )
      : perms
    if (filtered.length > 0) acc[module] = filtered
    return acc
  }, {})

  const getRolesWithPerm = (permKey) => {
    return roles.filter(r => r.permissions_list.includes(permKey)).map(r => r.name)
  }

  const toggleModule = (module) => {
    setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }))
  }

  const expandAll = () => {
    const all = {}
    Object.keys(filteredGrouped).forEach(m => all[m] = true)
    setExpandedModules(all)
  }

  const collapseAll = () => setExpandedModules({})

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Permissions</h1>
            <p className="text-sm text-slate-500">{allPerms.length} permissions dans {Object.keys(groupedPerms).length} modules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="btn-secondary btn-sm">Tout déplier</button>
          <button onClick={collapseAll} className="btn-secondary btn-sm">Tout replier</button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1A2E10] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            placeholder="Rechercher une permission..."
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {Object.entries(filteredGrouped).map(([module, perms]) => {
          const expanded = expandedModules[module]
          return (
            <div key={module} className="card overflow-hidden">
              <button
                onClick={() => toggleModule(module)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#1A2E10]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {MODULE_LABELS[module] || module}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{perms.length} permissions</span>
                  </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expanded && (
                <div className="border-t border-[#E2E8F0] dark:border-[#2B3D1E]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1A2E10]">
                        <th className="text-left px-4 py-2 font-medium text-slate-600">Permission</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-600">Action</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-600">Codename</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-600">Rôles assignés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map(p => {
                        const action = p.codename.split('_')[0]
                        const permKey = `${p.app_label}.${p.codename}`
                        const rolesWithPerm = getRolesWithPerm(permKey)
                        return (
                          <tr key={p.id} className="border-t border-[#E2E8F0] dark:border-[#2B3D1E] hover:bg-slate-50 dark:hover:bg-[#1A2E10]">
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{p.name}</td>
                            <td className="px-4 py-2.5">
                              <span className={clsx('badge text-xs', ACTION_COLORS[action] || 'badge-gray')}>
                                {ACTION_LABELS[action] || action}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.codename}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {rolesWithPerm.length === 0 ? (
                                  <span className="text-xs text-slate-400 italic">Aucun rôle</span>
                                ) : rolesWithPerm.map(r => (
                                  <span key={r} className="badge-blue text-xs">{r}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
