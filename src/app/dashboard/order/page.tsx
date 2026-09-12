'use client'

import { useState } from 'react'
import { Check, Lock, Zap, Loader2, Wallet, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PACKAGES, ADDONS } from '@/types'

type PackId = 'BASIC' | 'COMPLET' | 'ULTIME'

// Page commande du dashboard : 1. pack → 2. add-ons (Basic/Complet) → 3. paiement.
// L'Ultime inclut déjà tout : pas d'add-ons proposés.
export default function OrderPage() {
  const [pack, setPack] = useState<PackId>('COMPLET')
  const [addons, setAddons] = useState<string[]>([])
  const [method, setMethod] = useState<'PAYPAL' | 'BANK_TRANSFER'>('PAYPAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const packPrice = PACKAGES.find(p => p.id === pack)?.price ?? 0
  const addonsTotal = addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0)
  const total = packPrice + addonsTotal
  const ultime = pack === 'ULTIME'

  const toggleAddon = (id: string) =>
    setAddons(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]))

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType: pack, paymentMethod: method, addons: ultime ? [] : addons }),
      })
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
        <p className="mt-1 text-fmx-white-dim">Pack, options, paiement : tout se fait ici, puis suivi sur ta commande.</p>
      </div>

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

      {/* Étape 2 — Add-ons (pas en Ultime) */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle>2. Les options</CardTitle>
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
        </CardContent>
      </Card>

      {/* Étape 3 — Paiement */}
      <Card variant="glass" padding="lg">
        <CardHeader className="mb-4">
          <CardTitle>3. Paie avec ton pseudo en note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setMethod('PAYPAL')}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 text-left',
                method === 'PAYPAL' ? 'border-fmx-red bg-fmx-red/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'
              )}
            >
              <Wallet className="h-5 w-5 text-blue-400" />
              <span>
                <b className="block text-[13px] text-white">PayPal — Amis & Proches</b>
                <span className="block font-mono text-[12px] text-fmx-gray">paypal.me/poticatfn</span>
              </span>
            </button>
            <button
              onClick={() => setMethod('BANK_TRANSFER')}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 text-left',
                method === 'BANK_TRANSFER' ? 'border-fmx-red bg-fmx-red/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'
              )}
            >
              <Landmark className="h-5 w-5 text-green-400" />
              <span>
                <b className="block text-[13px] text-white">Virement SEPA instantané</b>
                <span className="block font-mono text-[12px] text-fmx-gray">BE15 3632 2722 1530</span>
              </span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 px-5 py-4">
            <span className="text-[13px] text-fmx-gray">Total à payer</span>
            <b className="text-[22px] text-white">{total}€</b>
          </div>

          {error && <p className="mt-3 text-center text-[13px] text-fmx-red">{error}</p>}

          <Button variant="neon" size="lg" fullWidth className="mt-4" onClick={submit} loading={loading}>
            {loading ? 'Création...' : `Créer ma commande — ${total}€`}
            <Zap className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-2 text-center text-[11px] text-fmx-gray">
            Tu paies ensuite le montant exact avec ton pseudo Discord en note, puis tu envoies ta preuve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
