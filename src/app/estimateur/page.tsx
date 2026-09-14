'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Configurator } from '@/components/landing/Configurator'
import type { PlanId } from '@/components/landing/Pricing'

// Estimateur FPS sur sa propre page (comme le test écran) :
// même moteur, sans alourdir le scroll de l'accueil.
export default function EstimateurPage() {
  const router = useRouter()

  const handleOrder = (plan?: PlanId | null) => {
    router.push(plan ? `/dashboard/order?pack=${plan}` : '/dashboard/order')
  }

  return (
    <div className="flex min-h-screen flex-col bg-fmx-black text-fmx-white">
      <div className="mx-auto w-full max-w-[1280px] shrink-0 px-5 pb-24 pt-3 sm:pb-6 lg:px-10">
        <Link href="/" className="text-[13px] font-medium text-fmx-gray transition-colors hover:text-white">
          ← Accueil du site
        </Link>
      </div>
      <Configurator onOrder={handleOrder} />
      <div className="mx-auto w-full max-w-[1280px] shrink-0 px-5 pb-3 text-center lg:px-10">
        <Link href="/test-ecran" className="text-[12px] font-bold text-fmx-red hover:underline">
          Vérifie aussi la fluidité de ton écran →
        </Link>
      </div>
    </div>
  )
}
