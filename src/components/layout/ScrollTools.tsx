'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

// Barre de progression du scroll + bouton retour en haut.
// Rend la navigation longue (landing) plus fluide et repérable.
export function ScrollTools() {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let ticking = false
    let lastProgress = -1
    let lastShowTop = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
        // Évite un re-render React à chaque frame : MAJ seulement si ça bouge vraiment
        if (Math.abs(p - lastProgress) > 0.002) {
          lastProgress = p
          setProgress(p)
        }
        const show = window.scrollY > 700
        if (show !== lastShowTop) {
          lastShowTop = show
          setShowTop(show)
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Progression fine sous le header */}
      <div
        className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-fmx-red"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      {/* Retour en haut — au-dessus du chatbot (mobile : bottom-40, desktop : bottom-24) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Retour en haut"
        className={cn(
          'fixed bottom-40 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#17171b]/90 text-white shadow-lg backdrop-blur transition-all duration-300 hover:border-fmx-red/50 hover:text-fmx-red sm:bottom-24 sm:right-6',
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  )
}
