import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList, Search, Filter, X, Download,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Calendar, User, Shield, AlertTriangle, CheckCircle,
  Clock, Trash2, Edit, Plus, LogIn, LogOut, ArrowRightLeft,
  Server, Globe, FileText, ChevronDown
} from 'lucide-react'
import api from '../../../api'
import { formatDateFR } from '../../../utils/formatDate'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ACTION_CFG = {
  CREATE:      { label: 'Création',     icon: Plus,          color: 'text-emerald-600', bg: 'bg-emerald-50',   badge: 'badge-green'  },
  UPDATE:      { label: 'Modification', icon: Edit,           color: 'text-blue-600',    bg: 'bg-blue-50',      badge: 'badge-blue'   },
  DELETE:      { label: 'Suppression',  icon: Trash2,         color: 'text-red-600',     bg: 'bg-red-50',       badge: 'badge-red'    },
  ASSIGN_ROLE: { label: 'Attribution',  icon: ArrowRightLeft, color: 'text-violet-600',  bg: 'bg-violet-50',    badge: 'bg-violet-100 text-violet-700' },
  LOGIN:       { label: 'Connexion',    icon: LogIn,          color: 'text-emerald-600', bg: 'bg-emerald-50',   badge: 'badge-green'  },
  LOGOUT:      { label: 'Déconnexion',  icon: LogOut,         color: 'text-slate-600',   bg: 'bg-slate-50',     badge: 'badge-gray'   },
}

const MODEL_LABELS = {
  User: 'Utilisateur',
  Group: 'Rôle',
  Traceability: 'Traçabilité',
  Operateur: 'Opérateur',
  BSD: 'BSD',
  BC: 'Bon de commande',
  BL: 'Bon de livraison',
  Declaration: 'Déclaration DSD',
  Inspection: 'Inspection',
  Document: 'Document',
}

const PAGE_SIZE = 20

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function RelativeTime({ date }) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return <span>à l'instant</span>
  if (mins < 60) return <span>il y a {mins}min</span>
  if (hours < 24) return <span>il y a {hours}h</span>
  if (days < 7) return <span>il y a {days}j</span>
  return <span>{formatDateFR(date)}</span>
}

function DetailsJson({ details }) {
  if (!details || Object.keys(details).length === 0) {
    return <span className="text-slate-400 italic">Aucun détail</span>
  }

  return (
    <div className="space-y-1.5">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-xs">
          <span className="font-mono font-semibold text-slate-500 min-w-[120px] flex-shrink-0">{key}</span>
          <span className="text-slate-700 dark:text-slate-300 break-all">
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '—')}
          </span>
        </div>
      ))}
    </div>
  )
}

function LogDetailDrawer({ log, onClose }) {
  if (!log) return null
  const cfg = ACTION_CFG[log.action_code] || ACTION_CFG.UPDATE
  const Icon = cfg.icon

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#16240D] h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-[#E2E8F0] dark:border-[#2B3D1E]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Détails de l'action</p>
                <p className="text-xs text-slate-500">#{log.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost p-2"><X size={16} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Action badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color}`}>
              <Icon size={12} /> {log.action}
            </span>
            {log.model_name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1A2E10] text-slate-600 dark:text-slate-400">
                <Server size={10} /> {MODEL_LABELS[log.model_name] || log.model_name}
              </span>
            )}
          </div>

          {/* Info rows */}
          <div className="space-y-0">
            {[
              { icon: User,       label: 'Utilisateur',   value: log.user || 'Système' },
              { icon: Shield,     label: 'Rôle',          value: log.user_role || '—' },
              { icon: FileText,   label: 'Entité',        value: log.model_name ? `${MODEL_LABELS[log.model_name] || log.model_name}${log.object_id ? ` #${log.object_id}` : ''}` : '—' },
              { icon: Globe,      label: 'Adresse IP',    value: log.ip_address || '—' },
              { icon: Clock,      label: 'Date',          value: log.timestamp ? new Date(log.timestamp).toLocaleString('fr-DZ') : '—' },
            ].map(({ icon: RowIcon, label, value }) => (
              <div key={label} className="flex gap-3 text-sm py-2.5 border-b border-slate-50 dark:border-[#1A2E10]">
                <span className="w-32 text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                  <RowIcon size={12} /> {label}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Détails</p>
            <div className="bg-slate-50 dark:bg-[#1A2E10] rounded-xl p-4">
              <DetailsJson details={log.details} />
            </div>
          </div>

          {/* Raw JSON toggle */}
          <details className="group">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none">
              Voir le JSON brut
            </summary>
            <pre className="mt-2 bg-slate-900 text-slate-300 rounded-xl p-4 text-xs overflow-x-auto max-h-64">
              {JSON.stringify(log, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('timestamp')
  const [sortDir, setSortDir] = useState('desc')
  const [detailLog, setDetailLog] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accounts/audit-log/', { params: { limit: 2000 } })
      setLogs(res.data || [])
    } catch {
      toast.error('Erreur chargement journal d\'audit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  // Unique values for filters
  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map(l => l.action_code))
    return [...set].sort()
  }, [logs])

  const uniqueModels = useMemo(() => {
    const set = new Set(logs.map(l => l.model_name).filter(Boolean))
    return [...set].sort()
  }, [logs])

  // Filter + search + sort
  const filtered = useMemo(() => {
    let result = [...logs]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        (l.user || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.model_name || '').toLowerCase().includes(q) ||
        (l.object_id || '').toLowerCase().includes(q) ||
        (l.ip_address || '').toLowerCase().includes(q)
      )
    }

    if (actionFilter) result = result.filter(l => l.action_code === actionFilter)
    if (modelFilter) result = result.filter(l => l.model_name === modelFilter)
    if (dateFrom) result = result.filter(l => new Date(l.timestamp) >= new Date(dateFrom))
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter(l => new Date(l.timestamp) <= to)
    }

    result.sort((a, b) => {
      let va = a[sortField]
      let vb = b[sortField]
      if (sortField === 'user') { va = va || ''; vb = vb || '' }
      if (sortField === 'timestamp') { va = new Date(va); vb = new Date(vb) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [logs, search, actionFilter, modelFilter, dateFrom, dateTo, sortField, sortDir])

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => { setPage(1) }, [search, actionFilter, modelFilter, dateFrom, dateTo])

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={11} className="text-slate-300" />
    return sortDir === 'asc'
      ? <ArrowUp size={11} className="text-primary-600" />
      : <ArrowDown size={11} className="text-primary-600" />
  }

  // Stats
  const stats = useMemo(() => ({
    total: logs.length,
    creates: logs.filter(l => l.action_code === 'CREATE').length,
    updates: logs.filter(l => l.action_code === 'UPDATE').length,
    deletes: logs.filter(l => l.action_code === 'DELETE').length,
    today: logs.filter(l => {
      const d = new Date(l.timestamp)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length,
  }), [logs])

  // Export CSV
  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Utilisateur', 'Action', 'Entité', 'Objet ID', 'Adresse IP', 'Détails']
    const rows = filtered.map(l => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString('fr-DZ') : '',
      l.user || '',
      l.action || '',
      l.model_name || '',
      l.object_id || '',
      l.ip_address || '',
      JSON.stringify(l.details || {}),
    ])
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  const hasFilters = search || actionFilter || modelFilter || dateFrom || dateTo

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Journal d'Audit</h1>
            <p className="text-sm text-slate-500">{filtered.length} entrée(s) — {stats.today} aujourd'hui</p>
          </div>
        </div>
        <button onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary btn-sm">
          <Download size={13} /> Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: stats.total,   color: 'bg-slate-500'    },
          { label: 'Créations', value: stats.creates, color: 'bg-emerald-500'  },
          { label: 'Modifs',    value: stats.updates, color: 'bg-blue-500'     },
          { label: 'Suppressions', value: stats.deletes, color: 'bg-red-500'   },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 dark:bg-[#1A2E10] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Rechercher par utilisateur, action, entité, IP..." />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
              className="input w-auto min-w-[140px]">
              <option value="">Toutes actions</option>
              {uniqueActions.map(a => (
                <option key={a} value={a}>{ACTION_CFG[a]?.label || a}</option>
              ))}
            </select>
          </div>

          <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}
            className="input w-auto min-w-[160px]">
            <option value="">Toutes entités</option>
            {uniqueModels.map(m => (
              <option key={m} value={m}>{MODEL_LABELS[m] || m}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="input w-auto" placeholder="Du" />
            <span className="text-slate-400">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="input w-auto" placeholder="Au" />
          </div>

          {hasFilters && (
            <button onClick={() => { setSearch(''); setActionFilter(''); setModelFilter(''); setDateFrom(''); setDateTo('') }}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#2B3D1E]">
                  {[
                    { key: 'timestamp', label: 'Date' },
                    { key: 'user',      label: 'Utilisateur' },
                    { key: 'action',    label: 'Action' },
                    { key: 'model_name', label: 'Entité' },
                    { key: 'object_id', label: 'Objet' },
                    { key: 'ip_address', label: 'IP' },
                  ].map(col => (
                    <th key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none">
                      <span className="flex items-center gap-1">
                        {col.label} <SortIcon field={col.key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <ClipboardList size={36} className="mx-auto mb-3 text-slate-200" />
                      <p className="font-semibold text-slate-400">Aucune entrée trouvée</p>
                      <p className="text-sm text-slate-300 mt-1">
                        {hasFilters ? 'Essayez de modifier vos filtres' : 'Le journal sera peau à mesure que le système est utilisé'}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map(log => {
                  const cfg = ACTION_CFG[log.action_code] || ACTION_CFG.UPDATE
                  const Icon = cfg.icon
                  return (
                    <tr key={log.id}
                      onClick={() => setDetailLog(log)}
                      className="border-b border-slate-50 dark:border-[#1A2E10] hover:bg-slate-50/50 dark:hover:bg-[#1A2E10]/50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {formatDateFR(log.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          <RelativeTime date={log.timestamp} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1A2E10] flex items-center justify-center flex-shrink-0">
                            <User size={10} className="text-slate-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {log.user || 'Système'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                          <Icon size={9} /> {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {MODEL_LABELS[log.model_name] || log.model_name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-500">
                          {log.object_id || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">
                          {log.ip_address || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); setDetailLog(log) }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E]" title="Voir les détails">
                          <Eye size={13} className="text-slate-400" />
                        </button>
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
              <p className="text-xs text-slate-400">
                {filtered.length} résultat(s) — page {page}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E] disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pagenum
                  if (totalPages <= 7) {
                    pagenum = i + 1
                  } else if (page <= 4) {
                    pagenum = i + 1
                  } else if (page >= totalPages - 3) {
                    pagenum = totalPages - 6 + i
                  } else {
                    pagenum = page - 3 + i
                  }
                  return (
                    <button key={pagenum} onClick={() => setPage(pagenum)}
                      className={clsx(
                        'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                        pagenum === page
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-[#2B3D1E] text-slate-500'
                      )}>
                      {pagenum}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E] disabled:opacity-30">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      {detailLog && <LogDetailDrawer log={detailLog} onClose={() => setDetailLog(null)} />}
    </div>
  )
}
