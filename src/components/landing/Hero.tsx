'use client'

import { Zap, ShieldCheck, Truck, Headset, Wallet } from 'lucide-react'

// Hero style FMX — badge / gros titre / sous-titre / 2 CTA / 3 infos / trusted row
export function Hero({ onOrder }: { onOrder?: () => void }) {
  return (
    <header className="relative mx-auto max-w-[1280px] px-5 pb-14 pt-32 text-center lg:px-10 lg:pt-40">
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

        <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-relaxed text-fmx-gray">
          Portail d&apos;optimisation premium — analyse de ton UserDiag et avis du staff avant de payer,
          intervention à distance en 30–45 min. <b className="text-white">Aucun chiffre garanti</b>,
          aucun abonnement, zéro attente.
        </p>

        {/* 2 CTA */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#plans"
            className="inline-flex items-center gap-2 rounded-full bg-fmx-red px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(255,26,26,0.35)] transition-transform hover:-translate-y-0.5"
          >
            Voir les plans →
          </a>
          <button
            onClick={onOrder}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#17171b] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#202027]"
          >
            <Wallet className="h-4 w-4" />
            Commander une opti
          </button>
        </div>

        {/* 3 infos */}
        <div className="mx-auto mt-10 grid max-w-[680px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, label: 'Intervention', value: '45 min à distance' },
            { icon: Headset, label: 'Support', value: 'Discord 24/7' },
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

        {/* Trusted row — preuves réelles, sans chiffres inventés */}
        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-fmx-gray">
            Pourquoi passer par <span className="text-white">FMX</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-fmx-gray">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-fmx-red" /> Analyse UserDiag + avis staff
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Avis honnête, zéro promesse
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Suivi 30 jours inclus
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> 100% à distance, en direct
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
