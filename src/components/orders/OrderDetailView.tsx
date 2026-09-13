'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Lock, MessageCircle, Copy, Wallet, Landmark, ShoppingCart, BadgeCheck, ExternalLink, ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderChat } from '@/components/orders/OrderChat'
import { PACKAGES, ADDONS } from '@/types'
import { DISCORD_INVITE, PAYPAL_LINK, PAYPAL_NAME, IBAN_RAW, IBAN_DISPLAY, TITULAIRE } from '@/lib/payment-info'
import { cn } from '@/lib/utils/helpers'

export interface OrderDetailData {
  id: string
  orderNumber: string
  packageType: string
  amount: number
  status: string
  paymentMethod: string | null
  addons: string[]
  createdAt: string
}

interface OrderDetailViewProps {
  order: OrderDetailData
  /** Pseudo Discord du client — sert de note/motif de paiement */
  pseudo: string | null
  statusLabel: string
  statusVariant: 'green' | 'yellow' | 'red' | 'gray'
  backHref: string
  backLabel: string
  /** Mode admin : miroir de l'écran client + bandeau + actions staff */
  isAdmin?: boolean
  /** Libellé client affiché en mode admin (ex. "@pseudo • email") */
  adminClientLabel?: string | null
  onCancel?: () => void
  cancelling?: boolean
  onValidate?: () => void
  validating?: boolean
  /** Clé de licence générée à la validation (affichée côté admin uniquement) */
  licenseKey?: string | null
}

function CopyBtn({ text, label = 'Copier' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-white/[0.12] hover:shadow-[0_0_14px_rgba(255,26,26,0.25)]"
    >
      {done ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? 'Copié !' : label}
    </button>
  )
}

// Vue commande simple et aérée : chat à gauche, récap + reminder paiement
// + 4 étapes à droite. Utilisée telle quelle côté client ET côté admin
// (miroir + bandeau MODE ADMIN).
export function OrderDetailView({
  order,
  pseudo,
  statusLabel,
  statusVariant,
  backHref,
  backLabel,
  isAdmin = false,
  adminClientLabel = null,
  onCancel,
  cancelling = false,
  onValidate,
  validating = false,
  licenseKey = null,
}: OrderDetailViewProps) {
  const paid = order.status === 'PAID' || order.status === 'COMPLETED'
  const pack = PACKAGES.find(p => p.id === order.packageType)
  const addonItems = order.addons
    .map(aid => ADDONS.find(a => a.id === aid))
    .filter((a): a is (typeof ADDONS)[number] => !!a)
  const isPaypal = order.paymentMethod === 'PAYPAL'
  const packName = pack?.name || order.packageType
  const methodLabel = isPaypal ? 'PayPal' : 'Virement'
  const pseudoNote = pseudo ? `@${pseudo}` : 'ton pseudo Discord'

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
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      {/* Bandeau MODE ADMIN — impossible à confondre avec l'écran client */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.08] px-5 py-3 text-[13px] font-bold text-amber-200">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span className="mr-auto">MODE ADMIN — écran de <b className="text-white">{adminClientLabel || pseudoNote}</b> (<code className="font-mono">{order.orderNumber}</code>)</span>
          {order.status === 'PENDING' && (
            <>
              <button
                onClick={onValidate}
                disabled={validating}
                className="rounded-full bg-green-600 px-5 py-2 text-[13px] font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-green-500 hover:shadow-[0_0_16px_rgba(34,197,94,0.5)] disabled:opacity-50"
              >
                {validating ? 'Validation…' : '✓ Valider le paiement'}
              </button>
              <button
                onClick={onCancel}
                disabled={cancelling}
                className="rounded-full border border-red-500/40 px-5 py-2 text-[13px] font-bold text-red-400 transition-all duration-150 hover:scale-105 hover:bg-red-500/10 disabled:opacity-50"
              >
                {cancelling ? 'Annulation…' : 'Annuler'}
              </button>
            </>
          )}
        </div>
      )}

      {/* En-tête */}
      <div>
        <Link href={backHref} className="text-[13px] text-fmx-gray transition-all duration-150 hover:text-white">{backLabel}</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-display-sm text-fmx-white">
            Commande <code className="break-all font-mono">{order.orderNumber}</code>
          </h1>
          <Badge variant={statusVariant} dot>{statusLabel}</Badge>
          {!isAdmin && order.status === 'PENDING' && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="rounded-full border border-red-500/40 px-4 py-1.5 text-[12px] font-bold text-red-400 transition-all duration-150 hover:scale-105 hover:bg-red-500/10 disabled:opacity-50"
            >
              {cancelling ? 'Annulation…' : 'Annuler la commande'}
            </button>
          )}
        </div>
      </div>

      {/* Suivi en 4 étapes — bandeau horizontal, lisible d'un coup d'œil */}
      <ol className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(s => (
          <li
            key={s.title}
            className={cn(
              'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5',
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
                {s.current && <span className="ml-1.5 rounded-full bg-fmx-red px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wide text-white">En cours</span>}
              </b>
              <span className="mt-0.5 block text-[11px] leading-snug text-fmx-gray">{s.desc}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-4 xl:h-[calc(100dvh-360px)] xl:min-h-[500px] xl:grid-cols-[minmax(0,1fr)_380px] xl:overflow-hidden">
        {/* Chat — à gauche, remplit la hauteur de l'écran */}
        <Card variant="glass" padding="lg" className="flex min-w-0 flex-col xl:h-full xl:min-h-0">
          <CardHeader className="mb-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-5 w-5 text-fmx-red" />
              Discussion de la commande
              {isAdmin && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-300">staff</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <OrderChat orderId={order.id} className="h-[540px] max-h-none flex-1 xl:h-full xl:min-h-0" />
          </CardContent>
        </Card>

        {/* Colonne droite : récap + reminder paiement */}
        <div className="min-w-0 space-y-4 xl:min-h-0 xl:overflow-y-auto xl:pb-1">
          {/* Récap pack + tous les add-ons */}
          <Card variant="glass" padding="lg" className="min-w-0 p-5">
            <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="text-[15px] text-white">{packName}</b>
                  <p className="mt-1 text-[12px] text-fmx-gray">
                    {methodLabel} • {new Date(order.createdAt).toLocaleDateString('fr-FR')} • {order.orderNumber}
                  </p>
                </div>
                <b className="text-[26px] text-white">{order.amount}€</b>
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
                {isAdmin && paid && licenseKey && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-green-500/25 bg-green-500/[0.06] px-3 py-2">
                    <span className="text-fmx-gray">Licence</span>
                    <span className="flex items-center gap-2">
                      <code className="break-all font-mono text-[11px] text-green-300">{licenseKey}</code>
                      <CopyBtn text={licenseKey} label="Copy" />
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reminder moyen de paiement choisi */}
          {!paid && order.status === 'PENDING' ? (
            <Card variant="glass" padding="lg" className="min-w-0 border-yellow-500/25 p-5">
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  {isPaypal ? <Wallet className="h-5 w-5 text-blue-400" /> : <Landmark className="h-5 w-5 text-green-400" />}
                  Régler {order.amount}€ via {methodLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaypal ? (
                  <div className="grid gap-2.5 text-center">
                    <div className="rounded-xl bg-[#003087]/20 p-2">
                      <div className="text-[11px] uppercase tracking-wider text-blue-300">Envoyer uniquement en</div>
                      <div className="text-[15px] font-extrabold text-white">AMIS & PROCHES</div>
                    </div>
                    <code className="flex items-center justify-between gap-2 rounded-lg bg-black/60 px-4 py-2.5 font-mono text-[13px] text-white">
                      <span className="truncate">{PAYPAL_NAME}</span>
                      <CopyBtn text={PAYPAL_LINK} label="Copy" />
                    </code>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a
                        href={PAYPAL_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0070BA] px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-150 hover:scale-105 hover:shadow-[0_0_18px_rgba(0,112,186,0.6)]"
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
                  <div className="grid gap-1.5 text-[13px]">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-1.5">
                      <span className="text-fmx-gray">IBAN</span>
                      <span className="flex items-center gap-2">
                        <code className="break-all font-mono text-[12px] text-white">{IBAN_DISPLAY}</code>
                        <CopyBtn text={IBAN_RAW} label="Copy" />
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-fmx-gray">Titulaire</span><span className="text-white">{TITULAIRE}</span></div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-fmx-gray">Montant</span><b className="text-fmx-red">{order.amount}€</b></div>
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
                {!isAdmin && (
                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 block rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] p-2.5 text-center text-[12px] leading-relaxed text-fmx-gray transition-all duration-150 hover:scale-[1.02] hover:bg-[#5865F2]/[0.14]"
                  >
                    <b className="text-white">Après paiement :</b> envoie ta capture dans ton ticket Discord.
                  </a>
                )}
              </CardContent>
            </Card>
          ) : paid ? (
            <Card variant="glass" padding="lg" className="min-w-0 border-green-500/25">
              <CardContent>
                <p className="flex items-center gap-2 rounded-xl border border-green-500/25 bg-green-500/[0.06] p-3 text-[13px] font-bold text-green-300">
                  <Check className="h-4 w-4 shrink-0" />
                  Paiement validé — passe à l’étape 4.
                </p>
                {!isAdmin && (
                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block rounded-full bg-[#5865F2] px-5 py-2.5 text-center text-[13px] font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-[#4752C4]"
                  >
                    Ouvrir un ticket Discord →
                  </a>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
