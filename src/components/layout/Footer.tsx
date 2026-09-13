'use client'

import Link from 'next/link'
import { MessageCircle, Wallet, Landmark } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

// Footer FMX — navigation utile, paiement, contact Discord (pas d'email inventé), légal.
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
          <a href="/#plans" className="relative transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.5)]">Plans</a>
          <Link href="/estimateur" className="relative transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.5)]">Estimateur FPS</Link>
          <a href="/#deroulement" className="relative transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.5)]">Déroulé</a>
          <a href="/#avis" className="relative transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.5)]">Avis clients</a>
          <a href="/#faq" className="relative transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.5)]">FAQ</a>
          <Link href="/dashboard/order" className="font-bold text-fmx-red transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.6)]">Commander →</Link>
        </nav>

        <div className="mx-auto mt-6 flex max-w-[560px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-fmx-gray">
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-blue-400" /> PayPal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-green-400" /> Virement SEPA
          </span>
          <span>Paiement unique, sans abonnement</span>
        </div>

        <div className="mx-auto mt-4 max-w-[560px] text-[12px] leading-relaxed text-fmx-gray">
          FMX n&apos;est affilié à aucune marque. Optimisations manuelles réalisées à distance.
          <br />
          Une question ? Le staff répond sur{' '}
          <a
            href="https://discord.gg/fmx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-fmx-red hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            discord.gg/fmx
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-zinc-600">
          <Link href="/auth/login" className="transition-colors hover:text-white">Espace client</Link>
          <Link href="/test-ecran" className="transition-colors hover:text-white">Test écran</Link>
          <Link href="/conditions-generales" className="transition-colors hover:text-white">CGV</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
        </div>

        <div className="mt-6 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
          © 2026 FMX — Optimisation • FPS • Premium. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
