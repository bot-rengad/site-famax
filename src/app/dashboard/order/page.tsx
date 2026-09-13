'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, Lock, Copy, Wallet, Landmark, ArrowLeft, ArrowRight, MessageCircle, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PACKAGES, ADDONS } from '@/types'
import { DISCORD_INVITE, PAYPAL_LINK, PAYPAL_NAME, IBAN_RAW, IBAN_DISPLAY, TITULAIRE } from '@/lib/payment-info'

type PackId = 'BASIC' | 'COMPLET' | 'ULTIME'

const VALID_PACKS: PackId[] = ['BASIC', 'COMPLET', 'ULTIME']

const STEPS = ['Pack & options', 'Paiement', 'Suivi & chat']

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

// Parcours d'achat en 3 étapes ultra-guidées :
// 1. pack + options → 2. payer (PayPal/RIB affichés) → 3. "J'ai payé" → commande + chat.
function OrderContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [pack, setPack] = useState<PackId>('COMPLET')
  const [addons, setAddons] = useState<string[]>([])
  const [method, setMethod] = useState<'PAYPAL' | 'BANK_TRANSFER'>('PAYPAL')
  const [paidChecked, setPaidChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pseudo, setPseudo] = useState<string | null>(null)
  const [discordLinked, setDiscordLinked] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<{ id: string; orderNumber: string; amount: number } | null>(null)

  const packPrice = PACKAGES.find(p => p.id === pack)?.price ?? 0
  const addonsTotal = addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0)
  const total = packPrice + addonsTotal
  const ultime = pack === 'ULTIME'
  const packName = PACKAGES.find(p => p.id === pack)?.name ?? pack

  // Pack transmis depuis la landing (?pack=...) + pseudo Discord + commande en cours
  useEffect(() => {
    const q = (searchParams.get('pack') || '').toUpperCase()
    if ((VALID_PACKS as string[]).includes(q)) {
      setPack(q as PackId)
      if (q === 'ULTIME') setAddons([])
    }
    fetch('/api/users/me')
      .then(r => (r.ok ? r.json() : {}))
      .then((data: any) => {
        const u = data?.user
        if (u) {
          setPseudo(u.discordUsername || u.discordGlobalName || null)
          setDiscordLinked(!!u.discordVerifiedAt)
        }
      })
      .catch(() => {})
    fetch('/api/orders?limit=1')
      .then(r => (r.ok ? r.json() : {}))
      .then((data: any) => {
        const first = data?.orders?.[0]
        if (first && first.status === 'PENDING') {
          setPendingOrder({ id: first.id, orderNumber: first.orderNumber, amount: first.amount })
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleAddon = (id: string) =>
    setAddons(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]))

  // "J'ai payé" → crée la commande et envoie vers le suivi + chat
  const confirmPaid = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType: pack, paymentMethod: method, addons: ultime ? [] : addons }),
      })
      if (res.status === 401) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(`/dashboard/order?pack=${pack}`)}`
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande')
      window.location.href = `/dashboard/orders/${data.order.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      <div>
        <h1 className="font-display text-display-sm text-fmx-white">Commander une opti</h1>
        <p className="mt-1 text-fmx-white-dim">3 étapes, 2 minutes : tu choisis, tu paies, tu discutes avec le staff.</p>
      </div>

      {/* Indicateur d'étapes */}
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const done = n < step
          const current = n === step
          return (
            <li
              key={label}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-center text-[12px] font-bold',
                done
                  ? 'border-green-500/25 bg-green-500/[0.06] text-green-300'
                  : current
                    ? 'border-fmx-red/40 bg-fmx-red/[0.08] text-white'
                    : 'border-white/[0.06] text-fmx-gray opacity-60'
              )}
            >
              <span className={cn(
                'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px]',
                done ? 'bg-green-500/20 text-green-400' : current ? 'bg-fmx-red text-white' : 'bg-white/[0.06] text-fmx-gray'
              )}>
                {done ? <Check className="h-3 w-3" /> : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{n}</span>
            </li>
          )
        })}
      </ol>

      {/* Commande en cours : reprise en 1 clic */}
      {pendingOrder && (
        <Link
          href={`/dashboard/orders/${pendingOrder.id}`}
          className="flex items-center gap-4 rounded-2xl border border-fmx-red/40 bg-gradient-to-r from-fmx-red/[0.14] to-transparent p-5 transition-transform hover:-translate-y-px"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fmx-red text-white">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <b className="block text-white">Tu as déjà la commande {pendingOrder.orderNumber} en cours ({pendingOrder.amount}€)</b>
            <span className="block text-[13px] text-fmx-gray">Reprends où tu en es + discute avec le staff →</span>
          </span>
        </Link>
      )}

      {step === 1 && (
        <>
          {/* Étape 1 — Pack */}
          <Card variant="glass" padding="lg">
            <CardHeader className="mb-4">
              <CardTitle>1. Choisis ton pack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {PACKAGES.map(p => {
                  const selected = pack === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setPack(p.id as PackId); if (p.id === 'ULTIME') setAddons([]) }}
                      className={cn(
                        'fmx-window rounded-2xl p-5 text-left transition-all',
                        selected && 'border-fmx-red shadow-[0_0_32px_rgba(255,26,26,0.18)]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <b className="text-[14px] text-white">{p.name}</b>
                        {selected && <Check className="h-4 w-4 text-fmx-red" />}
                      </div>
                      <div className="mt-1 text-[24px] font-extrabold text-white">{p.price}€</div>
                      <p className="mt-1 text-[12px] text-fmx-gray">{p.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Étape 1 — Options */}
          <Card variant="glass" padding="lg">
            <CardHeader className="mb-4">
              <CardTitle>2. Les options <span className="font-normal text-fmx-gray">(facultatif)</span></CardTitle>
            </CardHeader>
            <CardContent>
              {ultime ? (
                <p className="flex items-center gap-2 rounded-xl border border-green-500/25 bg-green-500/[0.06] p-4 text-[13px] text-green-300">
                  <Lock className="h-4 w-4 shrink-0" />
                  Pack Ultime : tout est déjà inclus, aucune option à ajouter.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {ADDONS.map(a => {
                    const on = addons.includes(a.id)
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAddon(a.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                          on ? 'border-fmx-red bg-fmx-red/[0.08]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        )}
                      >
                        <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border', on ? 'border-fmx-red bg-fmx-red text-white' : 'border-white/20 text-transparent')}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex-1">
                          <b className="block text-[13px] text-white">{a.name}</b>
                          <span className="block text-[12px] text-fmx-gray">{a.desc}</span>
                        </span>
                        <b className="text-[13px] text-fmx-red">+{a.price}€</b>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/40 px-5 py-4">
                <span className="text-[13px] text-fmx-gray">Total</span>
                <b className="text-[22px] text-white">{total}€</b>
              </div>

              <Button variant="neon" size="lg" fullWidth className="mt-4" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                Continuer vers le paiement — {total}€
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {step === 2 && (
        <Card variant="glass" padding="lg">
          <CardHeader className="mb-4">
            <CardTitle>3. Paie {total}€, puis confirme</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Rappel commande */}
            <button
              onClick={() => setStep(1)}
              className="mb-4 flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-5 py-3 text-left transition-colors hover:border-white/20"
            >
              <span className="text-[13px] text-fmx-gray">
                <b className="text-white">{packName}</b>
                {addons.length > 0 && ` + ${addons.length} option${addons.length > 1 ? 's' : ''}`} • <b className="text-white">{total}€</b>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-fmx-red">
                <ArrowLeft className="h-3.5 w-3.5" /> Modifier
              </span>
            </button>

            {/* Pseudo Discord à mettre en note */}
            {discordLinked && pseudo ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] p-4">
                <p className="text-[13px] text-fmx-gray">
                  <b className="text-white">Note du paiement : ton pseudo Discord</b>
                  <code className="ml-2 rounded bg-black/50 px-2 py-1 font-mono text-[13px] text-white">@{pseudo}</code>
                </p>
                <CopyBtn text={pseudo} label="Copier le pseudo" />
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.06] p-4 text-[13px] leading-relaxed text-yellow-200/90">
                <b>Lie ton Discord</b> pour que le staff retrouve ton paiement grâce à ton pseudo.
                <a
                  href={`/api/auth/discord?redirect=${encodeURIComponent(`/dashboard/order?pack=${pack}`)}`}
                  className="ml-2 inline-block rounded-full bg-[#5865F2] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#4752C4]"
                >
                  Vérifier avec Discord →
                </a>
              </div>
            )}

            {/* Choix du moyen */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMethod('PAYPAL')}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left',
                  method === 'PAYPAL' ? 'border-fmx-red bg-fmx-red/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'
                )}
              >
                <Wallet className="h-5 w-5 shrink-0 text-blue-400" />
                <span>
                  <b className="block text-[13px] text-white">PayPal</b>
                  <span className="block text-[12px] text-fmx-gray">Amis & Proches</span>
                </span>
              </button>
              <button
                onClick={() => setMethod('BANK_TRANSFER')}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left',
                  method === 'BANK_TRANSFER' ? 'border-fmx-red bg-fmx-red/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'
                )}
              >
                <Landmark className="h-5 w-5 shrink-0 text-green-400" />
                <span>
                  <b className="block text-[13px] text-white">Virement</b>
                  <span className="block text-[12px] text-fmx-gray">SEPA instantané</span>
                </span>
              </button>
            </div>

            {/* Détails du moyen choisi — repris de l'ancien bloc paiement landing */}
            {method === 'PAYPAL' ? (
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
                  <p className="text-[13px] text-fmx-gray">Envoie <b className="text-[18px] text-white">{total}€</b> en <b className="text-white">Amis & Proches</b> à :</p>
                  <div className="mx-auto mt-3 max-w-[400px] rounded-xl bg-[#003087]/20 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-blue-300">Envoyer uniquement en</div>
                    <div className="text-[15px] font-extrabold text-white">AMIS & PROCHES</div>
                    <div className="text-[11px] text-fmx-gray">Friends & Family — sinon remboursement automatique</div>
                  </div>
                  <code className="mx-auto mt-3 flex max-w-[400px] items-center justify-between gap-3 rounded-lg bg-black/60 px-4 py-3 font-mono text-[13px] text-white">
                    {PAYPAL_NAME}
                    <CopyBtn text={PAYPAL_LINK} />
                  </code>
                  <a
                    href={PAYPAL_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-full bg-[#0070BA] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px"
                  >
                    Ouvrir PayPal →
                  </a>
                  <p className="mx-auto mt-3 max-w-[400px] rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-3 text-[12px] font-bold text-white">
                    ⚠ Note du paiement = ton <span className="text-fmx-red">pseudo Discord</span> exact
                    <span className="mt-1 block font-normal text-fmx-gray">{pseudo ? <>Ex : @{pseudo} — sans ça, impossible de retrouver ton paiement.</> : 'Sans ça, impossible de retrouver ton paiement.'}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-fmx-gray">
                  <b className="text-white">✓ Comment ça marche</b>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    <li>Paie <b className="text-white">{total}€</b> en <b className="text-white">Ami & Proche</b> avec <b className="text-white">{pseudo ? `@${pseudo}` : 'ton pseudo Discord'}</b> en note</li>
                    <li>Coche « J&apos;ai payé » ci-dessous → ta commande est créée</li>
                    <li>Envoie la capture sur <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">Discord FMX</a> → salon preuves</li>
                  </ol>
                  <p className="mt-2 text-green-400">⚡ Commande validée par le staff après vérification de la preuve.</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <b className="text-white">🇧🇪 Belgique — SEPA Instantané</b>
                    <CopyBtn text={`${IBAN_DISPLAY} - ${TITULAIRE}`} label="Copy" />
                  </div>
                  <div className="mt-3 grid gap-2 text-[13px]">
                    <div className="flex flex-col gap-2 border-b border-white/[0.06] pb-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-fmx-gray">IBAN</span>
                      <span className="flex items-center justify-between gap-2">
                        <code className="break-all font-mono text-white">{IBAN_DISPLAY}</code>
                        <CopyBtn text={IBAN_RAW} />
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Titulaire</span><span className="text-white">{TITULAIRE}</span></div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Type</span><span className="text-green-400">Virement instantané ⚡</span></div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Montant</span><b className="text-fmx-red">{total}€</b></div>
                    <div className="flex justify-between"><span className="text-fmx-gray">Motif / Référence</span><span className="font-bold text-white">{pseudo ? `@${pseudo}` : 'Ton pseudo Discord'}</span></div>
                  </div>
                  <p className="mt-3 rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-3 text-center text-[12px] font-bold text-white">
                    ⚠ Motif du virement = ton <span className="text-fmx-red">pseudo Discord</span> exact
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-fmx-gray">
                  <b className="text-white">✓ Instructions</b>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    <li>Virement instantané de <b className="text-white">{total}€</b> vers <b className="text-white">{IBAN_DISPLAY}</b> ({TITULAIRE})</li>
                    <li>Motif = <b className="text-white">{pseudo ? `@${pseudo}` : 'ton pseudo Discord'}</b></li>
                    <li>Coche « J&apos;ai payé » ci-dessous, puis envoie la capture sur <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">Discord FMX</a> → salon preuves</li>
                  </ol>
                  <p className="mt-2 text-green-400">Virement instantané = validation en quelques minutes après vérification.</p>
                </div>
              </div>
            )}

            {/* Confirmation de paiement */}
            <button
              onClick={() => setPaidChecked(v => !v)}
              className={cn(
                'mt-4 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                paidChecked ? 'border-green-500/40 bg-green-500/[0.06]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
              )}
            >
              <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border', paidChecked ? 'border-green-500 bg-green-500 text-white' : 'border-white/20 text-transparent')}>
                <Check className="h-4 w-4" />
              </span>
              <span className="text-[13px] text-white">
                <b>J&apos;ai payé {total}€</b> {pseudo ? <>avec <b>@{pseudo}</b> en note</> : 'avec mon pseudo Discord en note'}
              </span>
            </button>

            {error && <p className="mt-3 text-center text-[13px] text-fmx-red">{error}</p>}

            <Button variant="neon" size="lg" fullWidth className="mt-4" onClick={confirmPaid} loading={loading} disabled={!paidChecked}>
              {loading ? 'Création...' : 'Confirmer et ouvrir ma commande →'}
              {!loading && <PartyPopper className="ml-2 h-4 w-4" />}
            </Button>
            {/* Étape finale : preuve Discord — repris de l'ancien bloc landing */}
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] p-5 text-center">
              <MessageCircle className="h-6 w-6 text-[#8b9bff]" />
              <p className="max-w-[520px] text-[13px] leading-relaxed text-fmx-gray">
                <b className="text-white">Étape finale : envoie ta preuve sur Discord.</b>
                <br />
                Capture du paiement ({method === 'PAYPAL' ? 'PayPal' : 'virement'} {total}€) avec {pseudo ? <>@{pseudo}</> : 'ton pseudo Discord'} visible.
                Le staff vérifie puis valide ta commande.
              </p>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px hover:bg-[#4752C4]"
              >
                Ouvrir le Discord FMX →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Suspense requis : useSearchParams() force un rendu côté client
export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-fmx-red border-t-transparent" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  )
}
