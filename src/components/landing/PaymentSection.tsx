'use client'

import { useState } from 'react'
import { Copy, Check, Wallet, Landmark, Zap, ShieldCheck, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { DISCORD_INVITE, PAYPAL_LINK, PAYPAL_NAME, IBAN_RAW, IBAN_DISPLAY, TITULAIRE } from '@/lib/payment-info'
import type { PlanId } from './Pricing'

interface PaymentSectionProps {
  selectedPlan: PlanId | null
  onOrder: (plan?: PlanId | null) => void
}

type Tab = 'paypal' | 'rib'

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          try {
            const ta = document.createElement('textarea')
            ta.value = text
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            ta.remove()
          } catch {}
        }
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
      aria-live="polite"
      className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/[0.12]"
    >
      {done ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? 'Copié !' : 'Copier'}
    </button>
  )
}

export function PaymentSection({ selectedPlan, onOrder }: PaymentSectionProps) {
  const [tab, setTab] = useState<Tab>('paypal')
  const amount = selectedPlan === 'ULTIME' ? '50€' : selectedPlan === 'COMPLET' ? '25€' : selectedPlan === 'BASIC' ? '20€' : '—'
  const planLabel = selectedPlan === 'ULTIME' ? 'Pack Ultime — 50€' : selectedPlan === 'COMPLET' ? 'Pack Complet — 25€' : selectedPlan === 'BASIC' ? 'Pack Basic — 20€' : null

  const tabs = [
    { id: 'paypal' as Tab, label: 'PayPal', icon: Wallet },
    { id: 'rib' as Tab, label: 'Virement RIB', icon: Landmark },
  ]

  return (
    <section id="payments" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Paiement
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          PayPal ou virement — paie avec ton pseudo Discord en note, envoie ta preuve
          dans ton ticket et reçois ton suivi.
        </p>
      </div>

      {/* Étape 1 — Vérif Discord */}
      <div className="fmx-window mx-auto mt-8 flex max-w-[860px] flex-col items-center gap-4 rounded-2xl p-6 text-center sm:flex-row sm:text-left">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5865F2]/15">
          <ShieldCheck className="h-6 w-6 text-[#8b9bff]" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b9bff]">Étape 1 — Vérification obligatoire</div>
          <div className="mt-1 text-[15px] font-bold text-white">Vérifie ton Discord avant de payer</div>
          <p className="mt-1 text-[13px] text-fmx-gray">
            Ton suivi sera lié à ce compte, et la note du paiement doit contenir ton{' '}
            <b className="text-white">utilisateur Discord</b>.
          </p>
        </div>
        <a
          href={selectedPlan ? `/api/auth/discord?redirect=${encodeURIComponent(`/dashboard/order?pack=${selectedPlan}`)}` : '/api/auth/discord?redirect=/dashboard/order'}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px hover:bg-[#4752C4]"
        >
          Vérifier avec Discord →
        </a>
      </div>

      {/* Onglets */}
      <div className="fmx-window mx-auto mt-6 flex max-w-[420px] gap-2 rounded-full p-1.5" role="tablist" aria-label="Moyen de paiement">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-all',
              tab === t.id ? 'bg-fmx-red text-white shadow-[0_8px_24px_rgba(255,26,26,0.35)]' : 'text-fmx-gray hover:text-white'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="fmx-window fmx-window-hover mx-auto mt-6 max-w-[860px] rounded-2xl p-6 lg:p-8">
        {tab === 'paypal' && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
              <div className="text-[14px] font-bold text-white">PayPal — Envoi en Amis & Proches obligatoire</div>
              <div className="mt-1 text-[12px] text-fmx-gray">
                Plan sélectionné : <b className="text-white">{planLabel ?? '— sélectionne un plan ci-dessus'}</b>
              </div>
              <div className="mx-auto mt-4 max-w-[420px] rounded-xl bg-[#003087]/20 p-4">
                <div className="text-[11px] uppercase tracking-wider text-blue-300">Envoyer UNIQUEMENT en</div>
                <div className="text-[16px] font-extrabold text-white">AMIS & PROCHES</div>
                <div className="text-[11px] text-fmx-gray">Friends & Family — bien vérifier le mode d’envoi</div>
              </div>
              <code className="mx-auto mt-4 flex max-w-[420px] flex-wrap items-center justify-between gap-3 rounded-lg bg-black/60 px-4 py-3 font-mono text-[13px] text-white">
                <span className="min-w-0 flex-1 break-all">{PAYPAL_NAME}</span>
                <CopyBtn text={PAYPAL_LINK} />
              </code>
              <a
                href={PAYPAL_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-[#0070BA] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px"
              >
                Payer via PayPal →
              </a>
              <p className="mt-3 rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-3 text-[12px] font-bold text-white">
                ⚠ Note du paiement = ton <span className="text-fmx-red">utilisateur Discord</span> exact
                <span className="mt-1 block font-normal text-fmx-gray">Ex : @pseudo.discord — sans ça, impossible de retrouver ton paiement.</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-fmx-gray">
              <b className="text-white">✓ Comment ça marche</b>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Vérifie ton Discord avec le bouton ci-dessus</li>
                <li>Va sur <a href={PAYPAL_LINK} target="_blank" rel="noreferrer" className="text-white underline">{PAYPAL_NAME}</a> → Envoyer → <b className="text-white">Ami & Proche</b></li>
                <li>Montant exact ({amount}) + note = ton <b className="text-white">utilisateur Discord</b></li>
                <li>Ouvre ton ticket sur <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">Discord FMX</a> → envoie la capture du paiement</li>
              </ol>
              <p className="mt-2 text-green-400">⚡ Suivi ouvert sur Discord après vérification de la preuve.</p>
            </div>
          </div>
        )}

        {tab === 'rib' && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <b className="text-white">🇧🇪 Belgique — SEPA Instantané</b>
                <CopyBtn text={`${IBAN_DISPLAY} - ${TITULAIRE}`} />
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
                <div className="flex justify-between border-b border-white/[0.06] pb-2"><span className="text-fmx-gray">Montant</span><b className="text-fmx-red">{amount} {selectedPlan ? '' : '— Sélectionne un plan'}</b></div>
                <div className="flex justify-between"><span className="text-fmx-gray">Motif / Référence</span><span className="font-bold text-white">Ton utilisateur Discord</span></div>
              </div>
              <p className="mt-3 rounded-lg border border-fmx-red/25 bg-fmx-red/[0.07] p-3 text-center text-[12px] font-bold text-white">
                ⚠ Motif du virement = ton <span className="text-fmx-red">utilisateur Discord</span> exact
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-fmx-gray">
              <b className="text-white">✓ Instructions</b>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Vérifie ton Discord avec le bouton ci-dessus</li>
                <li>Virement instantané de <b className="text-white">{amount}</b> vers <b className="text-white">{IBAN_DISPLAY}</b> ({TITULAIRE})</li>
                <li>Motif = <b className="text-white">ton utilisateur Discord</b></li>
                <li>Envoie la capture dans ton ticket sur <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">Discord FMX</a></li>
              </ol>
              <p className="mt-2 text-green-400">Virement instantané = suivi ouvert en quelques minutes après vérification.</p>
            </div>
          </div>
        )}

        {/* Preuve Discord */}
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-[#5865F2]/25 bg-[#5865F2]/[0.07] p-5 text-center">
          <MessageCircle className="h-6 w-6 text-[#8b9bff]" />
          <p className="max-w-[520px] text-[13px] leading-relaxed text-fmx-gray">
            <b className="text-white">Étape finale : envoie ta preuve sur Discord.</b>
            <br />
            Capture du paiement (PayPal ou virement) avec ton utilisateur Discord visible.
            Un membre du staff vérifie puis ouvre ton suivi.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px hover:bg-[#4752C4]"
            >
              Ouvrir le Discord FMX →
            </a>
            <button
              onClick={() => onOrder(selectedPlan ?? 'COMPLET')}
              className="inline-flex items-center gap-2 rounded-full bg-fmx-red px-6 py-3 text-sm font-bold text-white shadow-[0_12px_32px_rgba(255,26,26,0.35)] transition-transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4" />
              Commander une opti — {selectedPlan ? amount : '25€'} →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
