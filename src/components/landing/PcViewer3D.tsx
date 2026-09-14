'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ============================================================
// Viewer 3D — tour de PC FMX qui tourne (rAF natif = Hz de l'écran).
// Réactif au gain : plus l'opti rapporte de FPS, plus la tour tourne vite
// et plus le halo rouge pulse. Chargé en dynamique (three.js hors bundle).
// ============================================================
export function PcViewer3D({
  fps,
  gain,
  refreshHz,
  gameLabel,
}: {
  fps: number
  gain: number
  refreshHz: number | null
  gameLabel?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Vitesse + halo recalculés à chaque changement de config, lus par la boucle
  const live = useRef({ speed: 0.55, glow: 0.05 })

  useEffect(() => {
    const ratio = Math.max(0, Math.min(1, gain / 400))
    live.current.speed = 0.3 + Math.min(fps, 600) / 600 * 0.55
    live.current.glow = 0.035 + ratio * 0.06
  }, [fps, gain])

  useEffect(() => {
    const canvas = canvasRef.current
    const box = containerRef.current
    if (!canvas || !box) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0c)
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100)
    camera.position.set(0, 0.85, 3.25)

    const resize = () => {
      const r = box.getBoundingClientRect()
      if (!r.width) return
      renderer.setSize(r.width, r.height, false)
      camera.aspect = r.width / r.height
      camera.updateProjectionMatrix()
    }
    resize()

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))
    const vDir = new THREE.DirectionalLight(0xffffff, 1.35)
    vDir.position.set(2, 4, 3)
    scene.add(vDir)
    const vRed = new THREE.PointLight(0xff1a1a, 5, 8)
    vRed.position.set(0, 0.8, 1.5)
    scene.add(vRed)

    const pcGroup = new THREE.Group()
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 1.28), new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.45, metalness: 0.45 }))
    base.position.y = -0.62
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.44, 1.22, 0.98), new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.32, metalness: 0.38 }))
    tower.position.y = 0.06
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.23, 0.02), new THREE.MeshStandardMaterial({ color: 0xff1a1a, transparent: true, opacity: 0.07, emissive: 0xff1a1a, emissiveIntensity: 0.18 }))
    glass.position.set(0, 0.06, 0.5)

    // Logo FMX en texture
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 1024
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = '900 620px Syne, sans-serif'
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillText('FM', 720, 556)
    ctx.fillStyle = 'rgba(255,26,26,0.28)'
    ctx.fillText('X', 1460, 570)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('FM', 704, 540)
    ctx.fillStyle = '#FF1A1A'
    ctx.fillText('X', 1444, 554)
    const logoTex = new THREE.CanvasTexture(c)
    logoTex.colorSpace = THREE.SRGBColorSpace
    logoTex.generateMipmaps = false
    logoTex.minFilter = THREE.LinearFilter
    logoTex.magFilter = THREE.LinearFilter
    const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.67), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false }))
    logoPlane.position.set(0, 0.18, 0.62)
    logoPlane.renderOrder = 2

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a, transparent: true, opacity: 0.045 })
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), glowMat)
    glow.rotation.x = -Math.PI / 2
    glow.position.y = -0.54
    pcGroup.add(base, tower, glass, logoPlane, glow)
    scene.add(pcGroup)

    const grid = new THREE.GridHelper(7.5, 14, 0x24242a, 0x18181e)
    grid.position.y = -0.69
    scene.add(grid)

    let drag = false, lastX = 0, rot = 0.55
    const onDown = (e: PointerEvent) => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId) }
    const onUp = () => { drag = false }
    const onMove = (e: PointerEvent) => { if (drag) { rot += (e.clientX - lastX) * 0.01; lastX = e.clientX } }
    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointermove', onMove)

    const ro = new ResizeObserver(resize)
    ro.observe(box)

    // Rendu à chaque frame rAF (Hz natif), pause si onglet caché ou hors écran.
    // Mouvements en dt : vitesse identique à tout Hz.
    let vLast = performance.now()
    let raf = 0
    let visible = !document.hidden
    let inView = true
    const onVis = () => { visible = !document.hidden; vLast = performance.now() }
    document.addEventListener('visibilitychange', onVis)
    const io = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? true }, { threshold: 0 })
    io.observe(box)

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate)
      if (!visible || !inView) { vLast = now; return }
      const dt = Math.min((now - vLast) / 1000, 0.05)
      vLast = now
      if (!drag) rot += dt * live.current.speed
      pcGroup.rotation.y = rot
      logoPlane.position.y = 0.18 + Math.sin(now * 0.0011) * 0.01
      glowMat.opacity = live.current.glow
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(animate)
    const t = setTimeout(resize, 150)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointermove', onMove)
      // Nettoyage GPU complet : géométries + matériaux + texture logo
      pcGroup.traverse(obj => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else if (mat) mat.dispose()
      })
      logoTex.dispose()
      grid.geometry.dispose()
      ;(grid.material as THREE.Material).dispose()
      renderer.dispose()
      scene.clear()
    }
  }, [])

  const fpsColor = fps >= 240 ? '#22c55e' : fps >= 120 ? '#ffffff' : '#fbbf24'

  return (
    <div ref={containerRef} className="relative flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0a0a0c]">
      <canvas ref={canvasRef} className="block h-full w-full touch-pan-y" style={{ touchAction: 'pan-y' }} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[18px]">
        <div className="flex items-start justify-between">
          <div className="max-w-[55%] rounded-full border border-fmx-red/30 bg-fmx-red/15 px-2.5 py-1.5 text-[11px] font-bold tracking-[0.08em] text-fmx-red">
            ● {gameLabel ?? 'FORTNITE — MODE ILLIMITÉ'}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/70 px-3.5 py-2.5 text-center">
            <strong className="block text-[26px] font-extrabold" style={{ color: fpsColor }}>{fps}</strong>
            <span className="block text-[10px] uppercase tracking-[0.14em] text-fmx-gray">FPS estimés</span>
            {refreshHz && (
              <span className="mt-0.5 block text-[9px] uppercase tracking-wider text-fmx-gray">
                écran {refreshHz} Hz {fps > refreshHz ? '— au-dessus' : '— sous ton écran'}
              </span>
            )}
            <span className="mt-1 block rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-extrabold text-green-400">
              +{gain} FPS après opti
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-fmx-gray">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          La tour accélère avec ton gain
          <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.08] px-2.5 py-1.5">
            Glisse pour tourner
          </span>
        </div>
      </div>
    </div>
  )
}
