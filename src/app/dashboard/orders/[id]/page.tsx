'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Check, Lock, MessageCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderChat } from '@/components/orders/OrderChat'
import { PACKAGES, ADDONS } from '@/types'
import { cn } from '@/lib/utils/helpers'

interface OrderDetail {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
  paymentMethod: string | null
  addons: string[]
  createdAt: string
}

const STATUS: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
  COMPLETED: { label: 'Payée', variant: 'green' },
  PAID: { label: 'Payée', variant: 'green' },
  PENDING: { label: 'En attente de preuve', variant: 'yellow' },
  CANCELLED: { label: 'Annulée', variant: 'red' },
  REFUNDED: { label: 'Remboursée', variant: 'gray' },
}

// Suivi d'une commande : récap + étapes + chat client/staff.
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.order) {
          const raw: unknown = data.order.addons
          const addons: string[] = Array.isArray(raw)
            ? raw.filter((x): x is string => typeof x === 'string')
            : []
          setOrder({ ...data.order, addons })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const cancelOrder = async () => {
    if (!confirm('Annuler cette commande ? Le staff en sera informé.')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        // L'API peut renvoyer les add-ons en JSON brut : normalise en tableau
        const rawAddons: unknown = data.order?.addons
        const addons: string[] = Array.isArray(rawAddons)
          ? rawAddons.filter((x): x is string => typeof x === 'string')
          : []
        setOrder(prev => (prev ? { ...prev, status: data.order.status, addons } : prev))
      }
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-fmx-red border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[640px] py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Commande introuvable</h1>
        <p className="mt-2 text-sm text-fmx-gray">Elle a peut-être été annulée, ou ce n’est pas la tienne.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-fmx-red px-6 py-3 text-sm font-bold text-white">
          Retour au parcours →
        </Link>
      </div>
    )
  }

  const paid = order.status === 'PAID' || order.status === 'COMPLETED'
  const pack = PACKAGES.find(p => p.id === order.packageType)
  const st = STATUS[order.status] || { label: order.status, variant: 'gray' as const }
  const addonItems = order.addons
    .map(aid => ADDONS.find(a => a.id === aid))
    .filter((a): a is (typeof ADDONS)[number] => !!a)

  const steps = [
    { label: 'Commande créée', done: true },
    { label: 'Paiement + preuve', done: paid },
    { label: 'Validation staff', done: paid },
    { label: 'Ticket + opti', done: false, locked: !paid },
  ]

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      <div>
        <Link href="/dashboard" className="text-[12px] text-fmx-gray hover:text-white">← Retour au parcours</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-display-sm text-fmx-white">Commande <code className="font-mono">{order.orderNumber}</code></h1>
          <Badge variant={st.variant} dot>{st.label}</Badge>
          {order.status === 'PENDING' && (
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              className="rounded-full border border-red-500/40 px-4 py-1.5 text-[12px] font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {cancelling ? 'Annulation…' : 'Annuler la commande'}
            </button>
          )}
        </div>
      </div>

      {/* Récap */}
      <Card variant="glass" padding="lg">
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <b className="text-white">{pack?.name || order.packageType}</b>
              {addonItems.length > 0 && (
                <p className="mt-1 text-[13px] text-fmx-gray">
                  + {addonItems.map(a => `${a.name} (+${a.price}€)`).join(' • ')}
                </p>
              )}
              <p className="mt-1 text-[12px] text-fmx-gray">
                Payée via {order.paymentMethod === 'PAYPAL' ? 'PayPal' : 'virement'} • {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <b className="text-[24px] text-white">{order.amount}€</b>
          </div>

          {!paid && order.status === 'PENDING' && (
            <div className="mt-4 rounded-xl border border-yellow-500/25 bg-yellow-500/[0.06] p-4 text-[13px] leading-relaxed text-yellow-200/90">
              Paie <b>{order.amount}€</b> avec ton <b>pseudo Discord en note</b>{' '}
              ({order.paymentMethod === 'PAYPAL' ? 'paypal.me/poticatfn, Amis & Proches' : 'IBAN BE15 3632 2722 1530, Jordan Silva'}),
              puis envoie ta capture sur le Discord.
            </div>
          )}

          {/* Étapes */}
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.label}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-bold',
                  s.done ? 'border-green-500/25 bg-green-500/[0.06] text-green-300' : s.locked ? 'border-white/[0.06] text-fmx-gray opacity-60' : 'border-fmx-red/25 bg-fmx-red/[0.06] text-white'
                )}
              >
                {s.done ? <Check className="h-4 w-4 shrink-0" /> : s.locked ? <Lock className="h-4 w-4 shrink-0" /> : <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-fmx-red text-[11px] text-white">{i + 1}</span>}
                {s.label}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Chat commande */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-fmx-red" />
            Discussion de la commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderChat orderId={order.id} />
        </CardContent>
      </Card>
    </div>
  )
}
