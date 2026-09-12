import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "Cette page n'existe pas ou a été déplacée. Retourne à l'accueil FMX Optimisation.",
}

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-[640px] place-items-center px-5 py-32 text-center lg:pt-40">
      <div className="font-display text-[clamp(64px,15vw,140px)] font-extrabold leading-none text-white">
        4<span className="text-fmx-red">0</span>4
      </div>
      <h1 className="mt-4 text-xl font-bold text-white">Cette page a planté plus fort que ton PC avant opti.</h1>
      <p className="mt-2 text-[14px] text-fmx-gray">
        Le lien est peut-être faux ou la page a été déplacée.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-fmx-red px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(255,26,26,0.35)]"
        >
          Retour à l’accueil →
        </Link>
        <Link
          href="/#plans"
          className="rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.12]"
        >
          Voir les tarifs
        </Link>
        <Link
          href="/#faq"
          className="rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.12]"
        >
          FAQ
        </Link>
      </div>
    </div>
  )
}
