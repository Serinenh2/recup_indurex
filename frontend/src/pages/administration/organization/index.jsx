import { useState, useEffect, useMemo } from 'react'
import {
  Building2, Plus, Search, X, ChevronRight, ChevronDown,
  Users, User, Briefcase, FolderOpen, Mail, Phone,
  Edit, Trash2, Save, Eye, Filter, ChevronLeft,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react'
import api from '../../../api'
import { Can } from '../../../components/guards'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const LEVEL_CFG = {
  department: { icon: Building2, color: 'text-primary-600',   bg: 'bg-primary-50',   border: 'border-primary-200',   badge: 'bg-primary-100 text-primary-700' },
  service:    { icon: Briefcase, color: 'text-blue-600',      bg: 'bg-blue-50',      border: 'border-blue-200',      badge: 'bg-blue-100 text-blue-700' },
  unit:       { icon: FolderOpen,color: 'text-amber-600',     bg: 'bg-amber-50',     border: 'border-amber-200',     badge: 'bg-amber-100 text-amber-700' },
  employee:   { icon: User,      color: 'text-emerald-600',   bg: 'bg-emerald-50',   border: 'border-emerald-200',   badge: 'bg-emerald-100 text-emerald-700' },
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Dialog wrapper ─────────────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children, size = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-[#16240D] rounded-2xl shadow-2xl w-full ${size} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#2B3D1E] flex-shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Detail drawer ──────────────────────────────────────────────────────────────
function DetailDrawer({ node, level, onClose }) {
  if (!node) return null
  const cfg = LEVEL_CFG[level]
  const Icon = cfg.icon

  const fields = []
  if (level === 'department') {
    fields.push(
      { label: 'Code', value: node.code },
      { label: 'Directeur', value: node.head },
      { label: 'Email', value: node.email },
      { label: 'Téléphone', value: node.phone },
      { label: 'Services', value: node.service_count },
      { label: 'Unités', value: node.unit_count },
      { label: 'Employés', value: node.employee_count },
    )
  } else if (level === 'service') {
    fields.push(
      { label: 'Département', value: node.department_name },
      { label: 'Code', value: node.code },
      { label: 'Responsable', value: node.head },
      { label: 'Email', value: node.email },
      { label: 'Téléphone', value: node.phone },
      { label: 'Unités', value: node.unit_count },
      { label: 'Employés', value: node.employee_count },
    )
  } else if (level === 'unit') {
    fields.push(
      { label: 'Service', value: node.service_name },
      { label: 'Département', value: node.department_name },
      { label: 'Code', value: node.code },
      { label: 'Responsable', value: node.head },
      { label: 'Email', value: node.email },
      { label: 'Téléphone', value: node.phone },
      { label: 'Employés', value: node.employee_count },
    )
  } else if (level === 'employee') {
    fields.push(
      { label: 'Nom', value: node.last_name },
      { label: 'Prénom', value: node.first_name },
      { label: 'Poste', value: node.position },
      { label: 'Email', value: node.email },
      { label: 'Téléphone', value: node.phone },
      { label: 'Unité', value: node.unit_name },
      { label: 'Service', value: node.service_name },
      { label: 'Département', value: node.department_name },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#16240D] h-full overflow-y-auto shadow-2xl">
        <div className={`px-6 py-5 border-b border-[#E2E8F0] dark:border-[#2B3D1E]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {level === 'employee' ? `${node.first_name} ${node.last_name}` : node.name}
                </p>
                <p className="text-xs text-slate-500">{cfg.label || level}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost p-2"><X size={16} /></button>
          </div>
        </div>
        <div className="p-6 space-y-0">
          {fields.filter(f => f.value).map(f => (
            <div key={f.label} className="flex gap-3 text-sm py-2.5 border-b border-slate-50 dark:border-[#1A2E10]">
              <span className="w-28 text-slate-400 flex-shrink-0">{f.label}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 break-all">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tree node ──────────────────────────────────────────────────────────────────
function TreeNode({ node, level, expanded, onToggle, onDetail }) {
  const cfg = LEVEL_CFG[level]
  const Icon = cfg.icon
  const hasChildren = level !== 'employee'
  const isExpanded = expanded.has(`${level}-${node.id}`)

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all group',
          'hover:bg-slate-50 dark:hover:bg-[#1A2E10]',
          level === 'service' && 'ml-6',
          level === 'unit' && 'ml-12',
          level === 'employee' && 'ml-16',
        )}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <button onClick={() => onToggle(level, node.id)}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#2B3D1E] text-slate-400">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={13} className={cfg.color} />
        </div>

        {/* Name + counts */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
            {level === 'employee' ? `${node.first_name} ${node.last_name}` : node.name}
          </span>
          {node.position && level === 'employee' && (
            <span className="text-[10px] text-slate-400">{node.position}</span>
          )}
        </div>

        {/* Count badge */}
        {hasChildren && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
            {level === 'department' && `${node.service_count}S / ${node.unit_count}U / ${node.employee_count}E`}
            {level === 'service' && `${node.unit_count}U / ${node.employee_count}E`}
            {level === 'unit' && `${node.employee_count}E`}
          </span>
        )}

        {/* Actions */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDetail(node, level)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3D1E]" title="Détails">
            <Eye size={12} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-slate-100 dark:border-[#2B3D1E]">
          {level === 'department' && node.services?.map(svc => (
            <TreeNode key={svc.id} node={svc} level="service" expanded={expanded} onToggle={onToggle} onDetail={onDetail} />
          ))}
          {level === 'service' && node.units?.map(unit => (
            <TreeNode key={unit.id} node={unit} level="unit" expanded={expanded} onToggle={onToggle} onDetail={onDetail} />
          ))}
          {level === 'unit' && node.employees?.map(emp => (
            <TreeNode key={emp.id} node={emp} level="employee" expanded={expanded} onToggle={onToggle} onDetail={onDetail} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CRUD Dialogs ───────────────────────────────────────────────────────────────

function DepartmentForm({ item, onSave, onClose }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState(item || { name: '', code: '', description: '', head: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Le nom est requis')
    setSaving(true)
    try {
      if (isEdit) {
        await api.patch(`/administration/departments/${item.id}/`, form)
        toast.success('Département mis à jour')
      } else {
        await api.post('/administration/departments/', form)
        toast.success('Département créé')
      }
      onSave()
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div><label className="label">Nom <span className="text-red-500">*</span></label>
        <input value={form.name} onChange={e => handleChange('name', e.target.value)} className="input" placeholder="Nom du département" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Code</label>
          <input value={form.code} onChange={e => handleChange('code', e.target.value)} className="input" placeholder="DEPT-01" /></div>
        <div><label className="label">Responsable</label>
          <input value={form.head} onChange={e => handleChange('head', e.target.value)} className="input" placeholder="Nom du directeur" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Email</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} type="email" className="input" placeholder="dept@..." /></div>
        <div><label className="label">Téléphone</label>
          <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="input" placeholder="+213..." /></div>
      </div>
      <div><label className="label">Description</label>
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="input" rows={2} placeholder="Description du département..." /></div>
      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <Can do={isEdit ? 'administration.change_department' : 'administration.add_department'}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </Can>
        <button onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}

function ServiceForm({ item, departments, onSave, onClose }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState(item || { name: '', code: '', department: departments[0]?.id || '', description: '', head: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Le nom est requis')
    if (!form.department) return toast.error('Le département est requis')
    setSaving(true)
    try {
      if (isEdit) {
        await api.patch(`/administration/services/${item.id}/`, form)
        toast.success('Service mis à jour')
      } else {
        await api.post('/administration/services/', form)
        toast.success('Service créé')
      }
      onSave()
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div><label className="label">Département <span className="text-red-500">*</span></label>
        <select value={form.department} onChange={e => handleChange('department', e.target.value)} className="input">
          <option value="">— Sélectionner —</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select></div>
      <div><label className="label">Nom <span className="text-red-500">*</span></label>
        <input value={form.name} onChange={e => handleChange('name', e.target.value)} className="input" placeholder="Nom du service" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Code</label>
          <input value={form.code} onChange={e => handleChange('code', e.target.value)} className="input" placeholder="SVC-01" /></div>
        <div><label className="label">Responsable</label>
          <input value={form.head} onChange={e => handleChange('head', e.target.value)} className="input" placeholder="Nom du responsable" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Email</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} type="email" className="input" placeholder="svc@..." /></div>
        <div><label className="label">Téléphone</label>
          <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="input" placeholder="+213..." /></div>
      </div>
      <div><label className="label">Description</label>
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="input" rows={2} placeholder="Description du service..." /></div>
      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <Can do={isEdit ? 'administration.change_service' : 'administration.add_service'}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </Can>
        <button onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}

function UnitForm({ item, services, onSave, onClose }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState(item || { name: '', code: '', service: services[0]?.id || '', description: '', head: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Le nom est requis')
    if (!form.service) return toast.error('Le service est requis')
    setSaving(true)
    try {
      if (isEdit) {
        await api.patch(`/administration/units/${item.id}/`, form)
        toast.success('Unité mise à jour')
      } else {
        await api.post('/administration/units/', form)
        toast.success('Unité créée')
      }
      onSave()
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div><label className="label">Service <span className="text-red-500">*</span></label>
        <select value={form.service} onChange={e => handleChange('service', e.target.value)} className="input">
          <option value="">— Sélectionner —</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.department_name} / {s.name}</option>)}
        </select></div>
      <div><label className="label">Nom <span className="text-red-500">*</span></label>
        <input value={form.name} onChange={e => handleChange('name', e.target.value)} className="input" placeholder="Nom de l'unité" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Code</label>
          <input value={form.code} onChange={e => handleChange('code', e.target.value)} className="input" placeholder="UNIT-01" /></div>
        <div><label className="label">Responsable</label>
          <input value={form.head} onChange={e => handleChange('head', e.target.value)} className="input" placeholder="Nom du responsable" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Email</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} type="email" className="input" placeholder="unit@..." /></div>
        <div><label className="label">Téléphone</label>
          <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="input" placeholder="+213..." /></div>
      </div>
      <div><label className="label">Description</label>
        <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="input" rows={2} placeholder="Description de l'unité..." /></div>
      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <Can do={isEdit ? 'administration.change_unit' : 'administration.add_unit'}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </Can>
        <button onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}

function EmployeeForm({ item, units, onSave, onClose }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState(item || { first_name: '', last_name: '', position: '', unit: units[0]?.id || '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return toast.error('Nom et prénom requis')
    if (!form.unit) return toast.error('L\'unité est requise')
    setSaving(true)
    try {
      if (isEdit) {
        await api.patch(`/administration/employees/${item.id}/`, form)
        toast.success('Employé mis à jour')
      } else {
        await api.post('/administration/employees/', form)
        toast.success('Employé créé')
      }
      onSave()
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div><label className="label">Unité <span className="text-red-500">*</span></label>
        <select value={form.unit} onChange={e => handleChange('unit', e.target.value)} className="input">
          <option value="">— Sélectionner —</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.department_name} / {u.service_name} / {u.name}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Prénom <span className="text-red-500">*</span></label>
          <input value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} className="input" placeholder="Prénom" /></div>
        <div><label className="label">Nom <span className="text-red-500">*</span></label>
          <input value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} className="input" placeholder="Nom" /></div>
      </div>
      <div><label className="label">Poste</label>
        <input value={form.position} onChange={e => handleChange('position', e.target.value)} className="input" placeholder="Ingénieur, Technicien..." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Email</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} type="email" className="input" placeholder="emp@..." /></div>
        <div><label className="label">Téléphone</label>
          <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="input" placeholder="+213..." /></div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <Can do={isEdit ? 'administration.change_employee' : 'administration.add_employee'}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </Can>
        <button onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </div>
  )
}

function DeleteConfirm({ open, name, onConfirm, onClose, loading }) {
  if (!open) return null
  return (
    <Dialog open={open} onClose={onClose} title="Confirmer la suppression" size="max-w-sm">
      <p className="text-sm text-slate-500 mb-4">
        Voulez-vous vraiment supprimer <strong>{name}</strong> ? Cette action est irréversible.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary btn-sm">Annuler</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger btn-sm">
          {loading ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </Dialog>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminOrganizationPage() {
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(new Set())
  const [search, setSearch] = useState('')

  // CRUD state
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('')
  const [editing, setEditing] = useState(null)

  // Detail drawer
  const [detailNode, setDetailNode] = useState(null)
  const [detailLevel, setDetailLevel] = useState('')

  // Flat data for forms
  const [departments, setDepartments] = useState([])
  const [services, setServices] = useState([])
  const [units, setUnits] = useState([])

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchTree = async () => {
    setLoading(true)
    try {
      const res = await api.get('/administration/tree/')
      setTree(res.data || [])
    } catch { toast.error('Erreur chargement arbre') }
    finally { setLoading(false) }
  }

  const fetchFlat = async () => {
    try {
      const [depts, svcs, unitsRes] = await Promise.all([
        api.get('/administration/departments/'),
        api.get('/administration/services/'),
        api.get('/administration/units/'),
      ])
      setDepartments(depts.data.results || depts.data || [])
      setServices(svcs.data.results || svcs.data || [])
      setUnits(unitsRes.data.results || unitsRes.data || [])
    } catch { /* silent */ }
  }

  useEffect(() => { fetchTree(); fetchFlat() }, [])

  const toggleExpand = (level, id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      const key = `${level}-${id}`
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const expandAll = () => {
    const all = new Set()
    tree.forEach(d => {
      all.add(`department-${d.id}`)
      d.services?.forEach(s => {
        all.add(`service-${s.id}`)
        s.units?.forEach(u => all.add(`unit-${u.id}`))
      })
    })
    setExpanded(all)
  }

  const collapseAll = () => setExpanded(new Set())

  // Filter tree
  const filteredTree = useMemo(() => {
    if (!search) return tree
    const q = search.toLowerCase()
    return tree.filter(d => {
      const deptMatch = d.name.toLowerCase().includes(q) || (d.code || '').toLowerCase().includes(q)
      const services = (d.services || []).filter(s => {
        const svcMatch = s.name.toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q)
        const units = (s.units || []).filter(u => {
          const unitMatch = u.name.toLowerCase().includes(q) || (u.code || '').toLowerCase().includes(q)
          const employees = (u.employees || []).filter(e =>
            `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
          )
          return unitMatch || employees.length > 0
        })
        return svcMatch || units.length > 0
      })
      return deptMatch || services.length > 0
    }).map(d => {
      if (!search) return d
      const q2 = search.toLowerCase()
      return {
        ...d,
        services: (d.services || []).filter(s => {
          const svcMatch = s.name.toLowerCase().includes(q2) || (s.code || '').toLowerCase().includes(q2)
          const units = (s.units || []).filter(u => {
            const unitMatch = u.name.toLowerCase().includes(q2) || (u.code || '').toLowerCase().includes(q2)
            const employees = (u.employees || []).filter(e =>
              `${e.first_name} ${e.last_name}`.toLowerCase().includes(q2)
            )
            return unitMatch || employees.length > 0
          })
          return svcMatch || units.length > 0
        }).map(s => {
          if (!search) return s
          const q3 = search.toLowerCase()
          return {
            ...s,
            units: (s.units || []).filter(u => {
              const unitMatch = u.name.toLowerCase().includes(q3) || (u.code || '').toLowerCase().includes(q3)
              const employees = (u.employees || []).filter(e =>
                `${e.first_name} ${e.last_name}`.toLowerCase().includes(q3)
              )
              return unitMatch || employees.length > 0
            })
          }
        })
      }
    })
  }, [tree, search])

  // Stats
  const stats = useMemo(() => ({
    departments: tree.length,
    services: tree.reduce((sum, d) => sum + (d.services?.length || 0), 0),
    units: tree.reduce((sum, d) => sum + d.services?.reduce((s2, svc) => s2 + (svc.units?.length || 0), 0) || 0, 0),
    employees: tree.reduce((sum, d) => sum + d.employee_count || 0, 0),
  }), [tree])

  // CRUD handlers
  const openCreate = (type) => { setFormType(type); setEditing(null); setShowForm(true) }
  const openEdit = (node, level) => {
    setEditing(node)
    setFormType(level === 'department' ? 'department' : level === 'service' ? 'service' : level === 'unit' ? 'unit' : 'employee')
    setShowForm(true)
  }

  const handleSaved = () => { setShowForm(false); setEditing(null); fetchTree(); fetchFlat() }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { level, id } = deleteTarget
      const endpoint = level === 'department' ? 'departments' : level === 'service' ? 'services' : level === 'unit' ? 'units' : 'employees'
      await api.delete(`/administration/${endpoint}/${id}/`)
      toast.success('Supprimé')
      setDeleteTarget(null)
      fetchTree(); fetchFlat()
    } catch { toast.error('Erreur suppression') }
  }

  const openDetail = (node, level) => { setDetailNode(node); setDetailLevel(level) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organisation</h1>
            <p className="text-sm text-slate-500">Structure hiérarchique — Départements, Services, Unités, Employés</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Can do="administration.add_department">
            <button onClick={() => openCreate('department')} className="btn-primary btn-sm">
              <Plus size={14} /> Département
            </button>
          </Can>
          <Can do="administration.add_service">
            <button onClick={() => openCreate('service')} className="btn-secondary btn-sm">
              <Plus size={14} /> Service
            </button>
          </Can>
          <Can do="administration.add_unit">
            <button onClick={() => openCreate('unit')} className="btn-secondary btn-sm">
              <Plus size={14} /> Unité
            </button>
          </Can>
          <Can do="administration.add_employee">
            <button onClick={() => openCreate('employee')} className="btn-secondary btn-sm">
              <Plus size={14} /> Employé
            </button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Départements', value: stats.departments, icon: Building2, color: 'bg-primary-500' },
          { label: 'Services',     value: stats.services,     icon: Briefcase, color: 'bg-blue-500' },
          { label: 'Unités',       value: stats.units,        icon: FolderOpen,color: 'bg-amber-500' },
          { label: 'Employés',     value: stats.employees,    icon: Users,     color: 'bg-emerald-500' },
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

      {/* Search + controls */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 dark:bg-[#1A2E10] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Rechercher un département, service, unité, employé..." />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={expandAll} className="btn-ghost btn-sm text-xs">Tout développer</button>
            <button onClick={collapseAll} className="btn-ghost btn-sm text-xs">Tout réduire</button>
          </div>
        </div>
      </div>

      {/* Tree */}
      {loading ? <Spinner /> : filteredTree.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">
            {search ? 'Aucun résultat' : 'Aucun département configuré'}
          </p>
          <p className="text-sm text-slate-300 mt-1">
            {search ? 'Essayez de modifier votre recherche' : 'Créez votre premier département pour commencer'}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-50 dark:divide-[#1A2E10]">
          {filteredTree.map(dept => (
            <TreeNode key={dept.id} node={dept} level="department" expanded={expanded} onToggle={toggleExpand} onDetail={openDetail} />
          ))}
        </div>
      )}

      {/* Forms */}
      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? `Modifier ${formType}` : `Nouveau ${formType === 'department' ? 'département' : formType === 'service' ? 'service' : formType === 'unit' ? 'unité' : 'employé'}`}>
        {formType === 'department' && <DepartmentForm item={editing} onSave={handleSaved} onClose={() => { setShowForm(false); setEditing(null) }} />}
        {formType === 'service' && <ServiceForm item={editing} departments={departments} onSave={handleSaved} onClose={() => { setShowForm(false); setEditing(null) }} />}
        {formType === 'unit' && <UnitForm item={editing} services={services} onSave={handleSaved} onClose={() => { setShowForm(false); setEditing(null) }} />}
        {formType === 'employee' && <EmployeeForm item={editing} units={units} onSave={handleSaved} onClose={() => { setShowForm(false); setEditing(null) }} />}
      </Dialog>

      {/* Detail drawer */}
      {detailNode && <DetailDrawer node={detailNode} level={detailLevel} onClose={() => { setDetailNode(null); setDetailLevel('') }} />}

      {/* Delete confirm */}
      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name || ''} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
