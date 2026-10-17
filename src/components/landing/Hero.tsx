'use client'

import { Timer, Headset, Wallet } from 'lucide-react'

// Hero style FMX — badge / gros titre / sous-titre / 2 CTA / 3 infos / trusted row
export function Hero({ onOrder }: { onOrder?: () => void }) {
  return (
    <header className="relative mx-auto max-w-[1280px] px-5 pb-14 pt-24 text-center lg:px-10 lg:pt-40">
      <div className="relative z-10 mx-auto max-w-[820px]">
        {/* Badge top */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fmx-gray">
          <span className="h-1.5 w-1.5 rounded-full bg-fmx-red shadow-[0_0_10px_#FF1A1A]" />
          Optimisation • FPS • Premium
        </div>

        {/* Titre façon Shinami : "Your game. Your way, unlocked." -> FaMax */}
        {/* Titre façon Shinami — Space Grotesk (le Syne écrase le "j" en "i") */}
        <h1 className="mt-6 font-sans text-[clamp(38px,7vw,72px)] font-bold leading-[1.02] tracking-tight text-white">
          Ton jeu.
          <br />
          Ton PC, <span className="text-fmx-red">débloqué.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-[620px] text-balance text-[15px] leading-relaxed text-fmx-gray">
          Un vrai technicien optimise ton setup <b className="text-white">en direct</b>, avec des réglages
          pensés pour tes composants — pas un script automatique. Sans risque,
          paiement unique, suivi inclus.
        </p>

        {/* 2 CTA */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/#plans"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-fmx-red px-8 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_36px_rgba(255,26,26,0.45)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,26,26,0.6)] hover:brightness-110 active:scale-[0.99]"
          >
            Booster mon PC — dès 15€ →
          </a>
          <button
            onClick={onOrder}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/[0.1] bg-[#17171b] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-fmx-red/40 hover:bg-[#202027] hover:shadow-[0_0_24px_rgba(255,26,26,0.25)]"
          >
            <Wallet className="h-4 w-4" />
            Commander une opti
          </button>
        </div>
        <a href="/#avis" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fmx-gray transition-colors hover:text-white">
          <span className="tracking-tight text-fmx-red">★★★★★</span> Avis clients vérifiés sur Discord →
        </a>

        {/* 3 infos */}
        <div className="mx-auto mt-10 grid max-w-[680px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Timer, label: 'Intervention', value: 'À distance ~15 min' },
            { icon: Headset, label: 'Support', value: 'Discord réactif' },
            { icon: Wallet, label: 'Paiement', value: 'PayPal • Virement' },
          ].map(item => (
            <div
              key={item.label}
              className="fmx-window flex items-center justify-center gap-3 rounded-2xl px-4 py-3.5"
            >
              <item.icon className="h-5 w-5 shrink-0 text-fmx-red" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-[0.14em] text-fmx-gray">{item.label}</div>
                <div className="text-[13px] font-bold text-white">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
