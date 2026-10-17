'use client'

import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Users, ShoppingCart, Euro, TrendingUp,
  Ban, CheckCircle2, Trash2,
  UserCheck, UserX, MessageSquare, RefreshCw,
  UsersRound, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderChat } from '@/components/orders/OrderChat'
import { toast } from 'react-hot-toast'
import { packName } from '@/types'

// ---------- Types locaux ----------
interface Stats {
  totalUsers: number
  totalOrders: number
  revenue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
  createdAt: string
  user: { email: string; name: string | null }
}

interface AdminOrder {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
  paymentMethod: string | null
  addons?: string | null
  createdAt: string
  user: { email: string; name: string | null; discordUsername?: string | null; discordId?: string | null }
  license?: { key: string; status: string } | null
  _count?: { messages: number }
}

type TabId = 'overview' | 'clients' | 'orders'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
  { id: 'clients', label: 'Clients', icon: UsersRound },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
]

// Un seul type client : compte + gestion + statut de connexion + config.
// (Les anciens onglets "En ligne" et "Utilisateurs" étaient quasi identiques.)
interface ClientUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  discordUsername: string | null
  discordGlobalName: string | null
  discordAvatar: string | null
  discordVerifiedAt: string | null
  profile: {
    cpu: string | null
    gpu: string | null
    ram: string | null
    motherboard: string | null
    storage: string | null
    os: string | null
    favoriteGame: string | null
    monitorRefresh: string | null
    mouseDPI: string | null
    keyboardPolling: string | null
    cpuCores: number | null
    gpuRenderer: string | null
    autoDetected: boolean
    updatedAt: string
  } | null
  sessions: number
  lastSeen: string | null
  lastIp: string | null
  status: 'online' | 'recent' | 'offline'
  _count: { orders: number; licenses: number; tickets: number; sessions: number }
  orders: { id: string; orderNumber: string; packageType: string; amount: number; status: string; createdAt: string }[]
  licenses: { key: string; status: string; packageType: string }[]
}

// Config matérielle remplie par le client → lignes lisibles (seuls les champs remplis)
function clientConfigEntries(c: ClientUser): { label: string; value: string }[] {
  const p = c.profile
  if (!p) return []
  const rows: { label: string; value: string | null }[] = [
    { label: 'CPU', value: p.cpu },
    { label: 'GPU', value: p.gpu },
    { label: 'RAM', value: p.ram },
    { label: 'Carte mère', value: p.motherboard },
    { label: 'Stockage', value: p.storage },
    { label: 'OS', value: p.os },
    { label: 'Jeu principal', value: p.favoriteGame },
    { label: 'Écran', value: p.monitorRefresh },
    { label: 'DPI souris', value: p.mouseDPI },
    { label: 'Polling clavier', value: p.keyboardPolling },
    { label: 'Cœurs CPU', value: p.cpuCores != null ? String(p.cpuCores) : null },
    { label: 'GPU (renderer)', value: p.gpuRenderer },
  ]
  return rows.filter((r): r is { label: string; value: string } => !!r.value)
}

// Skeleton local : occupe l'onglet pendant son chargement,
// sans masquer tout le panel comme l'ancien spinner plein écran.
function TabSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Chargement en cours">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        ))}
      </div>
      <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="mb-3 h-4 rounded bg-white/[0.06] last:mb-0" style={{ width: `${92 - i * 7}%` }} />
        ))}
      </div>
    </div>
  )
}

const STATUS_FR: Record<string, string> = {
  COMPLETED: 'Terminée',
  PAID: 'Payée',
  PENDING: 'En attente',
  OPEN: 'Ouverte',
  ACTIVE: 'Active',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
  REVOKED: 'Révoquée',
}

const statusBadge = (status: string) => {
  const label = STATUS_FR[status] || status
  switch (status) {
    case 'COMPLETED': case 'PAID': case 'ACTIVE': case 'CLOSED': return <Badge variant="green" dot>{label}</Badge>
    case 'PENDING': case 'OPEN': return <Badge variant="yellow" dot>{label}</Badge>
    case 'REVOKED': case 'CANCELLED': return <Badge variant="red" dot>{label}</Badge>
    case 'REFUNDED': return <Badge variant="gray" dot>{label}</Badge>
    default: return <Badge variant="blue" dot>{label}</Badge>
  }
}

const paymentLabel = (m: string | null) => m === 'PAYPAL' ? 'PayPal' : m === 'BANK_TRANSFER' ? 'Virement' : '—'

// Parse les add-ons stockés en JSON sans jamais crasher l'admin
function safeAddonList(raw: string | null | undefined): string {
  if (!raw) return ''
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(x => typeof x === 'string').join(', ')
    return ''
  } catch {
    return ''
  }
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('overview')
  const [tabLoading, setTabLoading] = useState<TabId | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null)
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'pending'>('pending')
  const [clients, setClients] = useState<ClientUser[]>([])
  const [openClientId, setOpenClientId] = useState<string | null>(null)
  // Onglets déjà chargés : on ne recharge jamais sans demande explicite.
  const loadedTabs = useRef<Set<TabId>>(new Set())

  // Lecture du hash d'URL + suivi des clics sidebar.
  // Hash vide ou inconnu = vue d'ensemble (avant : cliquer "Vue d'ensemble"
  // ne revenait pas dessus, l'écran restait bloqué sur l'onglet précédent).
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash || !tabs.some(t => t.id === hash)) { setTab('overview'); return }
      setTab(hash as TabId)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Charge les données d'un onglet (une seule fois, sauf refresh manuel).
  // Pendant le chargement : skeleton local, jamais de spinner plein écran.
  const loadTab = useCallback(async (id: TabId, force = false) => {
    if (!force && loadedTabs.current.has(id)) return
    loadedTabs.current.add(id)
    setTabLoading(id)
    try {
      if (id === 'overview') {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders'),
        ])
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders || [])
        }
        if (ordersRes.ok) setOrders((await ordersRes.json()).orders || [])
      }
      if (id === 'clients') {
        const r = await fetch('/api/admin/clients')
        if (r.ok) setClients((await r.json()).clients || [])
      }
      // L'onglet commandes réutilise les données de la vue d'ensemble si déjà là
      if (id === 'orders' && !loadedTabs.current.has('overview')) {
        const r = await fetch('/api/admin/orders')
        if (r.ok) setOrders((await r.json()).orders || [])
      }
    } catch {
      loadedTabs.current.delete(id)
      toast.error('Erreur de chargement des données admin')
    } finally {
      setTabLoading(current => (current === id ? null : current))
    }
  }, [])

  // Démarrage immédiat : vue d'ensemble + onglet du hash en parallèle,
  // rendu direct (skeletons locaux) — aucun loader bloquant plein écran.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const first: TabId = tabs.some(t => t.id === hash) ? hash as TabId : 'overview'
    setTab(first)
    loadTab('overview')
    if (first !== 'overview') loadTab(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Charge l'onglet à son ouverture (depuis le cache si déjà vu)
  useEffect(() => {
    loadTab(tab)
  }, [tab, loadTab])

  // Recharge manuelle de l'onglet courant (bouton Actualiser)
  const refreshTab = useCallback(async () => {
    loadedTabs.current.delete(tab)
    await loadTab(tab, true)
  }, [tab, loadTab])

  // ----- Actions de gestion -----

  // Bascule le rôle USER <-> ADMIN
  const toggleRole = async (client: ClientUser) => {
    const newRole = client.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: client.id, role: newRole }),
    })
    if (res.ok) {
      toast.success(`Rôle mis à jour : ${newRole}`)
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, role: newRole } : c))
    } else {
      toast.error((await res.json().catch(() => ({}))).error || 'Erreur')
    }
  }

  const deleteClient = async (client: ClientUser) => {
    if (!window.confirm(`Supprimer définitivement ${client.email} et toutes ses données ?`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: client.id }),
    })
    if (res.ok) {
      toast.success('Utilisateur supprimé')
      setClients(prev => prev.filter(c => c.id !== client.id))
    } else {
      toast.error((await res.json().catch(() => ({}))).error || 'Erreur')
    }
  }

  // Valide / annule une commande après vérification de la preuve sur Discord
  const validateOrder = async (orderId: string, action: 'PAID' | 'CANCELLED') => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, action }),
    })
    if (res.ok) {
      const data = await res.json()
      toast.success(data.message)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.order.status, license: data.order.licenseKey ? { key: data.order.licenseKey, status: 'ACTIVE' } : o.license } : o))
    } else {
      toast.error((await res.json().catch(() => ({}))).error || 'Erreur')
    }
  }

  const onlineCount = clients.filter(c => c.status === 'online').length

  return (
    <div className="space-y-6">
      {/* Actualiser : recharge uniquement l'onglet courant */}
      <div className="flex justify-end">
        <button
          onClick={refreshTab}
          disabled={tabLoading !== null}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-bold text-fmx-gray transition-colors hover:border-fmx-red/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', tabLoading === tab && 'animate-spin')} />
          {tabLoading === tab ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {/* ===== VUE D'ENSEMBLE ===== */}
      {tab === 'overview' && (stats ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Alerte commandes à valider */}
          {orders.filter(o => o.status === 'PENDING').length > 0 && (
            <button
              onClick={() => { setTab('orders'); window.location.hash = 'orders'; setOrdersFilter('pending') }}
              className="flex w-full items-center gap-4 rounded-2xl border border-fmx-red/40 bg-gradient-to-r from-fmx-red/[0.14] to-transparent p-5 text-left transition-transform hover:-translate-y-px"
            >
              <span className="grid h-11 w-11 shrink-0 animate-pulse place-items-center rounded-full bg-fmx-red font-extrabold text-white">
                {orders.filter(o => o.status === 'PENDING').length}
              </span>
              <span className="flex-1">
                <b className="block text-white">Commandes en attente de validation</b>
                <span className="block text-[13px] text-fmx-gray">Vérifie la preuve dans le ticket puis valide →</span>
              </span>
            </button>
          )}
          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
              { label: 'Commandes', value: stats.totalOrders, icon: ShoppingCart, color: 'text-fmx-red' },
              { label: 'Revenu total', value: `${stats.revenue.toFixed(0)} €`, icon: Euro, color: 'text-green-400' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <Card key={i} variant="glass" padding="lg">
                  <CardContent className="p-0">
                    <Icon className={cn('w-5 h-5 mb-3', s.color)} />
                    <p className="font-display text-display-sm text-fmx-white">{s.value}</p>
                    <p className="text-caption text-fmx-gray">{s.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Dernières commandes */}
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Dernières commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fmx-gray border-b border-fmx-border/50">
                      <th className="pb-3 pr-4">Commande</th>
                      <th className="pb-3 pr-4">Client</th>
                      <th className="pb-3 pr-4">Pack</th>
                      <th className="pb-3 pr-4">Montant</th>
                      <th className="pb-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id} className="border-b border-fmx-border/30 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs"><a href={`/admin/orders/${o.id}`} className="text-fmx-white-dim transition-colors hover:text-fmx-red hover:underline">{o.orderNumber}</a></td>
                        <td className="py-3 pr-4 text-fmx-white-dim">{o.user.email}</td>
                        <td className="py-3 pr-4"><Badge variant="red">{packName(o.packageType)}</Badge></td>
                        <td className="py-3 pr-4 text-fmx-white">{o.amount.toFixed(2)} €</td>
                        <td className="py-3">{statusBadge(o.status)}</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-fmx-gray">Aucune commande</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <TabSkeleton />
      ))}

      {/* ===== CLIENTS (statut + gestion + config, fusion des anciens onglets) ===== */}
      {tab === 'clients' && (tabLoading === 'clients' && clients.length === 0 ? (
        <TabSkeleton rows={4} />
      ) : (
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle>Clients ({clients.length})</CardTitle>
            <p className="mt-1 text-xs text-fmx-gray">
              {onlineCount > 0 ? `${onlineCount} en ligne maintenant • ` : ''}statut de connexion, Discord et config remplie.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.map(c => {
                const name = c.discordGlobalName || c.discordUsername || c.name || c.email
                const expanded = openClientId === c.id
                const config = clientConfigEntries(c)
                const license = c.licenses[0]
                return (
                  <div key={c.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', c.status === 'online' ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : c.status === 'recent' ? 'bg-yellow-400' : 'bg-white/20')} />
                      {c.discordAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.discordAvatar} alt="" width={36} height={36} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fmx-carbon text-sm font-bold text-fmx-gray">{name.charAt(0).toUpperCase()}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white">
                          {name}
                          {c.discordUsername && <span className="ml-2 text-[11px] font-normal text-fmx-gray">@{c.discordUsername}</span>}
                        </p>
                        <p className="truncate text-[11px] text-fmx-gray">{c.email} • inscrit le {new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {c.role === 'ADMIN' && <Badge variant="red" dot>ADMIN</Badge>}
                        {c.discordVerifiedAt ? <Badge variant="green" dot>Discord lié</Badge> : <Badge variant="yellow" dot>Discord non lié</Badge>}
                        {c.status === 'online' ? <Badge variant="green" dot>En ligne</Badge> : c.status === 'recent' ? <Badge variant="yellow" dot>Vu récemment</Badge> : <Badge variant="gray" dot>Hors ligne</Badge>}
                        <span className="text-[11px] text-fmx-gray">
                          {c.lastSeen ? `vu ${new Date(c.lastSeen).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'jamais connecté'}
                        </span>
                        <button
                          onClick={() => toggleRole(c)}
                          className="rounded-lg bg-fmx-carbon border border-fmx-border/50 p-2 transition-colors hover:border-fmx-red/50"
                          title={c.role === 'ADMIN' ? 'Rétrograder en USER' : 'Promouvoir en ADMIN'}
                        >
                          {c.role === 'ADMIN' ? <UserX className="w-4 h-4 text-yellow-400" /> : <UserCheck className="w-4 h-4 text-green-400" />}
                        </button>
                        <button
                          onClick={() => deleteClient(c)}
                          className="rounded-lg bg-fmx-carbon border border-fmx-border/50 p-2 transition-colors hover:border-red-500/50"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <button
                          onClick={() => setOpenClientId(prev => prev === c.id ? null : c.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-bold text-fmx-gray transition-colors hover:border-fmx-red/40 hover:text-white"
                        >
                          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {expanded ? 'Masquer' : 'Voir la fiche'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] pt-3 text-[11px] text-fmx-gray">
                      <span>{c._count.orders} commande{c._count.orders > 1 ? 's' : ''}</span>
                      <span>{c._count.licenses} licence{c._count.licenses > 1 ? 's' : ''}</span>
                      <span>{c._count.tickets} ticket{c._count.tickets > 1 ? 's' : ''}</span>
                      <span>{c.sessions} session{c.sessions > 1 ? 's' : ''} active{c.sessions > 1 ? 's' : ''}</span>
                      {license && (
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-fmx-red">{license.key}</span>
                          {statusBadge(license.status)}
                        </span>
                      )}
                    </div>

                    {expanded && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-fmx-gray">
                            Config matérielle{c.profile?.autoDetected ? ' (détectée automatiquement)' : ''}
                          </p>
                          {config.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {config.map(row => (
                                <div key={row.label} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                                  <p className="text-[10px] uppercase tracking-wide text-fmx-gray">{row.label}</p>
                                  <p className="break-words text-sm text-white">{row.value}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] text-fmx-gray">Config non remplie — le client n&apos;a encore rien renseigné.</p>
                          )}
                        </div>

                        {c.orders.length > 0 && (
                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-fmx-gray">Dernières commandes</p>
                            <div className="space-y-2">
                              {c.orders.map(o => (
                                <div key={o.id}>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <a href={`/admin/orders/${o.id}`} className="font-mono text-[12px] text-white transition-colors hover:text-fmx-red hover:underline">{o.orderNumber}</a>
                                    <Badge variant="red">{packName(o.packageType)}</Badge>
                                    <span className="text-[12px] text-fmx-white-dim">{o.amount.toFixed(2)} €</span>
                                    {statusBadge(o.status)}
                                    <span className="text-[11px] text-fmx-gray">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</span>
                                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setOpenChatOrderId(prev => prev === o.id ? null : o.id)}>
                                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Chat
                                    </Button>
                                  </div>
                                  {openChatOrderId === o.id && (
                                    <div className="mt-2"><OrderChat orderId={o.id} compact /></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {c.lastIp && (
                          <p className="text-[11px] text-fmx-gray">Dernière IP de session : <span className="font-mono text-fmx-white-dim">{c.lastIp}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {clients.length === 0 && (
                <p className="py-6 text-center text-fmx-gray">Aucun client inscrit.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ===== COMMANDES ===== */}
      {tab === 'orders' && (tabLoading === 'orders' && orders.length === 0 ? (
        <TabSkeleton rows={5} />
      ) : (
        <Card variant="glass" padding="lg">
          <CardHeader className="mb-4 flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>Toutes les commandes ({orders.length})</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setOrdersFilter('pending')}
                className={ordersFilter === 'pending' ? 'rounded-full bg-fmx-red px-4 py-2 text-[12px] font-bold text-white' : 'rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12px] font-bold text-fmx-gray hover:text-white'}
              >
                En attente ({orders.filter(o => o.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setOrdersFilter('all')}
                className={ordersFilter === 'all' ? 'rounded-full bg-fmx-red px-4 py-2 text-[12px] font-bold text-white' : 'rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12px] font-bold text-fmx-gray hover:text-white'}
              >
                Toutes
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-fmx-gray border-b border-fmx-border/50">
                    <th className="pb-3 pr-4">Numéro</th>
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Pack</th>
                    <th className="pb-3 pr-4">Paiement</th>
                    <th className="pb-3 pr-4">Montant</th>
                    <th className="pb-3 pr-4">Licence</th>
                    <th className="pb-3 pr-4">Statut</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(o => ordersFilter === 'all' || o.status === 'PENDING')
                    .sort((a, b) => (a.status === 'PENDING' ? 0 : 1) - (b.status === 'PENDING' ? 0 : 1))
                    .map(o => (
                    <Fragment key={o.id}>
                    <tr className="border-b border-fmx-border/30 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-fmx-white-dim"><a href={`/admin/orders/${o.id}`} className="hover:text-white hover:underline">{o.orderNumber}</a></td>
                      <td className="py-3 pr-4 text-fmx-white-dim">
                        {o.user.discordUsername ? `@${o.user.discordUsername}` : o.user.email}
                        <span className="block text-[11px] text-fmx-gray">{o.user.email}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="red">{packName(o.packageType)}</Badge>
                        {o.addons && o.addons !== '[]' && (
                          <span className="mt-1 block text-[11px] text-fmx-gray">+ {safeAddonList(o.addons)}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-fmx-gray">{paymentLabel(o.paymentMethod)}</td>
                      <td className="py-3 pr-4 text-fmx-white">{o.amount.toFixed(2)} €</td>
                      <td className="py-3 pr-4 font-mono text-xs text-fmx-red">{o.license?.key || '—'}</td>
                      <td className="py-3 pr-4">{statusBadge(o.status)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <a
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center rounded-lg border border-fmx-red/40 bg-fmx-red/10 px-3 py-1.5 text-[12px] font-bold text-fmx-red transition-all duration-150 hover:scale-105 hover:bg-fmx-red/20"
                          >
                            Ouvrir →
                          </a>
                          <Button variant="ghost" size="sm" onClick={() => setOpenChatOrderId(prev => prev === o.id ? null : o.id)}>
                            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat{o._count?.messages ? ` (${o._count.messages})` : ''}
                          </Button>
                          {o.status === 'PENDING' && (
                            <>
                              <Button variant="neon" size="sm" onClick={() => validateOrder(o.id, 'PAID')}>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valider
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => validateOrder(o.id, 'CANCELLED')}>
                                <Ban className="w-3.5 h-3.5 mr-1" /> Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {openChatOrderId === o.id && (
                      <tr>
                        <td colSpan={8} className="pb-4">
                          <OrderChat orderId={o.id} compact />
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={8} className="py-6 text-center text-fmx-gray">Aucune commande</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

    </div>
  )
}
