'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Landmark, ShieldCheck, Timer, Wallet, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { ADDONS, PACKAGES, type PackId } from '@/types'

export type PlanId = PackId

interface PricingProps {
  selectedPlan: PackId | null
  onSelect: (plan: PackId) => void
  onOrder: (plan?: PackId | null) => void
}

const extras = ADDONS.map(a => ({ name: a.name, price: `+${a.price}€`, desc: a.desc })).concat([
  { name: 'Dépannage', price: '5–15€', desc: 'Diagnostic complet puis tarif exact selon gravité (via ticket).' },
])

// Règlement & Conditions — rassure et cadre la prestation, juste sous les tarifs.
const RULES = [
  {
    icon: Wallet,
    title: 'Paiement par virement (RIB) ou PayPal',
    text: "Tu règles par virement SEPA ou PayPal (envoi en Amis & Proches, avec ton pseudo Discord en note). Les coordonnées exactes s'affichent après ta commande, à l'étape paiement.",
  },
  {
    icon: XCircle,
    title: 'Aucun remboursement une fois le travail commencé',
    text: "Paiement validé = travail réservé. Sauf si on constate aucune différence après l'optimisation : dans ce cas le staff réévalue avec toi (optimisation complémentaire ou geste commercial).",
  },
  {
    icon: ShieldCheck,
    title: 'Suivi garanti pendant 30 jours',
    text: "Après l'intervention, on reste dispo 30 jours pour résoudre tes problèmes et réajuster si besoin (suivi à vie pour le Pack Ultime).",
  },
  {
    icon: Timer,
    title: 'Support interrompu en cas de réinitialisation',
    text: "Si tu réinitialises ton PC sans nous prévenir, le support s'arrête immédiatement (les réglages sont effacés, il faut tout refaire).",
  },
]

function Reglement() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="mx-auto mt-10 max-w-[1080px]">
      <h3 className="text-center text-[15px] font-bold uppercase tracking-[0.16em] text-fmx-gray">
        Règlement & conditions
      </h3>
      <div className="mt-5 grid gap-3">
        {RULES.map((rule, i) => {
          const isOpen = open === i
          return (
            <div
              key={rule.title}
              className={cn(
                'fmx-window overflow-hidden rounded-2xl transition-all duration-200',
                isOpen && 'border-fmx-red/30'
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-[56px] w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <rule.icon className="h-5 w-5 shrink-0 text-fmx-red" />
                <span className="flex-1 text-[14px] font-bold text-white">{rule.title}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-fmx-gray transition-transform duration-200', isOpen && 'rotate-180 text-fmx-red')} />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 pl-[52px] text-[13px] leading-relaxed text-fmx-gray">{rule.text}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-center text-[12px] text-fmx-gray">
        Conditions complètes :{' '}
        <Link href="/conditions-generales" className="font-bold text-fmx-red hover:underline">
          lire les CGV →
        </Link>
      </p>
    </div>
  )
}

export function Pricing({ selectedPlan, onSelect, onOrder }: PricingProps) {
  return (
    <section id="plans" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fmx-red/30 bg-fmx-red/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-fmx-red">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fmx-red" />
          Paiement unique • Sans abonnement
        </div>
        <h2 className="mt-4 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Tarifs & prestations
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Choisis ton pack, paie, et on s&apos;occupe du reste. Diagnostic UserDiag et avis
          du staff avant chaque intervention.
        </p>
      </div>

      {/* 5 cartes : 1 col mobile, 2 tablette, 3 desktop (3 + 2) */}
      <div className="mx-auto mt-10 grid max-w-[1080px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map(plan => {
          const isSelected = selectedPlan === (plan.id as PackId)
          const isPopular = !!plan.popular
          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${plan.name} — ${plan.price}€`}
              onClick={() => onSelect(plan.id as PackId)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(plan.id as PackId)
                }
              }}
              className={cn(
                'group relative flex cursor-pointer flex-col rounded-2xl p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmx-red sm:p-6',
                'border bg-white/[0.02]',
                'hover:-translate-y-1.5 hover:border-fmx-red/50 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(255,26,26,0.18)]',
                isPopular
                  ? 'border-fmx-red/60 shadow-[0_0_40px_rgba(255,26,26,0.18)] hover:shadow-[0_20px_60px_rgba(255,26,26,0.3)]'
                  : 'border-white/[0.08]',
                isSelected && 'border-fmx-red shadow-[0_0_40px_rgba(255,26,26,0.25)]'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-fmx-red px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_rgba(255,26,26,0.5)] transition-transform duration-200 group-hover:scale-105">
                  ★ Le plus populaire
                </div>
              )}

              <h3 className="mt-1 text-center text-[15px] font-bold uppercase tracking-wide text-white">{plan.name}</h3>
              <div className="mt-2 text-center">
                <span className="text-[40px] font-extrabold leading-none tracking-tight text-white transition-colors duration-200 group-hover:text-fmx-red">
                  {plan.price}€
                </span>
                <span className="ml-1.5 text-[12px] text-fmx-gray">paiement unique</span>
              </div>
              <p className="mt-2 min-h-[36px] text-center text-[12.5px] leading-snug text-fmx-gray">{plan.description}</p>

              <ul className="mb-6 mt-4 grid flex-1 gap-2.5 border-t border-white/[0.06] pt-4">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-[13px] leading-snug text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-fmx-red" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={e => {
                  e.stopPropagation()
                  onSelect(plan.id as PackId)
                  onOrder(plan.id as PackId)
                }}
                className={cn(
                  'min-h-[48px] w-full rounded-full py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]',
                  isSelected || isPopular
                    ? 'bg-fmx-red text-white shadow-[0_10px_28px_rgba(255,26,26,0.4)] hover:shadow-[0_0_32px_rgba(255,26,26,0.6)] hover:brightness-110'
                    : 'border border-white/15 bg-white/[0.06] text-white hover:border-fmx-red/50 hover:bg-fmx-red/10 hover:shadow-[0_0_24px_rgba(255,26,26,0.25)]'
                )}
              >
                {isSelected ? 'Sélectionné ✓ — Commander →' : `Commander — ${plan.price}€ →`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bandeau commande rapide */}
      <div className="mx-auto mt-8 max-w-[1080px]">
        <button
          onClick={() => onOrder(selectedPlan ?? 'COMPLET')}
          className="flex min-h-[56px] w-full flex-wrap items-center justify-center gap-2 rounded-2xl bg-fmx-red px-6 py-4 text-center text-[15px] font-extrabold text-white shadow-[0_12px_36px_rgba(255,26,26,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,26,26,0.6)] hover:brightness-110 active:scale-[0.99]"
        >
          <Landmark className="hidden h-5 w-5 sm:block" />
          {selectedPlan
            ? `Commander le ${PACKAGES.find(p => p.id === selectedPlan)?.name} — ${PACKAGES.find(p => p.id === selectedPlan)?.price}€ →`
            : 'Commander le Pack Complet — 25€ →'}
        </button>
        <p className="mt-2.5 text-center text-[12px] text-fmx-gray">
          <b className="text-white">PayPal • Virement SEPA</b> — les coordonnées exactes s&apos;affichent à l&apos;étape paiement.
        </p>
      </div>

      {/* Extras */}
      <div className="mx-auto mt-10 max-w-[1080px]">
        <h3 className="text-center text-[15px] font-bold uppercase tracking-[0.16em] text-fmx-gray">
          Options & add-ons
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map(x => (
            <div key={x.name} className="fmx-window rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-fmx-red/30">
              <div className="flex items-center justify-between gap-2">
                <b className="text-[13px] text-white">{x.name}</b>
                <span className="rounded-full bg-fmx-red/15 px-2.5 py-1 text-[11px] font-extrabold text-fmx-red">{x.price}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-fmx-gray">{x.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Reglement />
    </section>
  )
}
