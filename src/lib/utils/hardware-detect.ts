// Détection automatique du matériel du visiteur via les APIs du navigateur
// Note : le navigateur n'expose pas le modèle exact du CPU, mais les autres
// composants (GPU, RAM, OS, écran) sont détectables côté client.

export interface DetectedSpecs {
  /** Nombre de threads logiques exposés par le CPU */
  cpuCores: number | null
  /** Chaîne brute du renderer WebGL (ex: ANGLE (NVIDIA, NVIDIA GeForce RTX 3080...) */
  gpuRenderer: string | null
  /** Modèle GPU nettoyé (ex: NVIDIA GeForce RTX 3080) */
  gpuModel: string | null
  /** Marque GPU détectée */
  gpuVendor: 'NVIDIA' | 'AMD' | 'Intel' | null
  /** RAM en Go (approximative, limitée à 8 Go par Chrome) */
  ramGB: number | null
  /** Système d'exploitation détecté */
  os: string | null
  /** Taux de rafraîchissement mesuré de l'écran */
  refreshRateHz: number | null
  /** Résolution d'écran */
  screenResolution: string | null
  /** Type de connexion réseau estimée */
  networkType: string | null
}

// Nettoie la chaîne WebGL pour en extraire un nom de carte lisible
function parseGpu(renderer: string): { model: string | null; vendor: DetectedSpecs['gpuVendor'] } {
  const upper = renderer.toUpperCase()
  let vendor: DetectedSpecs['gpuVendor'] = null
  if (upper.includes('NVIDIA')) vendor = 'NVIDIA'
  else if (upper.includes('AMD') || upper.includes('RADEON')) vendor = 'AMD'
  else if (upper.includes('INTEL')) vendor = 'Intel'

  // Extrait la partie utile entre parenthèses : ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11...)
  let model: string | null = null
  const match = renderer.match(/\(([^)]+)\)/)
  if (match && vendor) {
    const parts = match[1].split(',').map(p => p.trim())
    const found = parts.find(p => p.toUpperCase().includes(vendor === 'AMD' ? 'RADEON' : vendor))
    if (found) model = found.replace(/\s*Direct3D\d+\s*/i, '').replace(/\s*vs_\d_\d\s*ps_\d_\d\s*/i, '').trim()
  }
  if (!model && vendor) {
    // Fallback : cherche directement dans la chaîne complète
    const direct = renderer.match(/((NVIDIA|AMD|Radeon|Intel)[^,)]*)/i)
    if (direct) model = direct[1].replace(/\s*(Direct3D|Metal|OpenGL).*$/i, '').trim()
  }
  return { model, vendor }
}

// Détecte le GPU via WebGL debug renderer info
async function detectGpu(): Promise<{ renderer: string | null; model: string | null; vendor: DetectedSpecs['gpuVendor'] }> {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return { renderer: null, model: null, vendor: null }

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    let renderer: string
    if (ext) {
      renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
    } else {
      renderer = String(gl.getParameter(gl.RENDERER))
    }

    // Ignore les renderers logiciels génériques
    if (/swiftshader|basic render/i.test(renderer)) {
      return { renderer, model: null, vendor: null }
    }

    const { model, vendor } = parseGpu(renderer)
    return { renderer, model, vendor }
  } catch {
    return { renderer: null, model: null, vendor: null }
  }
}

// Mesure le taux de rafraîchissement réel de l'écran avec requestAnimationFrame
async function detectRefreshRate(): Promise<number | null> {
  return new Promise(resolve => {
    const frames: number[] = []
    let rafId: number

    const tick = (now: number) => {
      frames.push(now)
      if (frames.length < 25) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const deltas = frames.slice(1).map((t, i) => t - frames[i]).filter(d => d > 0)
      if (deltas.length === 0) return resolve(null)
      deltas.sort((a, b) => a - b)
      // Médiane pour ignorer les pics de charge ponctuels
      const median = deltas[Math.floor(deltas.length / 2)]
      const hz = Math.round(1000 / median)
      // Arrondit vers les fréquences standard du marché
      const standard = [60, 75, 90, 120, 144, 165, 175, 180, 200, 240, 280, 300, 360, 480, 540]
      const closest = standard.reduce((prev, curr) => (Math.abs(curr - hz) < Math.abs(prev - hz) ? curr : prev))
      resolve(Math.abs(closest - hz) <= 12 ? closest : hz)
    }
    rafId = requestAnimationFrame(tick)

    // Sécurité : ne bloque jamais plus de 3 secondes
    setTimeout(() => {
      cancelAnimationFrame(rafId)
      resolve(null)
    }, 3000)
  })
}

// Détecte l'OS depuis le User-Agent (+ User-Agent Client Hints si dispo)
async function detectOs(): Promise<string | null> {
  try {
    const uaData = (navigator as Navigator & {
      userAgentData?: { platform: string; getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string>> }
    }).userAgentData
    if (uaData?.getHighEntropyValues) {
      const values = await uaData.getHighEntropyValues(['platformVersion', 'platform'])
      if (values.platform === 'Windows') {
        const major = parseInt((values.platformVersion || '0').split('.')[0], 10)
        // Windows 11 remonte une platformVersion >= 13
        return major >= 13 ? 'Windows 11' : 'Windows 10'
      }
      if (values.platform) return values.platform
    }
  } catch { /* ignore */ }

  const ua = navigator.userAgent
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return null
}

// Lance toutes les détections en parallèle et renvoie un résumé propre
export async function detectHardware(): Promise<DetectedSpecs> {
  const [gpu, os] = await Promise.all([detectGpu(), detectOs()])

  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { effectiveType?: string; downlink?: number }
  }

  const ramGB = nav.deviceMemory ? Math.min(nav.deviceMemory, 32) : null
  const cores = navigator.hardwareConcurrency || null

  return {
    cpuCores: cores,
    gpuRenderer: gpu.renderer,
    gpuModel: gpu.model,
    gpuVendor: gpu.vendor,
    ramGB,
    os,
    refreshRateHz: await detectRefreshRate(),
    screenResolution: `${screen.width}x${screen.height}`,
    networkType: nav.connection?.effectiveType || null,
  }
}
