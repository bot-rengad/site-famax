'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Lock, MessageCircle, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/helpers'

const DISCORD_INVITE = 'https://discord.gg/fmx'

const PACK_NAMES: Record<string, string> = {
  WINDOWS: 'Optimisation Windows — 20€',
  BASIC: 'Pack Basic — 20€',
  COMPLET: 'Pack Complet — 25€',
  ULTIME: 'Pack Ultime — 50€',
}

interface Order {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
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

  const latest = orders.length > 0 ? orders[0] : null
  const paid = latest && (latest.status === 'PAID' || latest.status === 'COMPLETED')
  const cancelled = latest?.status === 'CANCELLED'
  const pending = latest && latest.status === 'PENDING'

  const steps = [
    {
      title: 'Compte Discord',
      desc: discordLinked
        ? `Vérifié : ${userName}`
        : 'Lie ton Discord : pseudo retrouvé sur les paiements.',
      done: discordLinked,
      locked: false,
      cta: discordLinked ? null : { label: 'Vérifier avec Discord', href: '/api/auth/discord', primary: true },
    },
    {
      title: 'Commande',
      desc: latest && !cancelled
        ? `${PACK_NAMES[latest.packageType] || latest.packageType} — ${latest.orderNumber}`
        : 'Choisis ton opti et tes options, puis paie.',
      done: !!latest && !cancelled,
      locked: false,
      cta: latest && !cancelled
        ? { label: 'Voir ma commande', href: `/dashboard/orders/${latest.id}`, primary: false }
        : { label: 'Commander une opti', href: '/dashboard/order', primary: true },
    },
    {
      title: 'Paiement + preuve',
      desc: !latest || cancelled
        ? 'Dès ta commande passée.'
        : paid
          ? 'Paiement validé par le staff.'
          : `Paie ${latest.amount}€ avec ton pseudo en note, envoie la capture sur Discord.`,
      done: !!paid,
      locked: !latest || cancelled,
      cta: latest && !paid && !cancelled ? { label: 'Envoyer ma preuve', href: DISCORD_INVITE, primary: true } : null,
    },
    {
      title: 'Ticket + opti',
      desc: paid
        ? 'Ouvre un ticket avec ton rapport UserDiag, on s’occupe du reste.'
        : 'Débloqué après validation du paiement.',
      done: false,
      locked: !paid,
      cta: paid ? { label: 'Ouvrir un ticket', href: DISCORD_INVITE, primary: true } : null,
    },
  ]

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      <div>
        <h1 className="font-display text-display-sm text-fmx-white">Ton parcours{userName ? `, ${userName}` : ''}</h1>
        <p className="mt-1 text-fmx-white-dim">
          4 étapes, tout se passe sur Discord. Suis le guide :
        </p>
      </div>

      {/* Accès rapide : commande en cours */}
      {pending && latest && (
        <Link
          href={`/dashboard/orders/${latest.id}`}
          className="flex items-center gap-4 rounded-2xl border border-fmx-red/40 bg-gradient-to-r from-fmx-red/[0.14] to-transparent p-5 transition-transform hover:-translate-y-px"
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fmx-red text-white">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-green-400" />
          </span>
          <span className="flex-1">
            <b className="block text-white">Commande {latest.orderNumber} en cours</b>
            <span className="block text-[13px] text-fmx-gray">Reprends où tu en es + discute avec le staff →</span>
          </span>
        </Link>
      )}

      {/* Funnel achat → opti */}
      <Card variant="glass" padding="lg">
        <CardContent>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border p-4 sm:items-center',
                  s.done
                    ? 'border-green-500/25 bg-green-500/[0.05]'
                    : s.locked
                      ? 'border-white/[0.06] bg-white/[0.01] opacity-60'
                      : 'border-fmx-red/25 bg-fmx-red/[0.05]'
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[14px] font-extrabold',
                    s.done
                      ? 'bg-green-500/20 text-green-400'
                      : s.locked
                        ? 'bg-white/[0.06] text-fmx-gray'
                        : 'bg-fmx-red text-white'
                  )}
                >
                  {s.done ? <Check className="h-4 w-4" /> : s.locked ? <Lock className="h-4 w-4" /> : i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-white">
                    {i + 1}. {s.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-fmx-gray">{s.desc}</p>
                </div>
                {s.cta && (
                  <a
                    href={s.cta.href}
                    {...(s.cta.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={cn(
                      'shrink-0 rounded-full px-5 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-px',
                      s.cta.primary ? 'bg-fmx-red text-white shadow-[0_8px_24px_rgba(255,26,26,0.35)]' : 'border border-white/15 bg-white/[0.06] text-white'
                    )}
                  >
                    {s.cta.label} →
                  </a>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Historique compact */}
      {orders.length > 0 && (
        <Card variant="glass" padding="lg">
          <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-fmx-gray" />
            Mes commandes
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.map(o => {
                const st = STATUS_LABEL[o.status] || { label: o.status, variant: 'gray' as const }
                return (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <Link href={`/dashboard/orders/${o.id}`} className="font-mono text-[12px] text-white hover:text-fmx-red hover:underline">{o.orderNumber}</Link>
                    <span className="text-[13px] text-fmx-white-dim">{PACK_NAMES[o.packageType] || o.packageType}</span>
                    <span className="text-[13px] font-bold text-white">{o.amount}€</span>
                    <Badge variant={st.variant} dot size="sm" className="ml-auto">{st.label}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rappel */}
      <p className="text-center text-[12px] text-fmx-gray">
        Une question ? Tout se passe sur <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">le Discord FMX</a>.
      </p>
    </div>
  )
}
