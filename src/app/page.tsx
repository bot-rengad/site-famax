'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ShinamiBackground } from '@/components/landing/ShinamiBackground'
import { Hero } from '@/components/landing/Hero'
import { Services } from '@/components/landing/Services'
import { Configurator } from '@/components/landing/Configurator'
import { Pricing, type PlanId } from '@/components/landing/Pricing'
import { PaymentSection } from '@/components/landing/PaymentSection'
import { Faq } from '@/components/landing/Faq'
import { Testimonials } from '@/components/landing/Testimonials'
import { StickyCta } from '@/components/landing/StickyCta'
import { OrderForm } from '@/components/landing/OrderForm'
import { Chatbot } from '@/components/ui/Chatbot'
import { CookieBanner } from '@/components/ui/CookieBanner'

// Données structurées : service 100% en ligne, aucune adresse inventée.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'FMX Optimisation',
  description:
    "Optimisation PC gaming à distance : diagnostic UserDiag, avis honnête, intervention 30-45 minutes, suivi 30 jours.",
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  image: '/images/logo.png',
  priceRange: '20€ - 50€',
  telephone: undefined,
  address: undefined,
  sameAs: ['https://discord.gg/fmx'],
}

export default function HomePage() {
  const [orderOpen, setOrderOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

  const handleOrder = () => {
    // Si aucun plan choisi, défaut Basic (comme avant)
    if (!selectedPlan) setSelectedPlan('BASIC')
    setOrderOpen(true)
  }

  return (
    <div className="relative min-h-screen bg-fmx-black pb-24 text-fmx-white md:pb-0">
      {/* Fond Shinami : halos + grille + boules floues + grain + halo curseur */}
      <ShinamiBackground />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Header />

      {/* Structure inspirée Shinami Market : Hero / Plans / Estimateur / Paiement / Détails / Avis */}
      <main id="main-content" className="relative z-10 pt-16 lg:pt-[72px]">
        <Hero />
        <Pricing
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
          onOrder={handleOrder}
        />
        <Configurator onOrder={handleOrder} />
        <PaymentSection selectedPlan={selectedPlan} onOrder={handleOrder} />
        <Services />
        <Faq />
        <Testimonials />
      </main>

      <Footer />

      {/* CTA sticky mobile */}
      <StickyCta />

      <OrderForm
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        selectedPackage={selectedPlan ?? 'BASIC'}
      />

      {/* Chatbot FMX flottant */}
      <Chatbot />

      {/* Consentement cookies */}
      <CookieBanner />
    </div>
  )
}
