import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Settings, Shield, Lock, Mail, Bell,
  Bot, Palette, Key, AlertTriangle,
  CheckCircle2, FileText, X, AlertCircle,
  RefreshCw, Info, ChevronRight, RotateCcw
} from 'lucide-react'
import api from '../../../api'

// ── Tabs config ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',         label: 'Général',         icon: Settings,  desc: 'Informations système', available: true },
  { id: 'security',        label: 'Sécurité',         icon: Shield,   desc: 'Sessions et tokens',  available: true },
  { id: 'authentication',  label: 'Authentification',  icon: Lock,     desc: 'Méthode et 2FA',      available: true },
  { id: 'email',           label: 'Email',            icon: Mail,     desc: 'Messagerie',          available: false },
  { id: 'notifications',   label: 'Notifications',    icon: Bell,     desc: 'Alertes',             available: false },
  { id: 'ai',              label: 'Assistant IA',      icon: Bot,      desc: 'Moteur intelligent',  available: true },
  { id: 'appearance',      label: 'Apparence',        icon: Palette,  desc: 'Thème et couleurs',   available: false },
]

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

// ── Shimmer skeleton ───────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded bg-slate-200 dark:bg-slate-700/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0] dark:border-[#2B3D1E] last:border-0">
      <Skeleton className="h-4 w-36 rounded" />
      <Skeleton className="h-4 w-28 rounded" />
    </div>
  )
}

function SkeletonCard({ rows = 4, title = true }) {
  return (
    <div className="card p-5 space-y-0">
      {title && <Skeleton className="h-4 w-40 rounded mb-4" />}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

function SkeletonTab() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <SkeletonCard rows={6} />
      <SkeletonCard rows={3} title={false} />
    </div>
  )
}

// ── Drawer ─────────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className={`relative ${width} w-full bg-white dark:bg-[#16240D] border-l border-[#E2E8F0] dark:border-[#2B3D1E] shadow-2xl animate-in fade-in slide-in-from-right duration-300 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#2B3D1E] flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 ml-4"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Confirmation dialog ────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (open && cancelRef.current) cancelRef.current.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-desc">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel} />
      <div className="relative card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
            <AlertCircle className={`w-5 h-5 ${danger ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="cd-title" className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p id="cd-desc" className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#2B3D1E]">
          <button ref={cancelRef} onClick={onCancel} className="btn-secondary btn-sm">Annuler</button>
          <button onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} btn-sm`}>
            {confirmLabel || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── InfoRow ────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false, badge = false, onClick }) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      {...onClick && { onClick, type: 'button' }}
      className={`flex items-center justify-between py-3 border-b border-[#E2E8F0] dark:border-[#2B3D1E] last:border-0 w-full text-left ${onClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30 -mx-5 px-5 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset rounded-lg' : ''}`}
    >
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        {badge ? (
          <span className="badge badge-green">{value}</span>
        ) : mono ? (
          <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{value}</span>
        ) : (
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
        )}
        {onClick && (
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
        )}
      </div>
    </Wrapper>
  )
}

// ── FeatureCheckRow ────────────────────────────────────────────────────────
function FeatureCheckRow({ label, available }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0] dark:border-[#2B3D1E] last:border-0">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      {available ? (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-medium">Actif</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">Inactif</span>
        </span>
      )}
    </div>
  )
}

// ── Alert banner ───────────────────────────────────────────────────────────
function AlertBanner({ icon: Icon, variant = 'amber', title, children, action, onAction }) {
  const styles = {
    amber:   'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200',
    primary: 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/60 text-primary-800 dark:text-primary-200',
    red:     'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200',
  }
  const iconStyles = {
    amber:   'text-amber-500 dark:text-amber-400',
    primary: 'text-primary-500 dark:text-primary-400',
    red:     'text-red-500 dark:text-red-400',
  }
  return (
    <div className={`rounded-2xl p-4 border ${styles[variant]} animate-in fade-in duration-200`} role="status">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <div className="text-xs opacity-80 mt-0.5">{children}</div>
        </div>
        {action && onAction && (
          <button onClick={onAction} className="btn-secondary btn-sm flex-shrink-0 text-xs">
            {action}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="card p-12 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400 dark:text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Erreur de chargement</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary btn-sm">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      )}
    </div>
  )
}

// ── NotAvailable ───────────────────────────────────────────────────────────
function NotAvailable({ icon: Icon, title, description }) {
  return (
    <div className="card overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
      <div className="p-12 text-center">
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-3xl bg-slate-100 dark:bg-slate-800 rotate-3" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <Icon className="w-9 h-9 text-slate-300 dark:text-slate-600" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Bientôt disponible</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════

function GeneralTab({ systemInfo, onDetail }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informations système</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configuration serveur en lecture seule</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Serveur</h4>
        </div>
        <div className="px-5 pb-2 space-y-0" role="list" aria-label="Informations système">
          <InfoRow label="Fuseau horaire" value={systemInfo.timezone} onClick={() => onDetail('timezone')} />
          <InfoRow label="Langue" value={systemInfo.language} onClick={() => onDetail('language')} />
          <InfoRow label="Base de données" value={systemInfo.database} />
          <InfoRow label="Mode debug" value={systemInfo.debug ? 'Activé' : 'Désactivé'} badge={systemInfo.debug} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">API</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="Type d'authentification" value={systemInfo.authMethod} />
          <InfoRow label="Taille de page" value={`${systemInfo.pageSize} éléments`} mono />
          <InfoRow label="Token d'accès" value={systemInfo.accessTokenLifetime} mono />
          <InfoRow label="Token de rafraîchissement" value={systemInfo.refreshTokenLifetime} mono />
        </div>
      </div>

      <AlertBanner icon={AlertTriangle} variant="amber" title="Lecture seule">
        Ces paramètres sont définis dans la configuration du serveur Django.
        Pour les modifier, contactez l'administrateur système.
      </AlertBanner>
    </div>
  )
}

function SecurityTab({ systemInfo }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paramètres de sécurité</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Politiques de sécurité et gestion des sessions</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tokens JWT</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="Durée du token d'accès" value={systemInfo.accessTokenLifetime} mono />
          <InfoRow label="Durée du token de rafraîchissement" value={systemInfo.refreshTokenLifetime} mono />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Politique de mot de passe</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="Longueur minimale" value="8 caractères" mono />
          <InfoRow label="Complexité" value="Standard Django" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sécurité réseau</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="CORS" value={systemInfo.cors ? 'Autorisé (développement)' : 'Restreint'} badge={systemInfo.cors} />
          <InfoRow label="Middleware CSRF" value="Activé" badge />
          <InfoRow label="Audit logging" value="Activé" badge />
        </div>
      </div>

      <AlertBanner icon={AlertTriangle} variant="amber" title="Configuration serveur">
        Les paramètres de sécurité sont gérés côté serveur.
        L'authentification à deux facteurs (2FA) n'est pas encore disponible.
      </AlertBanner>
    </div>
  )
}

function AuthenticationTab({ systemInfo }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentification</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Méthode d'authentification et gestion des sessions</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Méthode</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="Type" value="JWT (JSON Web Token)" badge />
          <InfoRow label="Fournisseur" value="SimpleJWT (Django REST Framework)" />
          <InfoRow label="Rafraîchissement automatique" value="Oui" badge />
          <InfoRow label="Durée du token d'accès" value={systemInfo.accessTokenLifetime} mono />
          <InfoRow label="Durée du token de rafraîchissement" value={systemInfo.refreshTokenLifetime} mono />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">2FA</h4>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Non disponible</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">L'authentification à deux facteurs n'est pas encore implémentée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailTab() {
  return <NotAvailable icon={Mail} title="Configuration email non disponible" description="Le service de messagerie n'est pas encore configuré. Les notifications par email ne sont pas implémentées." />
}

function NotificationsTab() {
  return <NotAvailable icon={Bell} title="Notifications non disponibles" description="Le système de notifications n'est pas encore implémenté. Les alertes sont gérées par l'assistant IA." />
}

function AITab({ onDetail }) {
  const features = [
    { label: 'Conversations contextuelles', available: true },
    { label: 'Alertes automatiques', available: true },
    { label: 'Recommandations', available: true },
    { label: 'Tableau de bord', available: true },
    { label: 'Génération de réponses par IA (LLM)', available: false },
    { label: 'Configuration de prompts', available: false },
  ]

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assistant IA</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configuration de l'assistant intelligent</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Moteur</h4>
        </div>
        <div className="px-5 pb-2 space-y-0">
          <InfoRow label="Type" value="Basé sur des règles" badge />
          <InfoRow label="Modèle externe" value="Aucun (LLM non connecté)" onClick={() => onDetail('llm')} />
          <InfoRow label="Base de connaissances" value="Intégrée" badge />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fonctionnalités</h4>
        </div>
        <div className="px-5 pb-2 space-y-0" role="list" aria-label="Fonctionnalités IA">
          {features.map((f, i) => (
            <div key={i} role="listitem">
              <FeatureCheckRow label={f.label} available={f.available} />
            </div>
          ))}
        </div>
      </div>

      <AlertBanner icon={Bot} variant="primary" title="En développement">
        L'assistant IA utilise actuellement un système de réponses basé sur des règles.
        L'intégration d'un LLM est prévue pour une version future.
      </AlertBanner>
    </div>
  )
}

function AppearanceTab() {
  return <NotAvailable icon={Palette} title="Personnalisation non disponible" description="Les paramètres d'apparence (thème, couleurs, logo) ne sont pas encore configurables via l'interface." />
}

// ── Detail content for drawer ──────────────────────────────────────────────
function getDetailContent(id) {
  const now = new Date().toLocaleString('fr-DZ', { timeZone: 'Africa/Algiers' })
  const map = {
    timezone: {
      title: 'Fuseau horaire',
      subtitle: 'Africa/Algiers (CET, UTC+1)',
      sections: [
        { heading: 'Paramètre Django', rows: [
          { label: 'TIME_ZONE', value: 'Africa/Algiers' },
          { label: 'USE_TZ', value: 'True' },
          { label: 'Heure actuelle', value: now },
        ]},
        { heading: 'Impact', rows: [
          { label: 'Stockage', value: 'Les dates sont stockées en UTC' },
          { label: 'Affichage', value: 'Converties au fuseau local (UTC+1)' },
          { label: 'Calculs', value: 'Heure d\'été non appliquée (Algérie)' },
        ]},
      ],
    },
    language: {
      title: 'Langue du système',
      subtitle: 'Français (Algérie) — fr-DZ',
      sections: [
        { heading: 'Paramètre Django', rows: [
          { label: 'LANGUAGE_CODE', value: 'fr-DZ' },
          { label: 'USE_I18N', value: 'True' },
        ]},
        { heading: 'Interface', rows: [
          { label: 'Langue UI', value: 'Français' },
          { label: 'Format dates', value: 'JJ/MM/AAAA' },
          { label: 'Format nombres', value: '1 234,56' },
        ]},
      ],
    },
    llm: {
      title: 'Intégration LLM',
      subtitle: 'Modèle de langage externe',
      sections: [
        { heading: 'Statut actuel', rows: [
          { label: 'Fournisseur', value: 'Aucun' },
          { label: 'Modèle', value: 'Non configuré' },
          { label: 'Clé API', value: 'Non définie' },
        ]},
        { heading: 'Moteur actuel', rows: [
          { label: 'Type', value: 'Basé sur des règles' },
          { label: 'Méthode', value: 'Correspondance de mots-clés + regex' },
          { label: 'Avantage', value: 'Pas de coût externe, pas de latence' },
        ]},
      ],
    },
  }
  return map[id] || null
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [systemInfo, setSystemInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [drawer, setDrawer] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [tabKey, setTabKey] = useState(0)
  const contentRef = useRef(null)
  const tabListRef = useRef(null)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let userCount = 0
      try {
        const usersRes = await api.get('/accounts/users/?page_size=1')
        userCount = usersRes.data.count || usersRes.data.results?.length || 0
      } catch { /* non-critical */ }

      setSystemInfo({
        timezone: 'Africa/Algiers (CET, UTC+1)',
        language: 'Français (Algérie) — fr-DZ',
        database: 'SQLite3',
        debug: true,
        authMethod: 'JWT (SimpleJWT)',
        pageSize: 20,
        accessTokenLifetime: '8 heures',
        refreshTokenLifetime: '7 jours',
        cors: true,
        userCount,
      })
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Erreur lors du chargement de la configuration.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInfo() }, [fetchInfo])

  const switchTab = useCallback((id) => {
    setActiveTab(id)
    setTabKey(k => k + 1)
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleTabKeyDown = useCallback((e) => {
    const tabs = TABS.map(t => t.id)
    const idx = tabs.indexOf(activeTab)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = tabs[(idx + 1) % tabs.length]
      switchTab(next)
      setTimeout(() => document.getElementById(`tab-${next}`)?.focus(), 10)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length]
      switchTab(prev)
      setTimeout(() => document.getElementById(`tab-${prev}`)?.focus(), 10)
    } else if (e.key === 'Home') {
      e.preventDefault()
      switchTab(tabs[0])
      setTimeout(() => document.getElementById(`tab-${tabs[0]}`)?.focus(), 10)
    } else if (e.key === 'End') {
      e.preventDefault()
      switchTab(tabs[tabs.length - 1])
      setTimeout(() => document.getElementById(`tab-${tabs[tabs.length - 1]}`)?.focus(), 10)
    }
  }, [activeTab, switchTab])

  const openDetail = useCallback((id) => {
    if (getDetailContent(id)) setDrawer(id)
  }, [])

  const renderTab = () => {
    if (loading) return <SkeletonTab />
    if (error) return <ErrorState message={error} onRetry={fetchInfo} />
    if (!systemInfo) return null

    switch (activeTab) {
      case 'general':         return <GeneralTab systemInfo={systemInfo} onDetail={openDetail} />
      case 'security':        return <SecurityTab systemInfo={systemInfo} />
      case 'authentication':  return <AuthenticationTab systemInfo={systemInfo} />
      case 'email':           return <EmailTab />
      case 'notifications':   return <NotificationsTab />
      case 'ai':              return <AITab onDetail={openDetail} />
      case 'appearance':      return <AppearanceTab />
      default:                return null
    }
  }

  const drawerContent = drawer ? getDetailContent(drawer) : null

  return (
    <div className="space-y-0" ref={contentRef}>
      {/* Skip to content */}
      <a href="#settings-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary-600 focus:text-white focus:shadow-lg">
        Aller au contenu principal
      </a>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#16240D]/80 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#2B3D1E] -mx-6 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">Paramètres</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Configuration du système</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setConfirmReset(true)} className="btn-secondary btn-sm hidden sm:inline-flex" aria-label="Réinitialiser la configuration">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Réinitialiser</span>
            </button>
            {!loading && !error && systemInfo && (
              <button onClick={fetchInfo} className="btn-secondary btn-sm" aria-label="Recharger la configuration">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Mobile tab bar */}
        <div className="lg:hidden overflow-x-auto -mx-6 px-6 scrollbar-none">
          <div ref={tabListRef} role="tablist" aria-label="Sections de paramètres" className="flex gap-2 pb-2" onKeyDown={handleTabKeyDown}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {!tab.available && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop sidebar tabs */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="card p-2 sticky top-20">
            <nav ref={tabListRef} role="tablist" aria-label="Sections de paramètres" className="space-y-0.5" onKeyDown={handleTabKeyDown}>
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => switchTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A2E10]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tab.label}</div>
                      <div className="text-[11px] opacity-60 truncate">{tab.desc}</div>
                    </div>
                    {!tab.available && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" aria-label="Non disponible" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Tab content */}
        <main id="settings-content" key={tabKey} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="flex-1 min-w-0 pb-8">
          {renderTab()}
        </main>
      </div>

      {/* Drawer */}
      <Drawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawerContent?.title}
        subtitle={drawerContent?.subtitle}
      >
        {drawerContent?.sections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-6' : ''}>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{section.heading}</h4>
            <div className="space-y-0">
              {section.rows.map((row, ri) => (
                <InfoRow key={ri} label={row.label} value={row.value} mono={row.mono} />
              ))}
            </div>
          </div>
        ))}
      </Drawer>

      {/* Reset confirmation */}
      <ConfirmDialog
        open={confirmReset}
        title="Réinitialiser la configuration"
        message="Cette action est purement démonstrative. Aucune donnée ne sera modifiée car les paramètres système sont gérés côté serveur."
        confirmLabel="Compris"
        danger
        onConfirm={() => setConfirmReset(false)}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
