'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollTools } from '@/components/layout/ScrollTools'
import { ShinamiBackground } from '@/components/landing/ShinamiBackground'
import { Hero } from '@/components/landing/Hero'
import { Services } from '@/components/landing/Services'
import { Pricing, type PlanId } from '@/components/landing/Pricing'
import { StickyCta } from '@/components/landing/StickyCta'

// Below-fold / flottants chargés en différé : ils ne bloquent pas le premier
// paint (LCP). Le chat et les avis n'ont pas besoin d'être dans le bundle initial.
const Faq = dynamic(() => import('@/components/landing/Faq').then(m => m.Faq), { ssr: false })
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(m => m.Testimonials), { ssr: false })
const Chatbot = dynamic(() => import('@/components/ui/Chatbot').then(m => m.Chatbot), { ssr: false })
const CookieBanner = dynamic(() => import('@/components/ui/CookieBanner').then(m => m.CookieBanner), { ssr: false })

// Données structurées : service 100% en ligne, aucune adresse inventée.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'FMX Optimisation',
  description:
    "Optimisation PC gaming à distance : diagnostic UserDiag, avis honnête, intervention 15 minutes, suivi 30 jours.",
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://famaxopti.vercel.app',
  image: '/images/logo.png',
  priceRange: '20€ - 50€',
  telephone: undefined,
  address: undefined,
  sameAs: ['https://discord.gg/fmx'],
}

export default function HomePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

  // Tous les boutons Commander mènent à la page commande du dashboard
  // (pack → options → paiement → suivi + chat). Le pack sélectionné est
  // transmis en query pour ne pas le perdre. Pas de compte ? login Discord sur place.
  const handleOrder = (plan?: PlanId | null) => {
    const pack = plan ?? selectedPlan
    router.push(pack ? `/dashboard/order?pack=${pack}` : '/dashboard/order')
  }

  return (
    <div className="relative min-h-screen bg-fmx-black pb-24 text-fmx-white md:pb-0">
      {/* Fond FMX : halos + grille + boules floues + grain + halo curseur */}
      <ShinamiBackground />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <ScrollTools />
      <Header />

      {/* Structure : Hero / Plans / Détails / Avis — estimateur et test écran sur leurs pages */}
      <main id="main-content" className="relative z-10 pt-16 lg:pt-[72px]">
        <Hero onOrder={handleOrder} />
        <Pricing
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
          onOrder={handleOrder}
        />
        <Services />
        <Faq />
        <Testimonials />
      </main>

      <Footer />

      {/* CTA sticky mobile */}
      <StickyCta />

      {/* Chatbot FMX flottant */}
      <Chatbot />

      {/* Consentement cookies */}
      <CookieBanner />
    </div>
  )
}
