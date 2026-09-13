'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { OrderDetailView, type OrderDetailData } from '@/components/orders/OrderDetailView'
import { toast } from 'react-hot-toast'

interface AdminOrderDetail extends OrderDetailData {
  user: {
    email: string
    name: string | null
    discordUsername: string | null
    discordGlobalName: string | null
    discordId: string | null
  }
}

const STATUS: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
  COMPLETED: { label: 'Payée', variant: 'green' },
  PAID: { label: 'Payée', variant: 'green' },
  PENDING: { label: 'En attente de preuve', variant: 'yellow' },
  CANCELLED: { label: 'Annulée', variant: 'red' },
  REFUNDED: { label: 'Remboursée', variant: 'gray' },
}

// Vue admin d'une commande : miroir exact de l'écran client (même layout,
// mêmes étapes) + bandeau MODE ADMIN + boutons Valider / Annuler.
// Le N° de commande (FMX-pseudo-XXX) identifie le client d'un coup d'œil.
export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.order) setOrder(data.order)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const validateOrder = async () => {
    if (!confirm('Valider ce paiement ? Une licence sera générée.')) return
    setValidating(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, action: 'PAID' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(data.message || 'Paiement validé')
        setOrder(prev => (prev ? { ...prev, status: data.order.status } : prev))
      } else {
        toast.error(data.error || 'Erreur')
      }
    } finally {
      setValidating(false)
    }
  }

  const cancelOrder = async () => {
    if (!confirm('Annuler cette commande ? Le client en sera informé.')) return
    setCancelling(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, action: 'CANCELLED' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(data.message || 'Commande annulée')
        setOrder(prev => (prev ? { ...prev, status: data.order.status } : prev))
      } else {
        toast.error(data.error || 'Erreur')
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
        <Link href="/admin#orders" className="mt-6 inline-block rounded-full bg-fmx-red px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:scale-105">
          ← Retour aux commandes
        </Link>
      </div>
    )
  }

  const st = STATUS[order.status] || { label: order.status, variant: 'gray' as const }
  const pseudo = order.user.discordUsername || order.user.discordGlobalName || null
  const clientLabel = `${pseudo ? `@${pseudo}` : order.user.email} • ${order.user.email}`

  return (
    <OrderDetailView
      order={order}
      pseudo={pseudo}
      statusLabel={st.label}
      statusVariant={st.variant}
      backHref="/admin#orders"
      backLabel="← Retour aux commandes"
      isAdmin
      adminClientLabel={clientLabel}
      onCancel={cancelOrder}
      cancelling={cancelling}
      onValidate={validateOrder}
      validating={validating}
    />
  )
}
