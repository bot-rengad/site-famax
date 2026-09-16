'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { ADDONS } from '@/types'

export type PlanId = 'BASIC' | 'COMPLET' | 'ULTIME'

interface PricingProps {
  selectedPlan: PlanId | null
  onSelect: (plan: PlanId) => void
  onOrder: (plan?: PlanId | null) => void
}

// Tarifs réels FaMaxOpti — sans promesse chiffrée, sans détail de la méthode
const plans = [
  {
    id: 'BASIC' as PlanId,
    name: 'Pack Basic',
    price: '20€',
    desc: "L'optimisation Windows complète pour la compétition.",
    features: [
      'Épuration intégrale + processus inutiles supprimés',
      'Pilote GPU allégé + config compétitive NVIDIA / AMD',
      "Alimentation sur-mesure, fréquences au maximum",
      'Input lag au minimum, timer système réduit',
      'Priorité absolue à votre jeu (CPU + GPU)',
    ],
    popular: false,
    cta: 'Sélectionner',
  },
  {
    id: 'COMPLET' as PlanId,
    name: 'Pack Complet',
    price: '25€',
    desc: 'Basic + paramétrage direct de la carte mère.',
    features: [
      "Tout le Pack Basic",
      'Profil haute vitesse de la RAM',
      'Débridage de la liaison carte graphique / processeur',
      "Coupure des économies d'énergie",
      'GPU intégré désactivé, cœurs dédiés réseau/affichage',
    ],
    popular: true,
    cta: 'Sélectionner →',
  },
  {
    id: 'ULTIME' as PlanId,
    name: 'Pack Ultime',
    price: '50€',
    desc: "La prise en charge intégrale, sans compromis.",
    features: [
      'Tout le Pack Complet (Basic + BIOS)',
      'Réinstallation propre de Windows',
      'Undervolt & Overclocking CPU + GPU',
      'Calibrage périphériques + config streaming',
      'Suivi et assistance technique à vie',
    ],
    popular: false,
    cta: 'Sélectionner',
  },
]

const extras = ADDONS.map(a => ({ name: a.name, price: `+${a.price}€`, desc: a.desc })).concat([
  { name: 'Dépannage', price: '5–15€', desc: 'Diagnostic complet puis tarif exact selon gravité (via ticket).' },
])

const PLAN_LABEL: Record<PlanId, string> = {
  BASIC: 'Pack Basic — 20€',
  COMPLET: 'Pack Complet — 25€',
  ULTIME: 'Pack Ultime — 50€',
}

export function Pricing({ selectedPlan, onSelect, onOrder }: PricingProps) {
  return (
    <section id="plans" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Tarifs & prestations
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Paiement unique, effet durable. Diagnostic UserDiag et avis du staff avant
          chaque intervention.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id
          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${plan.name} — ${plan.price}`}
              onClick={() => onSelect(plan.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(plan.id)
                }
              }}
              className={cn(
                'fmx-window fmx-window-hover relative flex cursor-pointer flex-col rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmx-red sm:p-7',
                isSelected && 'border-fmx-red shadow-[0_0_40px_rgba(255,26,26,0.15)]',
                plan.id === 'ULTIME' && 'sm:col-span-2 lg:col-span-1'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-fmx-red px-3.5 py-1 text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-white shadow-[0_8px_24px_rgba(255,26,26,0.4)]">
                  ★ Le plus choisi
                </div>
              )}

              <h3 className="text-center text-[15px] font-bold text-white">{plan.name}</h3>
              <div className="mt-2 text-center text-[38px] font-extrabold tracking-tight text-white">
                {plan.price}
              </div>
              <p className="mt-1 text-center text-[13px] text-fmx-gray">{plan.desc}</p>

              <ul className="mb-6 mt-5 grid flex-1 gap-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-[13px] text-gray-300">
                    <Check className="h-4 w-4 shrink-0 text-fmx-red" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={e => {
                  e.stopPropagation()
                  onSelect(plan.id)
                  onOrder(plan.id)
                }}
                className={cn(
                  'w-full rounded-full py-3.5 text-sm font-bold transition-all duration-150 hover:-translate-y-px',
                  isSelected
                    ? 'bg-fmx-red text-white shadow-[0_10px_28px_rgba(255,26,26,0.35)] hover:shadow-[0_0_28px_rgba(255,26,26,0.55)]'
                    : plan.popular
                      ? 'bg-fmx-red text-white shadow-[0_10px_28px_rgba(255,26,26,0.35)] hover:shadow-[0_0_28px_rgba(255,26,26,0.55)]'
                      : 'border border-white/15 bg-white/[0.06] text-white hover:border-fmx-red/40 hover:bg-white/[0.12] hover:shadow-[0_0_20px_rgba(255,26,26,0.2)]'
                )}
              >
                {isSelected ? 'Sélectionné ✓' : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Extras */}
      <div className="mx-auto mt-10 max-w-[1080px]">
        <h3 className="text-center text-[15px] font-bold uppercase tracking-[0.16em] text-fmx-gray">
          Options & add-ons
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map(x => (
            <div key={x.name} className="fmx-window rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <b className="text-[13px] text-white">{x.name}</b>
                <span className="rounded-full bg-fmx-red/15 px-2.5 py-1 text-[11px] font-extrabold text-fmx-red">{x.price}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-fmx-gray">{x.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sélection + conditions réelles */}
      <div className="fmx-window mx-auto mt-8 max-w-[1080px] rounded-2xl p-5 text-center">
        {selectedPlan ? (
          <p className="text-[13px] text-white">
            Plan sélectionné : <b className="text-fmx-red">{PLAN_LABEL[selectedPlan]}</b>
          </p>
        ) : (
          <p className="text-[13px] text-fmx-gray">
            <b className="text-white">Aucun plan sélectionné.</b> Clique sur une carte pour sélectionner.
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onOrder(selectedPlan ?? 'COMPLET')}
            className="min-h-[44px] rounded-full bg-fmx-red px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,26,26,0.35)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_0_28px_rgba(255,26,26,0.55)]"
          >
            Commander{selectedPlan ? ` — ${PLAN_LABEL[selectedPlan]}` : ' — Pack Complet'} →
          </button>
        </div>
        <p className="mx-auto mt-4 max-w-[720px] text-[12px] leading-relaxed text-fmx-gray">
          <b className="text-white">PayPal • Virement SEPA</b> — les coordonnées exactes s’affichent
          après ta commande, à l’étape paiement.
          <br />
          Paiement validé = travail réservé : aucun remboursement une fois l’intervention commencée.
          Si aucune différence mesurable n’est constatée après l’intervention, le staff réévalue
          la situation au cas par cas (optimisation complémentaire ou geste commercial).
          Suivi 30 jours inclus (à vie pour le Pack Ultime ou l’option suivi à vie). Le support
          peut s’arrêter si tu réinitialises ton PC sans prévenir le staff sur Discord.
        </p>
      </div>
    </section>
  )
}
