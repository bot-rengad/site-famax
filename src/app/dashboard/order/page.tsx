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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 lg:h-[calc(100dvh-112px)] lg:min-h-[640px]">
      <div className="shrink-0">
        <h1 className="font-display text-display-sm text-fmx-white">Commander une opti</h1>
        {step === 1 && <p className="mt-1 text-[13px] text-fmx-white-dim">3 étapes, 2 minutes : tu choisis, tu paies, tu discutes avec le staff.</p>}
      </div>

      {/* Indicateur d'étapes */}
      <ol className="grid shrink-0 grid-cols-3 gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const done = n < step
          const current = n === step
          return (
            <li
              key={label}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center text-[12px] font-bold',
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
          className="flex shrink-0 items-center gap-2.5 rounded-xl border border-fmx-red/40 bg-gradient-to-r from-fmx-red/[0.14] to-transparent px-3 py-2 transition-transform hover:-translate-y-px"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fmx-red text-white">
            <MessageCircle className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 truncate text-[13px] text-white">
            <b>Commande {pendingOrder.orderNumber} en cours ({pendingOrder.amount}€)</b>
            <span className="text-fmx-gray"> — reprendre →</span>
          </span>
        </Link>
      )}

      {step === 1 && (
        <div className="grid min-h-0 items-start gap-4 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
          {/* Gauche : choix pack + options (scroll interne sur desktop) */}
          <div className="grid min-w-0 gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 lg:pr-1">
          {/* Étape 1 — Pack */}
          <Card variant="glass" padding="lg">
            <CardHeader className="mb-3">
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
                        'fmx-window rounded-2xl p-4 text-left transition-all duration-150 hover:-translate-y-px hover:border-fmx-red/40 hover:shadow-[0_0_28px_rgba(255,26,26,0.15)]',
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
            <CardHeader className="mb-3">
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
                          'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:border-fmx-red/40 hover:shadow-[0_0_20px_rgba(255,26,26,0.12)]',
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
            </CardContent>
          </Card>
          </div>

          {/* Droite : récap sticky + total + CTA */}
          <div className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pb-1">
            <Card variant="glass" padding="lg" className="p-5">
              <CardHeader className="mb-2">
                <CardTitle className="text-[15px]">Ta commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <b className="text-[15px] text-white">{packName}</b>
                    <p className="mt-0.5 text-[12px] text-fmx-gray">{packPrice}€ de base</p>
                  </div>
                  <b className="text-[26px] text-white">{total}€</b>
                </div>
                <div className="mt-3 grid gap-1.5 border-t border-white/[0.06] pt-3 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-fmx-gray">{packName}</span>
                    <b className="text-white">{packPrice}€</b>
                  </div>
                  {!ultime && addons.map(id => {
                    const a = ADDONS.find(x => x.id === id)
                    if (!a) return null
                    return (
                      <div key={id} className="flex items-center justify-between gap-2">
                        <span className="text-fmx-gray">+ {a.name}</span>
                        <b className="text-white">+{a.price}€</b>
                      </div>
                    )
                  })}
                  {(ultime || addons.length === 0) && (
                    <p className="text-[12px] text-fmx-gray">{ultime ? 'Tout inclus, sans option.' : 'Sans option.'}</p>
                  )}
                </div>
                <Button variant="neon" size="lg" fullWidth className="mt-4" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                  Continuer vers le paiement — {total}€
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-2 text-center text-[11px] text-fmx-gray">Paiement PayPal ou virement à l’étape suivante.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid items-stretch gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Gauche : paiement — remplit l'écran, sans scroll */}
          <div className="min-w-0 lg:h-full lg:min-h-0">
            <Card variant="glass" padding="lg" className="flex h-full flex-col p-5 lg:p-6">
              <CardHeader className="mb-3 flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-[17px]">3. Paie {total}€, puis confirme</CardTitle>
                {/* Choix du moyen */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setMethod('PAYPAL')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-all',
                      method === 'PAYPAL' ? 'border-fmx-red bg-fmx-red/[0.12] text-white' : 'border-white/[0.1] text-fmx-gray hover:text-white'
                    )}
                  >
                    <Wallet className="h-4 w-4 text-blue-400" /> PayPal
                  </button>
                  <button
                    onClick={() => setMethod('BANK_TRANSFER')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-all',
                      method === 'BANK_TRANSFER' ? 'border-fmx-red bg-fmx-red/[0.12] text-white' : 'border-white/[0.1] text-fmx-gray hover:text-white'
                    )}
                  >
                    <Landmark className="h-4 w-4 text-green-400" /> Virement
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {/* Pseudo Discord à mettre en note — 1 ligne */}
                {discordLinked && pseudo ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] px-4 py-3">
                    <p className="truncate text-[13px] text-fmx-gray">
                      <b className="text-white">Note du paiement :</b>
                      <code className="ml-2 rounded bg-black/50 px-2 py-1 font-mono text-[13px] text-white">@{pseudo}</code>
                    </p>
                    <CopyBtn text={pseudo} label="Copier le pseudo" />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-yellow-500/25 bg-yellow-500/[0.06] px-4 py-3 text-[13px] text-yellow-200/90">
                    <span><b>Lie ton Discord</b> pour retrouver ton paiement.</span>
                    <a
                      href={`/api/auth/discord?redirect=${encodeURIComponent(`/dashboard/order?pack=${pack}`)}`}
                      className="rounded-full bg-[#5865F2] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#4752C4]"
                    >
                      Vérifier avec Discord →
                    </a>
                  </div>
                )}

                {/* Détails du moyen choisi — prend l'espace restant */}
                {method === 'PAYPAL' ? (
                  <div className="mt-3 flex flex-1 flex-col justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center lg:p-5">
                    <p className="text-[14px] text-fmx-gray">
                      Envoie <b className="text-[20px] text-white">{total}€</b> en{' '}
                      <span className="rounded-full bg-[#003087]/40 px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-wide text-blue-200">Amis & Proches</span>{' '}
                      à :
                    </p>
                    <div className="mx-auto mt-3 flex w-full max-w-[480px] items-center justify-between gap-3 rounded-lg bg-black/60 px-4 py-3 font-mono text-[14px] text-white">
                      <span className="truncate">{PAYPAL_NAME}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <CopyBtn text={PAYPAL_LINK} />
                        <a href={PAYPAL_LINK} target="_blank" rel="noreferrer" className="rounded-full bg-[#0070BA] px-4 py-2 font-sans text-[12px] font-bold text-white hover:brightness-110">
                          Ouvrir →
                        </a>
                      </span>
                    </div>
                    <p className="mx-auto mt-3 w-full max-w-[480px] rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] px-4 py-2.5 text-[12px] font-bold text-white">
                      ⚠ Note = ton <span className="text-fmx-red">pseudo Discord</span> exact{pseudo ? <> (ex : @{pseudo})</> : null} — sinon paiement introuvable.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-1 flex-col justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 lg:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <b className="text-[14px] text-white">🇧🇪 SEPA Instantané — {total}€</b>
                      <CopyBtn text={`${IBAN_DISPLAY} - ${TITULAIRE}`} label="Copier" />
                    </div>
                    <div className="mt-3 grid gap-2 text-[13px]">
                      <div className="flex flex-wrap items-center gap-x-2 border-b border-white/[0.06] pb-2">
                        <span className="text-fmx-gray">IBAN</span>
                        <code className="break-all font-mono text-white">{IBAN_DISPLAY}</code>
                        <button onClick={() => navigator.clipboard.writeText(IBAN_RAW).catch(() => {})} className="text-[12px] font-bold text-fmx-gray underline hover:text-white">copier IBAN</button>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Titulaire</span><span className="text-white">{TITULAIRE}</span></div>
                      <div className="flex justify-between"><span className="text-fmx-gray">Motif / Référence</span><span className="font-bold text-white">{pseudo ? `@${pseudo}` : 'ton pseudo Discord'}</span></div>
                    </div>
                    <p className="mt-3 rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] px-4 py-2.5 text-center text-[12px] font-bold text-white">
                      ⚠ Motif du virement = ton <span className="text-fmx-red">pseudo Discord</span> exact
                    </p>
                  </div>
                )}
                {/* Rappel 3 étapes — 1 ligne */}
                <p className="mt-3 text-center text-[12px] leading-relaxed text-fmx-gray">
                  1. Paie <b className="text-white">{total}€</b> avec <b className="text-white">{pseudo ? `@${pseudo}` : 'ton pseudo'}</b> en note
                  {' '}→ 2. Coche « J&apos;ai payé » à droite
                  {' '}→ 3. Envoie la capture dans ton ticket
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Droite : récap + confirmation, sans scroll */}
          <div className="min-w-0 space-y-3">
            <Card variant="glass" padding="lg" className="p-5">
              <CardHeader className="mb-2.5">
                <CardTitle className="text-[16px]">Ta commande</CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setStep(1)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-left transition-all hover:border-fmx-red/40 hover:bg-black/60"
                >
                  <span className="truncate text-[13px] text-fmx-gray">
                    <b className="text-white">{packName}</b>
                    {addons.length > 0 && ` + ${addons.length} opt.`} • <b className="text-white">{total}€</b>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-fmx-red">
                    <ArrowLeft className="h-3.5 w-3.5" /> Modifier
                  </span>
                </button>

                <div className="mt-3 grid gap-1.5 border-t border-white/[0.06] pt-3 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-fmx-gray">{packName}</span>
                    <b className="text-white">{packPrice}€</b>
                  </div>
                  {!ultime && addons.map(id => {
                    const a = ADDONS.find(x => x.id === id)
                    if (!a) return null
                    return (
                      <div key={id} className="flex items-center justify-between gap-2">
                        <span className="truncate text-fmx-gray">+ {a.name}</span>
                        <b className="shrink-0 text-white">+{a.price}€</b>
                      </div>
                    )
                  })}
                  <div className="mt-1 flex items-center justify-between border-t border-white/[0.06] pt-2">
                    <span className="font-bold text-white">Total</span>
                    <b className="text-[20px] text-white">{total}€</b>
                  </div>
                </div>

                {/* Confirmation de paiement */}
                <button
                  onClick={() => setPaidChecked(v => !v)}
                  className={cn(
                    'mt-3 flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                    paidChecked ? 'border-green-500/40 bg-green-500/[0.06]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                  )}
                >
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border', paidChecked ? 'border-green-500 bg-green-500 text-white' : 'border-white/20 text-transparent')}>
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] text-white">
                    <b>J&apos;ai payé {total}€</b> {pseudo ? <>avec <b>@{pseudo}</b></> : 'avec mon pseudo en note'}
                  </span>
                </button>

                {error && <p className="mt-2 text-center text-[12px] text-fmx-red">{error}</p>}

                <Button variant="neon" size="lg" fullWidth className="mt-3" onClick={confirmPaid} loading={loading} disabled={!paidChecked}>
                  {loading ? 'Création...' : 'Confirmer et ouvrir ma commande →'}
                  {!loading && <PartyPopper className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>

            {/* Dernière étape : preuve dans le ticket — 1 ligne */}
            <div className="flex items-center gap-3 rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] px-4 py-3">
              <MessageCircle className="h-5 w-5 shrink-0 text-[#8b9bff]" />
              <p className="flex-1 text-[12px] leading-snug text-fmx-gray">
                <b className="text-white">Dernière étape :</b> envoie ta capture ({method === 'PAYPAL' ? 'PayPal' : 'virement'} {total}€) dans ton ticket
              </p>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-[#5865F2] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#4752C4]"
              >
                Discord →
              </a>
            </div>
          </div>
        </div>
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
