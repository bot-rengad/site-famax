'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { truncate } from '@/lib/utils/helpers'
import type { PublicReview } from '@/app/api/reviews/route'

// Avis réels du salon Discord, affichés automatiquement via /api/reviews
// (bot + cache 1h). Repli statique si le salon est vide ou injoignable.
export function Testimonials() {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null)

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setReviews(Array.isArray(data?.reviews) ? data.reviews : []))
      .catch(() => setReviews([]))
  }, [])

  return (
    <section id="avis" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Ils ont testé <em className="not-italic text-fmx-red">FMX</em>
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Avis laissés directement sur le Discord, affichés ici en automatique.
          Pas de faux témoignages : tout est vérifiable sur le serveur.
        </p>
      </div>

      {reviews === null ? (
        <div className="mx-auto mt-8 grid max-w-[860px] gap-3 sm:grid-cols-2">
          {[0, 1].map(i => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="mx-auto mt-8 grid max-w-[1080px] gap-3 sm:grid-cols-2">
            {reviews.slice(0, 6).map(r => (
              <article
                key={r.id}
                className="fmx-window fmx-window-hover group rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-fmx-red/30 hover:shadow-[0_0_28px_rgba(255,26,26,0.15)]"
              >
                <div className="flex gap-0.5" aria-label={`${r.stars} étoiles sur 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-fmx-white-dim">
                  « {truncate(r.content, 280)} »
                </p>
                <div className="mt-3 flex items-center gap-2.5 border-t border-white/[0.06] pt-3">
                  {r.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-fmx-red text-[12px] font-extrabold text-white">
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-white">{r.author}</p>
                    <p className="truncate text-[11px] text-fmx-gray">
                      {r.config ? `${r.config} • ` : ''}via Discord • {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://discord.gg/fmx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-[#4752C4] hover:shadow-[0_0_24px_rgba(88,101,242,0.5)]"
            >
              <MessageCircle className="h-4 w-4" />
              Lire tous les avis sur Discord
            </a>
          </div>
        </>
      ) : (
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-[#4752C4]"
          >
            <MessageCircle className="h-4 w-4" />
            Lire les avis
          </a>
        </div>
      )}
    </section>
  )
}
