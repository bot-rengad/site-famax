'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Check, Lock, MessageCircle, Copy, Wallet, Landmark, ShoppingCart, BadgeCheck, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderChat } from '@/components/orders/OrderChat'
import { PACKAGES, ADDONS } from '@/types'
import { DISCORD_INVITE, PAYPAL_LINK, PAYPAL_NAME, IBAN_RAW, IBAN_DISPLAY, TITULAIRE } from '@/lib/payment-info'
import { cn } from '@/lib/utils/helpers'

function CopyBtn({ text, label = 'Copier' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-white/[0.12]"
    >
      {done ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? 'Copié !' : label}
    </button>
  )
}

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
  const [pseudo, setPseudo] = useState<string | null>(null)

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
    // Pseudo Discord pour le rappel "motif / note du paiement"
    fetch('/api/users/me')
      .then(r => (r.ok ? r.json() : null))
      .then((data: { user?: { discordUsername?: string | null; discordGlobalName?: string | null } }) => {
        const u = data?.user
        if (u) setPseudo(u.discordUsername || u.discordGlobalName || null)
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
  const isPaypal = order.paymentMethod === 'PAYPAL'
  const packName = pack?.name || order.packageType
  const methodLabel = isPaypal ? 'PayPal' : 'Virement'
  const pseudoNote = pseudo ? `@${pseudo}` : 'ton pseudo Discord'

  // 4 étapes ultra-claires : commande → paiement → validation → ticket Discord.
  const steps = [
    {
      icon: ShoppingCart,
      title: '1. Commande créée',
      desc: `${packName} • ${order.amount}€ — commande ${order.orderNumber} ouverte.`,
      done: true,
      current: false,
      locked: false,
    },
    {
      icon: Wallet,
      title: '2. Paiement + preuve',
      desc: paid
        ? 'Paiement reçu, preuve envoyée.'
        : `Paie ${order.amount}€ via ${methodLabel} avec ${pseudoNote} en note, puis envoie la capture sur Discord.`,
      done: paid,
      current: !paid && order.status === 'PENDING',
      locked: false,
    },
    {
      icon: BadgeCheck,
      title: '3. Validation staff',
      desc: paid
        ? 'Paiement validé par le staff.'
        : 'Le staff vérifie ton paiement dès réception de la preuve.',
      done: paid,
      current: false,
      locked: !paid,
    },
    {
      icon: MessageCircle,
      title: '4. Ticket Discord + opti',
      desc: paid
        ? 'Ouvre un ticket avec ton rapport UserDiag, on planifie ton opti 15 min.'
        : 'Débloqué après validation du paiement.',
      done: false,
      current: paid,
      locked: !paid,
    },
  ]

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
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

      {/* Rappel paiement (commandes en attente) — toujours visible sans scroller */}
      {!paid && order.status === 'PENDING' && (
        <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.06] p-4 text-[13px] leading-relaxed text-yellow-200/90">
          Paie <b>{order.amount}€</b> via <b>{methodLabel}</b> avec <b>{pseudoNote} en note</b>{' '}
          ({isPaypal ? 'paypal.me/poticatfn, Amis & Proches' : 'IBAN BE15 3632 2722 1530, Jordan Silva'}),
          puis envoie ta capture sur le Discord.
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Chat commande — à gauche, toute la hauteur visible */}
        <Card variant="glass" padding="lg" className="min-w-0">
          <CardHeader className="mb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-5 w-5 text-fmx-red" />
              Discussion de la commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderChat orderId={order.id} className="h-[calc(100dvh-320px)] max-h-none min-h-[480px]" />
          </CardContent>
        </Card>

        {/* Colonne de droite : récap + reminder paiement + 4 étapes */}
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          {/* Récap pack + tous les add-ons */}
          <Card variant="glass" padding="lg" className="min-w-0">
            <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="text-white">{packName}</b>
                  <p className="mt-1 text-[12px] text-fmx-gray">
                    {methodLabel} • {new Date(order.createdAt).toLocaleDateString('fr-FR')} • {order.orderNumber}
                  </p>
                </div>
                <b className="text-[24px] text-white">{order.amount}€</b>
              </div>
              <div className="mt-3 grid gap-1.5 border-t border-white/[0.06] pt-3 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-fmx-gray">{packName}</span>
                  <b className="text-white">{pack?.price ?? order.amount}€</b>
                </div>
                {addonItems.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <span className="text-fmx-gray">+ {a.name}</span>
                    <b className="text-white">+{a.price}€</b>
                  </div>
                ))}
                {addonItems.length === 0 && (
                  <p className="text-[12px] text-fmx-gray">Sans option.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reminder moyen de paiement choisi */}
          {!paid && order.status === 'PENDING' ? (
            <Card variant="glass" padding="lg" className="min-w-0 border-yellow-500/25">
              <CardHeader className="mb-3">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  {isPaypal ? <Wallet className="h-5 w-5 text-blue-400" /> : <Landmark className="h-5 w-5 text-green-400" />}
                  Régler {order.amount}€ via {methodLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaypal ? (
                  <div className="grid gap-3 text-center">
                    <div className="rounded-xl bg-[#003087]/20 p-3">
                      <div className="text-[11px] uppercase tracking-wider text-blue-300">Envoyer uniquement en</div>
                      <div className="text-[15px] font-extrabold text-white">AMIS & PROCHES</div>
                    </div>
                    <code className="flex items-center justify-between gap-2 rounded-lg bg-black/60 px-3 py-2.5 font-mono text-[12px] text-white">
                      <span className="truncate">{PAYPAL_NAME}</span>
                      <CopyBtn text={PAYPAL_LINK} label="Copy" />
                    </code>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a
                        href={PAYPAL_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0070BA] px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:-translate-y-px"
                      >
                        Ouvrir PayPal <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <CopyBtn text={pseudo ?? ''} label={pseudo ? `Copier @${pseudo}` : 'Pseudo Discord'} />
                    </div>
                    <p className="rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-2.5 text-[12px] leading-relaxed text-white">
                      Note du paiement = <b className="text-fmx-red">{pseudoNote}</b>
                      <span className="mt-0.5 block font-normal text-fmx-gray">Sans ça, impossible de retrouver ton paiement.</span>
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 text-[13px]">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                      <span className="text-fmx-gray">IBAN</span>
                      <span className="flex items-center gap-2">
                        <code className="break-all font-mono text-[12px] text-white">{IBAN_DISPLAY}</code>
                        <CopyBtn text={IBAN_RAW} label="Copy" />
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Titulaire</span><span className="text-white">{TITULAIRE}</span></div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Montant</span><b className="text-fmx-red">{order.amount}€</b></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-fmx-gray">Motif</span>
                      <span className="flex items-center gap-2">
                        <b className="text-white">{pseudoNote}</b>
                        {pseudo && <CopyBtn text={pseudo} label="Copier" />}
                      </span>
                    </div>
                    <p className="rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-2.5 text-center text-[12px] font-bold text-white">
                      Virement instantané + motif = {pseudoNote}
                    </p>
                  </div>
                )}
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] p-3 text-center text-[12px] leading-relaxed text-fmx-gray transition-colors hover:bg-[#5865F2]/[0.14]"
                >
                  <b className="text-white">Après paiement :</b> envoie ta capture sur Discord → salon preuves.
                </a>
              </CardContent>
            </Card>
          ) : paid ? (
            <Card variant="glass" padding="lg" className="min-w-0 border-green-500/25">
              <CardContent>
                <p className="flex items-center gap-2 rounded-xl border border-green-500/25 bg-green-500/[0.06] p-3 text-[13px] font-bold text-green-300">
                  <Check className="h-4 w-4 shrink-0" />
                  Paiement validé — passe à l’étape 4.
                </p>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block rounded-full bg-[#5865F2] px-5 py-2.5 text-center text-[13px] font-bold text-white transition-transform hover:-translate-y-px"
                >
                  Ouvrir un ticket Discord →
                </a>
              </CardContent>
            </Card>
          ) : null}

          {/* Suivi en 4 étapes claires */}
          <Card variant="glass" padding="lg" className="min-w-0">
            <CardHeader className="mb-3">
              <CardTitle className="text-[15px]">Suivi de ta commande</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-2">
                {steps.map(s => (
                  <li
                    key={s.title}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
                      s.done
                        ? 'border-green-500/25 bg-green-500/[0.06]'
                        : s.current
                          ? 'border-fmx-red/40 bg-fmx-red/[0.08] shadow-[0_0_24px_rgba(255,26,26,0.12)]'
                          : s.locked
                            ? 'border-white/[0.06] opacity-60'
                            : 'border-white/[0.08] bg-white/[0.02]'
                    )}
                  >
                    <span className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full',
                      s.done ? 'bg-green-500/20 text-green-400' : s.current ? 'bg-fmx-red text-white' : 'bg-white/[0.06] text-fmx-gray'
                    )}>
                      {s.done ? <Check className="h-3.5 w-3.5" /> : s.locked ? <Lock className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <b className={cn('block text-[12px]', s.done ? 'text-green-300' : s.locked ? 'text-fmx-gray' : 'text-white')}>
                        {s.title}
                        {s.current && <span className="ml-2 rounded-full bg-fmx-red px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">En cours</span>}
                      </b>
                      <span className="mt-0.5 block text-[12px] leading-snug text-fmx-gray">{s.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
