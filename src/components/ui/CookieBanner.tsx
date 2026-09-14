'use client'

import { useState, useEffect } from 'react'

// Bandeau cookies RGPD : le site ne pose AUCUN cookie/traceur marketing
// aujourd'hui (session + consentement uniquement). Le bandeau mémorise le choix
// et conditionne les futurs scripts d'analyse (voir lib/analytics.ts).
const KEY = 'fmx-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const choose = (value: 'accepted' | 'refused') => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* stockage indisponible : on masque quand même */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-4 bottom-36 z-[70] mx-auto max-w-[560px] rounded-2xl border border-white/[0.1] bg-[#101012] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.6)] sm:bottom-28 md:bottom-6 md:left-auto md:right-6 md:mx-0"
    >
      <p className="text-[13px] font-bold text-white">Cookies & confidentialité</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-fmx-gray">
        On n&apos;utilise que le strict nécessaire (connexion, mémorisation de ce choix).
        Les mesures d&apos;audience ne seront activées que si tu acceptes. Détails :{' '}
        <a href="/confidentialite" className="text-fmx-red hover:underline">
          politique de confidentialité
        </a>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => choose('refused')}
          className="flex-1 rounded-full border border-white/15 bg-white/[0.06] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/[0.12]"
        >
          Refuser
        </button>
        <button
          onClick={() => choose('accepted')}
          className="flex-1 rounded-full bg-fmx-red py-2.5 text-[13px] font-bold text-white transition-transform hover:-translate-y-px"
        >
          Accepter
        </button>
      </div>
    </div>
  )
}

export function hasConsented(): boolean {
  try {
    return localStorage.getItem(KEY) === 'accepted'
  } catch {
    return false
  }
}
