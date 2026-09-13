import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: "Mentions légales du site FMX Optimisation : éditeur, hébergement, contact et propriété intellectuelle.",
}

export default function MentionsLegales() {
  return (
    <div className="mx-auto max-w-[860px] px-5 py-28 lg:px-10 lg:pt-36">
      <Breadcrumb current="Mentions Légales" />
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
        Mentions Légales
      </h1>
      <div className="mt-8 grid gap-6 text-[14px] leading-relaxed text-fmx-gray">
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">Éditeur du site</h2>
          <p>
            FMX Optimisation — service d’optimisation PC en ligne.
            <br />
            Contact : serveur Discord <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">discord.gg/fmx</a> (réponse du staff).
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">Hébergement</h2>
          <p>Vercel Inc., 340 S Lemon Ave, Walnut, CA, USA — vercel.com.</p>
        </section>
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">Propriété intellectuelle</h2>
          <p>
            L’ensemble du site (textes, visuels, logo FMX) est protégé. Toute reproduction
            sans autorisation est interdite. FMX n’est affilié à aucune marque (Microsoft,
            NVIDIA, AMD, Epic Games).
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">Données personnelles</h2>
          <p>
            Voir la <Link href="/confidentialite" className="text-fmx-red hover:underline">politique de confidentialité</Link>.
            Pour toute demande : serveur Discord <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">discord.gg/fmx</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
