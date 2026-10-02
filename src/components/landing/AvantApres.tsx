import Link from 'next/link'
import { Activity, Gauge, Thermometer } from 'lucide-react'

// Comparatif Avant / Après — chiffres illustratifs (chaque setup réagit
// différemment), barres animées en pur CSS, zéro JS.
const METRICS = [
  {
    icon: Gauge,
    label: 'FPS moyens — Fortnite 1080p',
    before: '~120 FPS',
    after: '~220 FPS',
    beforeW: '42%',
    afterW: '84%',
    note: 'Exemple',
  },
  {
    icon: Activity,
    label: 'Latence système (clic → écran)',
    before: '~12,4 ms',
    after: '~6,1 ms',
    beforeW: '78%',
    afterW: '38%',
    note: 'Exemple',
  },
  {
    icon: Thermometer,
    label: 'Température GPU en jeu',
    before: '~78 °C',
    after: '~66 °C',
    beforeW: '82%',
    afterW: '58%',
    note: 'Exemple',
  },
]

export function AvantApres() {
  return (
    <section id="avant-apres" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <style>{`@keyframes fmx-bar-grow { from { width: 6%; } to { width: var(--w); } }`}</style>
      <div className="mx-auto max-w-[720px] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fmx-red/30 bg-fmx-red/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-fmx-red">
          Résultats mesurés en jeu
        </div>
        <h2 className="mt-4 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Avant / Après l&apos;opti
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Ce que change une intervention sur un setup type : plus de FPS, moins de latence,
          des températures maîtrisées.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-5 lg:grid-cols-3">
        {METRICS.map(m => (
          <div
            key={m.label}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-fmx-red/40 hover:shadow-[0_20px_50px_rgba(255,26,26,0.15)] sm:p-6"
          >
            <div className="flex items-center gap-2.5">
              <m.icon className="h-5 w-5 shrink-0 text-fmx-red" />
              <h3 className="text-[14px] font-bold text-white">{m.label}</h3>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
                  <span className="font-semibold uppercase tracking-wider text-fmx-gray">Avant</span>
                  <b className="text-[15px] text-fmx-gray">{m.before}</b>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-zinc-500"
                    style={{ ['--w' as string]: m.beforeW, width: m.beforeW, animation: 'fmx-bar-grow 1.2s ease-out' }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
                  <span className="font-extrabold uppercase tracking-wider text-fmx-red">Après</span>
                  <b className="text-[17px] text-white">{m.after}</b>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-fmx-red/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fmx-red to-fmx-red-dark shadow-[0_0_16px_rgba(255,26,26,0.6)] transition-transform duration-200 group-hover:brightness-125"
                    style={{ ['--w' as string]: m.afterW, width: m.afterW, animation: 'fmx-bar-grow 1.2s ease-out' }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-zinc-600">{m.note}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-[720px] text-center text-[12px] leading-relaxed text-zinc-600">
        Chiffres illustratifs — chaque setup réagit différemment, aucun gain garanti.
        Le staff te dit honnêtement ce que ton PC peut gagner avant que tu paies.
      </p>

      <div className="mt-6 text-center">
        <Link
          href="/dashboard/order?pack=COMPLET"
          className="inline-flex min-h-[52px] items-center rounded-full bg-fmx-red px-8 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_36px_rgba(255,26,26,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,26,26,0.6)] hover:brightness-110 active:scale-[0.99]"
        >
          Optimiser mon setup — 25€ →
        </Link>
      </div>
    </section>
  )
}
