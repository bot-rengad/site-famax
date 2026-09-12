'use client'

import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Users, ShoppingCart, KeyRound, LifeBuoy, Euro, TrendingUp,
  Loader2, RefreshCw, Ban, CheckCircle2, Send, Trash2, ShieldCheck,
  UserCheck, UserX, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderChat } from '@/components/orders/OrderChat'
import { toast } from 'react-hot-toast'

// ---------- Types locaux ----------
interface Stats {
  totalUsers: number
  totalOrders: number
  completedOrders: number
  activeLicenses: number
  openTickets: number
  revenue: number
  checklistCompletion: number
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

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  _count: { orders: number; licenses: number; tickets: number }
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

interface AdminLicense {
  id: string
  key: string
  packageType: string
  status: string
  activatedAt: string | null
  createdAt: string
  user: { email: string; name: string | null }
}

interface AdminTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  user: { email: string; name: string | null }
  messages: { id: string; message: string; isStaff: boolean; createdAt: string }[]
}

type TabId = 'overview' | 'online' | 'users' | 'orders' | 'licenses' | 'tickets'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
  { id: 'online', label: 'En ligne', icon: UserCheck },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'licenses', label: 'Licences', icon: KeyRound },
  { id: 'tickets', label: 'Support', icon: LifeBuoy },
]

interface OnlineUser {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    discordUsername: string | null
    discordGlobalName: string | null
    discordAvatar: string | null
    createdAt: string
    orders: { id: string; orderNumber: string; packageType: string; amount: number; status: string; createdAt: string }[]
  }
  sessions: number
  lastSeen: string
  activeNow: boolean
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': case 'ACTIVE': case 'CLOSED': return <Badge variant="green" dot>{status}</Badge>
    case 'PENDING': case 'OPEN': return <Badge variant="yellow" dot>{status}</Badge>
    case 'REVOKED': case 'CANCELLED': case 'REFUNDED': return <Badge variant="red" dot>{status}</Badge>
    default: return <Badge variant="blue" dot>{status}</Badge>
  }
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [licenses, setLicenses] = useState<AdminLicense[]>([])
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null)
  const [online, setOnline] = useState<OnlineUser[]>([])
  // Onglets déjà chargés (les autres se chargent à l'ouverture : rapide au démarrage)
  const loadedTabs = useRef<Set<TabId>>(new Set(['overview']))

  // Lecture du hash d'URL + suivi des clics sidebar (sinon les liens ont l'air morts)
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '') as TabId
      if (tabs.some(t => t.id === hash)) setTab(hash)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Charge l'essentiel au démarrage (vue d'ensemble), le reste à l'ouverture de l'onglet
  const loadTab = useCallback(async (id: TabId, force = false) => {
    if (!force && loadedTabs.current.has(id)) return
    loadedTabs.current.add(id)
    try {
      if (id === 'overview' || force) {
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
      if (id === 'online' || force) {
        const r = await fetch('/api/admin/sessions')
        if (r.ok) setOnline((await r.json()).online || [])
      }
      if (id === 'users' || force) {
        const r = await fetch('/api/admin/users')
        if (r.ok) setUsers((await r.json()).users || [])
      }
      if (id === 'licenses' || force) {
        const r = await fetch('/api/admin/licenses')
        if (r.ok) setLicenses((await r.json()).licenses || [])
      }
      if (id === 'tickets' || force) {
        const r = await fetch('/api/admin/tickets')
        if (r.ok) setTickets((await r.json()).tickets || [])
      }
    } catch {
      toast.error('Erreur de chargement des données admin')
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      loadedTabs.current = new Set(['overview'])
      await loadTab('overview', true)
      await loadTab(tab, true)
    } finally {
      setLoading(false)
    }
  }, [loadTab, tab])

  useEffect(() => { loadAll() }, [loadAll])

  // Charge l'onglet à son ouverture
  useEffect(() => {
    if (!loading) loadTab(tab)
  }, [tab, loading, loadTab])

  // ----- Actions de gestion -----

  // Bascule le rôle USER <-> ADMIN
  const toggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    })
    if (res.ok) {
      toast.success(`Rôle mis à jour : ${newRole}`)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    } else {
      toast.error((await res.json().catch(() => ({}))).error || 'Erreur')
    }
  }

  const deleteUser = async (userId: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      toast.success('Utilisateur supprimé')
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      toast.error((await res.json().catch(() => ({}))).error || 'Erreur')
    }
  }

  // Active / révoque une licence
  const toggleLicense = async (licenseId: string) => {
    const res = await fetch('/api/admin/licenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseId }),
    })
    if (res.ok) {
      const data = await res.json()
      toast.success(data.message)
      setLicenses(prev => prev.map(l => l.id === licenseId ? { ...l, status: data.license.status } : l))
    } else {
      toast.error('Erreur lors de la mise à jour')
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

  // Répond à un ticket support
  const replyTicket = async (ticketId: string) => {
    const message = replyDrafts[ticketId]?.trim()
    if (!message) return
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, message }),
    })
    if (res.ok) {
      const data = await res.json()
      toast.success('Réponse envoyée')
      setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t))
      setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }))
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  // Change le statut d'un ticket (fermeture rapide)
  const closeTicket = async (ticketId: string) => {
    const res = await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status: 'CLOSED' }),
    })
    if (res.ok) {
      toast.success('Ticket fermé')
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'CLOSED' } : t))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-fmx-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Onglets */}
      <div className="flex flex-wrap gap-2 p-1 bg-fmx-carbon/50 border border-fmx-border/50 rounded-lg w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); window.location.hash = t.id }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-md font-display font-medium text-sm transition-all duration-200',
                tab === t.id ? 'bg-fmx-red/10 text-fmx-red' : 'text-fmx-gray hover:text-fmx-white hover:bg-fmx-red/10'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
        <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2.5 rounded-md font-display font-medium text-sm text-fmx-white-dim hover:text-fmx-white" title="Rafraîchir">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* ===== VUE D'ENSEMBLE ===== */}
      {tab === 'overview' && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
              { label: 'Commandes', value: stats.totalOrders, icon: ShoppingCart, color: 'text-fmx-red' },
              { label: 'Revenu total', value: `${stats.revenue.toFixed(0)} €`, icon: Euro, color: 'text-green-400' },
              { label: 'Licences actives', value: stats.activeLicenses, icon: KeyRound, color: 'text-yellow-400' },
              { label: 'Tickets ouverts', value: stats.openTickets, icon: LifeBuoy, color: 'text-orange-400' },
              { label: 'Modules complétés', value: stats.checklistCompletion, icon: CheckCircle2, color: 'text-purple-400' },
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
                        <td className="py-3 pr-4 font-mono text-xs text-fmx-white-dim">{o.orderNumber}</td>
                        <td className="py-3 pr-4 text-fmx-white-dim">{o.user.email}</td>
                        <td className="py-3 pr-4"><Badge variant="red">{o.packageType}</Badge></td>
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
      )}

      {/* ===== EN LIGNE ===== */}
      {tab === 'online' && (
        <Card variant="glass" padding="lg">
          <CardHeader><CardTitle>Connectés ({online.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {online.map(({ user: u, sessions, lastSeen, activeNow }) => (
                <div key={u.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeNow ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-white">
                        {u.discordGlobalName || u.discordUsername || u.name || u.email}
                        <span className="ml-2 text-[11px] font-normal text-fmx-gray">
                          {u.discordUsername ? `@${u.discordUsername} • ` : ''}{u.email}
                        </span>
                      </p>
                      <p className="text-[11px] text-fmx-gray">
                        {sessions} session{sessions > 1 ? 's' : ''} • vu {new Date(lastSeen).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {u.role === 'ADMIN' && ' • admin'}
                      </p>
                    </div>
                  </div>
                  {u.orders.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                      {u.orders.map(o => (
                        <div key={o.id}>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <code className="font-mono text-[12px] text-white">{o.orderNumber}</code>
                            <Badge variant="red">{o.packageType}</Badge>
                            <span className="text-[12px] text-fmx-white-dim">{o.amount}€</span>
                            {statusBadge(o.status)}
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
                  ) : (
                    <p className="mt-2 text-[12px] text-fmx-gray">Aucune commande — client potentiel à accueillir.</p>
                  )}
                </div>
              ))}
              {online.length === 0 && (
                <p className="py-6 text-center text-fmx-gray">Personne en ligne pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== UTILISATEURS ===== */}
      {tab === 'users' && (
        <Card variant="glass" padding="lg">
          <CardHeader><CardTitle>Gestion des utilisateurs ({users.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-fmx-gray border-b border-fmx-border/50">
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Nom</th>
                    <th className="pb-3 pr-4">Rôle</th>
                    <th className="pb-3 pr-4">Cmd / Lic / Tickets</th>
                    <th className="pb-3 pr-4">Inscrit le</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-fmx-border/30 last:border-0">
                      <td className="py-3 pr-4 text-fmx-white">{u.email}</td>
                      <td className="py-3 pr-4 text-fmx-white-dim">{u.name || '—'}</td>
                      <td className="py-3 pr-4">
                        {u.role === 'ADMIN'
                          ? <Badge variant="red" dot>ADMIN</Badge>
                          : <Badge variant="blue" dot>USER</Badge>}
                      </td>
                      <td className="py-3 pr-4 text-fmx-gray font-mono text-xs">
                        {u._count.orders} / {u._count.licenses} / {u._count.tickets}
                      </td>
                      <td className="py-3 pr-4 text-fmx-gray text-xs">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRole(u)}
                            className="p-2 rounded-lg bg-fmx-carbon border border-fmx-border/50 hover:border-fmx-red/50 transition-colors"
                            title={u.role === 'ADMIN' ? 'Rétrograder en USER' : 'Promouvoir en ADMIN'}
                          >
                            {u.role === 'ADMIN' ? <UserX className="w-4 h-4 text-yellow-400" /> : <UserCheck className="w-4 h-4 text-green-400" />}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 rounded-lg bg-fmx-carbon border border-fmx-border/50 hover:border-red-500/50 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== COMMANDES ===== */}
      {tab === 'orders' && (
        <Card variant="glass" padding="lg">
          <CardHeader><CardTitle>Toutes les commandes ({orders.length})</CardTitle></CardHeader>
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
                  {orders.map(o => (
                    <Fragment key={o.id}>
                    <tr className="border-b border-fmx-border/30 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-fmx-white-dim">{o.orderNumber}</td>
                      <td className="py-3 pr-4 text-fmx-white-dim">
                        {o.user.discordUsername ? `@${o.user.discordUsername}` : o.user.email}
                        <span className="block text-[11px] text-fmx-gray">{o.user.email}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="red">{o.packageType}</Badge>
                        {o.addons && o.addons !== '[]' && (
                          <span className="mt-1 block text-[11px] text-fmx-gray">+ {(JSON.parse(o.addons) as string[]).join(', ')}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-fmx-gray">{o.paymentMethod || '—'}</td>
                      <td className="py-3 pr-4 text-fmx-white">{o.amount.toFixed(2)} €</td>
                      <td className="py-3 pr-4 font-mono text-xs text-fmx-red">{o.license?.key || '—'}</td>
                      <td className="py-3 pr-4">{statusBadge(o.status)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
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
      )}

      {/* ===== LICENCES ===== */}
      {tab === 'licenses' && (
        <Card variant="glass" padding="lg">
          <CardHeader><CardTitle>Licences ({licenses.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-fmx-gray border-b border-fmx-border/50">
                    <th className="pb-3 pr-4">Clé</th>
                    <th className="pb-3 pr-4">Propriétaire</th>
                    <th className="pb-3 pr-4">Pack</th>
                    <th className="pb-3 pr-4">Statut</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map(l => (
                    <tr key={l.id} className="border-b border-fmx-border/30 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-fmx-red">{l.key}</td>
                      <td className="py-3 pr-4 text-fmx-white-dim">{l.user.email}</td>
                      <td className="py-3 pr-4"><Badge variant="blue">{l.packageType}</Badge></td>
                      <td className="py-3 pr-4">{statusBadge(l.status)}</td>
                      <td className="py-3">
                        <Button
                          variant={l.status === 'ACTIVE' ? 'danger' : 'neon'}
                          size="sm"
                          onClick={() => toggleLicense(l.id)}
                        >
                          {l.status === 'ACTIVE' ? (
                            <><Ban className="w-3.5 h-3.5 mr-1" /> Révoquer</>
                          ) : (
                            <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Réactiver</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-fmx-gray">Aucune licence</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== TICKETS SUPPORT ===== */}
      {tab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map(t => (
            <Card key={t.id} variant="glass" padding="lg">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h3 className="font-display text-heading-md text-fmx-white flex items-center gap-3 flex-wrap">
                    {t.subject}
                    {statusBadge(t.status)}
                    <Badge variant={t.priority === 'URGENT' ? 'red' : t.priority === 'HIGH' ? 'yellow' : 'blue'}>{t.priority}</Badge>
                  </h3>
                  <p className="text-xs text-fmx-gray mt-1">
                    {t.user.email} — {new Date(t.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {t.status !== 'CLOSED' && (
                  <Button variant="ghost" size="sm" onClick={() => closeTicket(t.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Fermer
                  </Button>
                )}
              </div>

              <p className="text-fmx-white-dim text-sm mb-4 p-3 rounded-lg bg-fmx-carbon/50 border border-fmx-border/40 whitespace-pre-wrap">
                {t.description}
              </p>

              {/* Fil de discussion */}
              <div className="space-y-2 mb-4">
                {t.messages.map(m => (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[80%] p-3 rounded-xl text-sm',
                      m.isStaff
                        ? 'ml-auto bg-fmx-red/10 border border-fmx-red/30 text-fmx-white'
                        : 'bg-fmx-carbon/70 border border-fmx-border/50 text-fmx-white-dim'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className={cn('w-3 h-3', m.isStaff ? 'text-fmx-red' : 'text-fmx-gray')} />
                      <span className="text-xs font-display font-medium">{m.isStaff ? 'Support FMX' : t.user.email}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Réponse staff */}
              {t.status !== 'CLOSED' && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyDrafts[t.id] || ''}
                    onChange={e => setReplyDrafts(prev => ({ ...prev, [t.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && replyTicket(t.id)}
                    placeholder="Répondre au client..."
                    className="flex-1 bg-fmx-carbon/50 border border-fmx-border/50 rounded-lg px-4 py-2.5 text-sm text-fmx-white placeholder:text-fmx-gray focus:outline-none focus:border-fmx-red/50"
                  />
                  <Button variant="neon" size="md" onClick={() => replyTicket(t.id)}>
                    <Send className="w-4 h-4 mr-1" /> Envoyer
                  </Button>
                </div>
              )}
            </Card>
          ))}
          {tickets.length === 0 && (
            <Card variant="glass" padding="lg">
              <CardContent className="py-12 text-center text-fmx-gray">
                Aucun ticket support pour le moment
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
