'use client'

import { ShieldCheck, Timer, Headset, Wallet, CreditCard, Zap, Cpu } from 'lucide-react'

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
            className="inline-flex items-center gap-2 rounded-full bg-fmx-red px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(255,26,26,0.35)] transition-transform hover:-translate-y-0.5"
          >
            Voir les plans →
          </a>
          <button
            onClick={onOrder}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#17171b] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-fmx-red/40 hover:bg-[#202027] hover:shadow-[0_0_24px_rgba(255,26,26,0.25)]"
          >
            <Wallet className="h-4 w-4" />
            Commander une opti
          </button>
        </div>

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

        {/* Pourquoi FMX — vrais arguments face à la concurrence */}
        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-fmx-gray">
            Pourquoi passer par <span className="text-white">FMX</span>
          </div>
          <div className="mx-auto mt-4 grid max-w-[720px] gap-2 text-left sm:grid-cols-2">
            {[
              { icon: Zap, color: 'text-fmx-red', title: 'Adieu les micro-freezes', desc: "Optimisation ciblée sur les drops de FPS et les temps de réponse de ton système." },
              { icon: Cpu, color: 'text-fmx-red', title: '100% sur-mesure pour ton setup', desc: "On adapte chaque tweak à tes composants précis, pas de réglage générique copié-collé." },
              { icon: ShieldCheck, color: 'text-green-500', title: 'Sécurisé & Réversible', desc: "Point de restauration créé au préalable. Zéro risque de casser ton Windows." },
              { icon: CreditCard, color: 'text-green-500', title: 'Aucun abonnement caché', desc: "Tu paies une seule fois, les performances restent. Suivi inclus après la prestation." },
            ].map(arg => (
              <div key={arg.title} className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <arg.icon className={`mt-0.5 h-4 w-4 shrink-0 ${arg.color}`} />
                <div>
                  <div className="text-[13px] font-bold text-white">{arg.title}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-fmx-gray">{arg.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
