'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Génère une texture radiale douce (pour braises et halos ronds)
function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, inner)
  g.addColorStop(0.4, outer)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Fond 3D plein écran "FMx" : montagne balayée d'une lumière lave qui suit la
// souris, braises montantes, horizon rouge incandescent et étoiles.
export function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x060608, 9, 26)

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 3.2, 10)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(4, 8, 4)
    scene.add(dir)

    // Rétro-éclairage rouge : découpe les crêtes de la montagne (très visible)
    const rim = new THREE.DirectionalLight(0xff1a1a, 2.4)
    rim.position.set(-2, 3.5, -7)
    scene.add(rim)

    // Lueur fixe au centre de l'horizon
    const horizonGlow = new THREE.PointLight(0xff1a1a, 6, 18, 1.6)
    horizonGlow.position.set(0, 1.2, -6)
    scene.add(horizonGlow)

    // Lumière lave qui suit la souris
    const mouseLight = new THREE.PointLight(0xff2413, 0, 13, 1.5)
    mouseLight.position.set(0, 1.6, 2)
    scene.add(mouseLight)

    // Terrain : plus sombre et légèrement métallique pour que les rouges claquent
    const geo = new THREE.PlaneGeometry(32, 16, 40, 24)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      let z = Math.sin(x * 0.48) * 1.3 + Math.cos(y * 0.6) * 0.85 + Math.sin((x + y) * 0.28) * 0.65
      z += Math.exp(-Math.pow((x + 1) / 4.5, 2)) * 2.1
      z += Math.exp(-Math.pow((x - 6.2) / 3.4, 2)) * 1.6
      z *= 1 - Math.abs(x) / 19
      if (y < -4) z *= 0.38
      pos.setZ(i, z)
    }
    geo.computeVertexNormals()
    const mountain = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x1d2027, roughness: 0.62, metalness: 0.35 })
    )
    mountain.rotation.x = -Math.PI / 2.48
    mountain.position.set(0, -1.45, -2.2)
    scene.add(mountain)

    // Halo incandescent à l'horizon (sprite additif géant, très visible)
    const glowTex = makeGlowTexture('rgba(255,60,30,0.9)', 'rgba(255,26,26,0.35)')
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 9),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    horizon.position.set(0, 0.6, -9)
    scene.add(horizon)

    // Étoiles blanches plus présentes
    const starGeo = new THREE.BufferGeometry()
    const starCount = 420
    const sPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 42
      sPos[i * 3 + 1] = Math.random() * 13 + 1.4
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 34 - 3
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.75, sizeAttenuation: true })
      )
    )

    // Essaim de particules : des centaines de braises qui suivent lentement la souris.
    // Chaque particule a son propre décalage, sa propre vitesse de suivi et une
    // oscillation organique — l'ensemble forme un nuage satisfaisant autour du curseur.
    const swarmCount = 520
    const sGeo = new THREE.BufferGeometry()
    const sPosArr = new Float32Array(swarmCount * 3)
    const sOffset = new Float32Array(swarmCount * 2) // décalage personnel autour du curseur
    const sFollow = new Float32Array(swarmCount) // vitesse de suivi individuelle (lente)
    const sPhase = new Float32Array(swarmCount) // phase d'oscillation
    for (let i = 0; i < swarmCount; i++) {
      // Départ réparti dans l'espace pour une belle convergence au premier mouvement
      sPosArr[i * 3] = (Math.random() - 0.5) * 24
      sPosArr[i * 3 + 1] = Math.random() * 8 + 0.5
      sPosArr[i * 3 + 2] = (Math.random() - 0.5) * 10
      const angle = Math.random() * Math.PI * 2
      const radius = 0.4 + Math.pow(Math.random(), 0.6) * 3.4 // nuage dense au centre
      sOffset[i * 2] = Math.cos(angle) * radius
      sOffset[i * 2 + 1] = Math.sin(angle) * radius * 0.6
      sFollow[i] = 0.18 + Math.random() * 0.55 // tous lents, certains plus lents encore
      sPhase[i] = Math.random() * Math.PI * 2
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPosArr, 3))
    const swarm = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({
        size: 0.11,
        map: makeGlowTexture('rgba(255,190,110,1)', 'rgba(255,50,20,0.55)'),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    )
    scene.add(swarm)

    // Position souris en coordonnées monde + activité (retour en flottement si idle)
    let mouseWorldX = 0, mouseWorldY = 2.2
    let lastMouseMove = 0

    // Anneau rouge en hauteur (pulse)
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.02, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0xff1a1a, transparent: true, opacity: 0.35 })
    )
    halo.position.set(0, 3.45, -1.2)
    halo.rotation.x = Math.PI / 2.2
    scene.add(halo)

    // Lumière lave souris
    let mx = 0, my = 0, tx = 0, ty = 0
    let lightX = 0, lightZ = 2, tLightX = 0, tLightZ = 2, lightIntensity = 0
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
      tLightX = mx * 8
      tLightZ = 2.2 + my * 2.5
      // Cible de l'essaim en coordonnées monde (plan visible par la caméra)
      mouseWorldX = mx * 10
      mouseWorldY = 2.4 - my * 3.6
      lastMouseMove = performance.now()
    }
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)

    let last = performance.now()
    let raf = 0
    let visible = !document.hidden
    const onVisibility = () => { visible = !document.hidden; last = performance.now() }
    document.addEventListener('visibilitychange', onVisibility)

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate)
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now

      // Parallaxe caméra beurre
      tx += (mx - tx) * 0.035
      ty += (my - ty) * 0.035
      camera.position.x = tx * 0.85
      camera.position.y = 3.2 + ty * 0.32
      camera.lookAt(0, 0.45, -1.2)

      // Lumière lave avec inertie + embrasement à la vitesse
      const prevX = lightX, prevZ = lightZ
      lightX += (tLightX - lightX) * 0.05
      lightZ += (tLightZ - lightZ) * 0.05
      const speed = Math.abs(lightX - prevX) + Math.abs(lightZ - prevZ)
      const targetIntensity = 2.6 + Math.min(speed * 130, 4)
      lightIntensity += (targetIntensity - lightIntensity) * 0.06
      mouseLight.position.set(lightX, 1.5 + Math.sin(now * 0.0016) * 0.12, lightZ)
      mouseLight.intensity = lightIntensity

      // Essaim : chaque particule rejoint lentement sa place autour du curseur.
      // Suivi exponentiel (lent et satisfaisant) + oscillation organique.
      const sAttr = sGeo.attributes.position as THREE.BufferAttribute
      const idle = now - lastMouseMove > 2500
      for (let i = 0; i < swarmCount; i++) {
        const px = sAttr.getX(i)
        const py = sAttr.getY(i)
        const k = 1 - Math.exp(-sFollow[i] * dt * 1.6)
        // Cible : autour du curseur ; si souris inactive, dérive lente vers le haut
        const targetX = idle ? px + Math.sin(now * 0.0004 + sPhase[i]) * 0.15 : mouseWorldX + sOffset[i * 2]
        const targetY = idle ? py + 0.25 * dt * 10 : mouseWorldY + sOffset[i * 2 + 1]
        const wob = Math.sin(now * 0.001 + sPhase[i]) * 0.08
        sAttr.setX(i, px + (targetX - px) * k + wob * dt)
        sAttr.setY(i, py + (targetY - py) * k + Math.cos(now * 0.0013 + sPhase[i]) * 0.06 * dt * 10)
      }
      sAttr.needsUpdate = true

      // Pulsations
      const pulse = 0.28 + Math.sin(now * 0.0012) * 0.1
      ;(halo.material as THREE.MeshBasicMaterial).opacity = pulse
      halo.rotation.z += dt * 0.35
      ;(horizon.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(now * 0.0009) * 0.08

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      scene.clear()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 will-change-transform"
      aria-hidden="true"
    />
  )
}
