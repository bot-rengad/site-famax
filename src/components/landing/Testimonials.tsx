'use client'

import { Star, MessageCircle } from 'lucide-react'

// Avis réels : laissés via le bot du serveur, aucun chiffre inventé ici
export function Testimonials() {
  return (
    <section id="avis" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Ils ont testé <em className="not-italic text-fmx-red">FMX</em>
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Chaque client satisfait laisse son avis via le bot de review du serveur,
          avec sa config. Pas de faux témoignages : tout est vérifiable sur Discord.
        </p>
      </div>

      <div className="fmx-window mx-auto mt-8 grid max-w-[860px] items-center gap-6 p-8 text-center md:grid-cols-[auto_1fr_auto] md:text-left">
        <div>
          <div className="flex justify-center gap-1 md:justify-start">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            ))}
          </div>
          <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-fmx-gray">
            Avis via le bot Discord
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-fmx-white-dim">
          « Diagnostic honnête avant de payer, intervention en direct et suivi derrière.
          Ouvre un ticket avec ton rapport UserDiag et juge par toi-même. »
        </p>
        <a
          href="https://discord.gg/fmx"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px hover:bg-[#4752C4]"
        >
          <MessageCircle className="h-4 w-4" />
          Lire les avis
        </a>
      </div>
    </section>
  )
}
