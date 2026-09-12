'use client'

import { useEffect, useRef } from 'react'

// Fond FMX — halos + grille + boules floues animées + grain + halo curseur
export function ShinamiBackground() {
  const glowRef = useRef<HTMLDivElement>(null)

  // Halo curseur : MAJ uniquement quand la souris bouge (pas de boucle infinie).
  // La transition CSS lisse le mouvement sans réveiller le GPU à chaque frame.
  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    let pending = false
    let x = 0
    let y = 0
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (pending) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        el.style.transform = `translate(${x - 260}px, ${y - 260}px)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <div className="fmx-bg-layer" aria-hidden="true" />
      <div className="fmx-bg-grid" aria-hidden="true" />
      <div className="fmx-bg-orbs" aria-hidden="true">
        <span className="fmx-orb fmx-orb-a" />
        <span className="fmx-orb fmx-orb-b" />
        <span className="fmx-orb fmx-orb-c" />
      </div>
      <div className="fmx-grain" aria-hidden="true" />
      <div ref={glowRef} className="fmx-cursor-glow" aria-hidden="true" />
    </>
  )
}
