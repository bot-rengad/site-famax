'use client'

import { useState, useEffect } from 'react'
import { KeyRound, ShieldCheck, Receipt, MessageCircle, Ticket, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const DISCORD_INVITE = 'https://discord.gg/fmx'

const PACK_NAMES: Record<string, string> = {
  WINDOWS: 'Optimisation Windows',
  COMPLET: 'Pack Complet',
  ULTIME: 'Pack Ultime',
}

interface Order {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
  licenseKey: string | null
  createdAt: string
}

const STATUS_LABEL: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
  COMPLETED: { label: 'Payée', variant: 'green' },
  PAID: { label: 'Payée', variant: 'green' },
  PENDING: { label: 'En attente de preuve', variant: 'yellow' },
  CANCELLED: { label: 'Annulée', variant: 'red' },
  REFUNDED: { label: 'Remboursée', variant: 'gray' },
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [discordLinked, setDiscordLinked] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(r => r.json()).catch(() => ({})),
      fetch('/api/orders?limit=10').then(r => r.json()).catch(() => ({})),
    ]).then(([meData, ordersData]) => {
      if (meData.user) {
        setUserName(meData.user.discordGlobalName || meData.user.name || meData.user.email.split('@')[0])
        setDiscordLinked(!!meData.user.discordVerifiedAt)
      }
      if (ordersData.orders) setOrders(ordersData.orders)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-2 border-fmx-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      {/* Bienvenue */}
      <div>
        <h1 className="font-display text-display-sm text-fmx-white">Salut{userName ? `, ${userName}` : ''} 👋</h1>
        <p className="mt-1 text-fmx-white-dim">
          Tout se passe sur le serveur Discord — ici, juste ta clé et tes commandes.
        </p>
      </div>

      {/* Discord non lié */}
      {!discordLinked && (
        <Card variant="glass" padding="lg" className="border-[#5865F2]/30">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5865F2]/15">
              <ShieldCheck className="h-6 w-6 text-[#8b9bff]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Lie ton Discord pour continuer</p>
              <p className="mt-1 text-[13px] text-fmx-gray">
                Tes commandes et tes paiements sont retrouvés grâce à ton pseudo Discord en note de paiement.
              </p>
            </div>
            <a
              href="/api/auth/discord"
              className="shrink-0 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4752C4]"
            >
              Vérifier avec Discord
            </a>
          </div>
        </Card>
      )}

      {/* Ma commande */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-fmx-red" />
            Ma commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            (() => {
              const o = orders[0]
              const paid = o.status === 'PAID' || o.status === 'COMPLETED'
              return (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={paid ? 'green' : o.status === 'CANCELLED' ? 'red' : 'yellow'} dot>
                      {paid ? 'Payée' : o.status === 'CANCELLED' ? 'Annulée' : 'En attente de preuve'}
                    </Badge>
                    <span className="text-sm text-fmx-white-dim">{PACK_NAMES[o.packageType] || o.packageType} — {o.amount}€</span>
                    <code className="font-mono text-[12px] text-fmx-gray">{o.orderNumber}</code>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-fmx-gray">
                    {paid
                      ? 'Paiement validé. Ouvre un ticket sur le Discord avec ton rapport UserDiag pour réserver ton créneau.'
                      : o.status === 'CANCELLED'
                        ? 'Cette commande a été annulée. Repasse par les plans pour en créer une nouvelle.'
                        : 'Paie le montant exact avec ton pseudo Discord en note, puis envoie ta capture sur le Discord. Le staff valide ensuite ici.'}
                  </p>
                  <div className="mt-4">
                    <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
                      <Button variant="neon" size="lg">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        {paid ? 'Ouvrir un ticket' : 'Envoyer ma preuve'}
                      </Button>
                    </a>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="text-center">
              <p className="text-sm text-fmx-gray">Aucune commande pour le moment.</p>
              <a href="/#plans" className="mt-4 inline-block">
                <Button variant="neon" size="lg">
                  <KeyRound className="mr-2 h-5 w-5" />
                  Commander une opti — dès 20€
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discord : tout se passe là-bas */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#8b9bff]" />
            Serveur Discord
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-[#5865F2]/40 hover:bg-[#5865F2]/10"
            >
              <Ticket className="h-5 w-5 shrink-0 text-[#8b9bff]" />
              <span className="text-[13px] font-bold text-white">
                Ouvrir un ticket
                <span className="block text-[11px] font-normal text-fmx-gray">Diagnostic + réservation</span>
              </span>
            </a>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-fmx-red/40 hover:bg-fmx-red/10"
            >
              <Receipt className="h-5 w-5 shrink-0 text-fmx-red" />
              <span className="text-[13px] font-bold text-white">
                Envoyer ma preuve
                <span className="block text-[11px] font-normal text-fmx-gray">Capture du paiement</span>
              </span>
            </a>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <ExternalLink className="h-5 w-5 shrink-0 text-fmx-gray" />
              <span className="text-[13px] font-bold text-white">
                Rejoindre le serveur
                <span className="block text-[11px] font-normal text-fmx-gray">Support & avis</span>
              </span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Mes commandes */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-fmx-gray" />
            Mes commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-4 text-center text-sm text-fmx-gray">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {orders.map(o => {
                const st = STATUS_LABEL[o.status] || { label: o.status, variant: 'gray' as const }
                return (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <code className="font-mono text-[12px] text-white">{o.orderNumber}</code>
                    <span className="text-[13px] text-fmx-white-dim">{PACK_NAMES[o.packageType] || o.packageType}</span>
                    <span className="text-[13px] font-bold text-white">{o.amount}€</span>
                    <Badge variant={st.variant} dot size="sm" className="ml-auto">{st.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
