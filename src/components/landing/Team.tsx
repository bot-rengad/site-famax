import { MonitorSmartphone, ShieldCheck, Wrench } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

// L'équipe FMX — des humains derrière l'écran, pour rassurer avant d'acheter.
// Zéro JS : cartes statiques, survol 100% CSS.
const MEMBERS = [
  {
    icon: Wrench,
    name: 'Alox',
    role: 'Technicien optimisation',
    text: 'Épuration système, pilotes GPU, tweaks registre : la base Windows poussée au max.',
  },
  {
    icon: MonitorSmartphone,
    name: 'Synoz',
    role: 'Technicien optimisation',
    text: 'BIOS, RAM haute vitesse, liaisons CPU / GPU : le niveau matériel, en direct avec toi.',
  },
  {
    icon: ShieldCheck,
    name: 'Poticat',
    role: 'Fondateur — contrôle qualité',
    text: 'Protocole strict, point de restauration systématique, validation de chaque intervention.',
  },
]

export function Team() {
  return (
    <section id="equipe" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-fmx-gray">
          Des humains, pas un logiciel
        </div>
        <h2 className="mt-4 font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          L&apos;équipe derrière ton opti
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Trois passionnés d&apos;esport. Toute l&apos;équipe intervient en direct, devant ton écran.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-5 sm:grid-cols-3">
        {MEMBERS.map((m, i) => (
          <Reveal key={m.name} delay={i * 90} className="h-full">
          <div
            className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center transition-all duration-200 hover:-translate-y-1.5 hover:border-fmx-red/50 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(255,26,26,0.18)]"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fmx-red to-fmx-red-dark shadow-[0_10px_28px_rgba(255,26,26,0.35)] transition-transform duration-200 group-hover:scale-105">
              <m.icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-[16px] font-extrabold text-white">{m.name}</h3>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-fmx-red">{m.role}</p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-fmx-gray">{m.text}</p>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
