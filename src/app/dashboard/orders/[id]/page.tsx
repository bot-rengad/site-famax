'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { OrderDetailView, type OrderDetailData } from '@/components/orders/OrderDetailView'

const STATUS: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
  COMPLETED: { label: 'Terminée', variant: 'green' },
  PAID: { label: 'Payée', variant: 'green' },
  PENDING: { label: 'En attente de preuve', variant: 'yellow' },
  CANCELLED: { label: 'Annulée', variant: 'red' },
  REFUNDED: { label: 'Remboursée', variant: 'gray' },
}

// Page commande client : plein écran (chat + récap + paiement + étapes),
// sans scroll de page sur desktop. Le même écran existe côté admin (miroir).
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [pseudo, setPseudo] = useState<string | null>(null)
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
    fetch('/api/users/me')
      .then(r => (r.ok ? r.json() : null))
      .then((data: { user?: { discordUsername?: string | null; discordGlobalName?: string | null } }) => {
        const u = data?.user
        if (u) setPseudo(u.discordGlobalName || u.discordUsername || null)
      })
      .catch(() => {})
  }, [id])

  const cancelOrder = async () => {
    if (!confirm('Annuler cette commande ? Le staff en sera informé.')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
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
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-fmx-red px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:scale-105">
          Retour au parcours →
        </Link>
      </div>
    )
  }

  const st = STATUS[order.status] || { label: order.status, variant: 'gray' as const }

  return (
    <OrderDetailView
      order={order}
      pseudo={pseudo}
      statusLabel={st.label}
      statusVariant={st.variant}
      backHref="/dashboard"
      backLabel="← Retour au parcours"
      onCancel={cancelOrder}
      cancelling={cancelling}
    />
  )
}
