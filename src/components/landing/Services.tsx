'use client'

import { ClipboardCheck, SearchCheck, CreditCard, MonitorCog, Gamepad2, Star } from 'lucide-react'

// Déroulé réel FaMaxOpti — volontairement sans détail de la méthode
const steps = [
  {
    icon: ClipboardCheck,
    step: 'Étape 1',
    title: 'Diagnostic (5 min)',
    desc: "Tu exécutes l'outil UserDiag sur ton PC : CPU, GPU, VRAM, RAM, stockage, températures, drivers. Le rapport sert de base à tout.",
    link: { label: 'Télécharger UserDiag →', href: 'https://userdiag.com/download' },
  },
  {
    icon: SearchCheck,
    step: 'Étape 2',
    title: 'Analyse & avis honnête',
    desc: "L'équipe analyse ton rapport et te dit franchement ce qui bride ton PC, les gains attendus et si une opti vaut le coup pour ta config. Jamais de chiffres garantis.",
  },
  {
    icon: CreditCard,
    step: 'Étape 3',
    title: 'Paiement',
    desc: "Si tu valides l'avis, tu règles par PayPal ou virement avec ton pseudo Discord en note. L'optimisation ne démarre qu'après paiement confirmé.",
  },
  {
    icon: MonitorCog,
    step: 'Étape 4',
    title: 'Optimisation (15 min)',
    desc: "Intervention à distance, protocole strict dans un ordre précis : sauvegarde, épuration système, réglages GPU / réseau / jeu, redémarrage de validation. Tu restes devant ton PC.",
  },
  {
    icon: Gamepad2,
    step: 'Étape 5',
    title: 'Test en jeu',
    desc: "Une fois terminé, c'est toi qui testes en jeu et qui donnes ton ressenti sur les FPS et la fluidité.",
  },
  {
    icon: Star,
    step: 'Étape 6',
    title: 'Review',
    desc: "Si tu es satisfait, tu laisses un avis via le bot de review du serveur. C'est ce qui fait tourner la boutique.",
  },
]

export function Services() {
  return (
    <section id="deroulement" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Comment ça se passe
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          100% à distance, en vocal ou par écrit. Chaque étape est validée avec toi —
          rien ne démarre sans ton accord.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(s => (
          <div key={s.title} className="fmx-window fmx-window-hover rounded-2xl p-6">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.06]">
              <s.icon className="h-5 w-5 text-fmx-red" aria-hidden="true" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-fmx-red">{s.step}</div>
            <h3 className="mt-1 text-base font-bold text-white">{s.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fmx-gray">{s.desc}</p>
            {s.link && (
              <a
                href={s.link.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-[12px] font-bold text-fmx-red hover:underline"
              >
                {s.link.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
