'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

// Footer FMX — minimaliste, centré, rouge/noir
export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#060608]">
      <div className="mx-auto max-w-[1280px] px-5 py-10 text-center lg:px-10">
        <div className="flex justify-center">
          <Logo size={26} />
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-fmx-gray">
          Optimisation • FPS • Premium
        </p>

        <nav aria-label="Navigation pied de page" className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-fmx-gray">
          <a href="/#plans" className="transition-colors hover:text-white">Plans</a>
          <a href="/#config" className="transition-colors hover:text-white">Estimateur FPS</a>
          <a href="/#payments" className="transition-colors hover:text-white">Paiement</a>
          <a href="/#deroulement" className="transition-colors hover:text-white">Déroulé</a>
          <Link href="/dashboard" className="transition-colors hover:text-white">Espace client</Link>
          <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">
            Discord
          </a>
        </nav>

        <div className="mx-auto mt-6 max-w-[560px] text-[12px] leading-relaxed text-fmx-gray">
          FMX n&apos;est affilié à aucune marque. Optimisations manuelles réalisées à distance.
          <br />
          Contact : <span className="text-white">contact@fmx-optimized.fr</span> •{' '}
          <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">
            discord.gg/fmx
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-zinc-600">
          <Link href="/auth/login" className="hover:text-white">Espace client</Link>
          <Link href="/conditions-generales" className="hover:text-white">CGV</Link>
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
        </div>

        <div className="mt-6 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
          © 2026 FMX — Optimisation • FPS • Premium. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
