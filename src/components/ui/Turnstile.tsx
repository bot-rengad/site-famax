'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

// Cloudflare Turnstile — composant PRÉPARÉ, inactif par défaut.
// Activation : définir NEXT_PUBLIC_TURNSTILE_SITE_KEY, rendre ce composant
// dans le formulaire voulu, puis vérifier le token côté serveur avec
// verifyTurnstile() (lib/captcha.ts). Sans clé : ne rend rien, zéro surcoût.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
  }
}

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return
    let id = ''
    const t = setInterval(() => {
      if (window.turnstile && ref.current && !id) {
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: onVerify,
          'expired-callback': onExpire,
        })
        clearInterval(t)
      }
    }, 300)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SITE_KEY])

  if (!SITE_KEY) return null

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div ref={ref} className="mt-4 flex justify-center" />
    </>
  )
}
