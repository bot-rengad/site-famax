'use client'

// Analyse d'audience respectueuse du consentement.
// Aujourd'hui : AUCUN script tiers n'est chargé (GA désactivé).
// Pour activer : définir NEXT_PUBLIC_GA_ID=G-XXXXXXX dans l'environnement,
// ajouter 'https://www.googletagmanager.com' au connect-src/script-src de la CSP,
// puis appeler trackPageview() après consentement (voir CookieBanner).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

function consentOk(): boolean {
  try {
    return localStorage.getItem('fmx-consent') === 'accepted'
  } catch {
    return false
  }
}

export function analyticsReady(): boolean {
  return GA_ID.length > 0 && typeof window !== 'undefined' && consentOk()
}

export function trackPageview(path: string): void {
  if (!analyticsReady()) return
  // gtag('config', GA_ID, { page_path: path }) — branché le jour de l'activation
  void path
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!analyticsReady()) return
  // gtag('event', name, params) — branché le jour de l'activation
  void name
  void params
}
