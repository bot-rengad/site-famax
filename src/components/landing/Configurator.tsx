'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ScanLine } from 'lucide-react'
import { detectHardware } from '@/lib/utils/hardware-detect'

// Tour 3D chargée uniquement côté client (three.js hors du bundle initial)
const PcViewer3D = dynamic(() => import('./PcViewer3D').then(m => m.PcViewer3D), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[240px] h-full place-items-center rounded-[20px] border border-white/[0.08] bg-[#0a0a0c]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-fmx-red border-t-transparent" />
    </div>
  ),
})

// ============================================================
// Base matérielle complète — scores calibrés sur Fortnite
// Performance mode ILLIMITÉ (1080p), d'après benchs réels :
//   7800X3D + RTX 5060 Ti + DDR5 32Go  ->  ~1080 FPS
//   5600X  + RTX 5060  + DDR4 16Go     ->  ~650 FPS
//   Configs anciennes                  ->  plafonnées ~110-200 FPS
// ============================================================

type GpuModel = { name: string; score: number }
type CpuModel = { name: string; score: number }

const GPUS: Record<string, Record<string, Record<string, GpuModel[]>>> = {
  NVIDIA: {
    GTX: {
      'Série 10': [
        { name: 'GTX 1050', score: 80 }, { name: 'GTX 1050 Ti', score: 95 },
        { name: 'GTX 1060 3Go', score: 120 }, { name: 'GTX 1060 6Go', score: 135 },
        { name: 'GTX 1070', score: 165 }, { name: 'GTX 1070 Ti', score: 175 },
        { name: 'GTX 1080', score: 190 }, { name: 'GTX 1080 Ti', score: 210 },
      ],
      'Série 16': [
        { name: 'GTX 1650', score: 105 }, { name: 'GTX 1650 Super', score: 130 },
        { name: 'GTX 1660', score: 140 }, { name: 'GTX 1660 Super', score: 150 },
        { name: 'GTX 1660 Ti', score: 155 },
      ],
    },
    RTX: {
      'Série 20': [
        { name: 'RTX 2060', score: 175 }, { name: 'RTX 2060 Super', score: 190 },
        { name: 'RTX 2070', score: 200 }, { name: 'RTX 2070 Super', score: 210 },
        { name: 'RTX 2080', score: 225 }, { name: 'RTX 2080 Ti', score: 250 },
      ],
      'Série 30': [
        { name: 'RTX 3050', score: 150 }, { name: 'RTX 3060', score: 205 },
        { name: 'RTX 3060 Ti', score: 235 }, { name: 'RTX 3070', score: 260 },
        { name: 'RTX 3070 Ti', score: 270 }, { name: 'RTX 3080', score: 300 },
        { name: 'RTX 3080 Ti', score: 315 }, { name: 'RTX 3090', score: 320 },
        { name: 'RTX 3090 Ti', score: 335 },
      ],
      'Série 40': [
        { name: 'RTX 4060', score: 200 }, { name: 'RTX 4060 Ti', score: 265 },
        { name: 'RTX 4070', score: 295 }, { name: 'RTX 4070 Super', score: 315 },
        { name: 'RTX 4070 Ti Super', score: 335 }, { name: 'RTX 4080', score: 365 },
        { name: 'RTX 4080 Super', score: 380 }, { name: 'RTX 4090', score: 440 },
      ],
      'Série 50': [
        { name: 'RTX 5060', score: 305 }, { name: 'RTX 5060 Ti', score: 340 },
        { name: 'RTX 5070', score: 365 }, { name: 'RTX 5070 Ti', score: 395 },
        { name: 'RTX 5080', score: 425 }, { name: 'RTX 5090', score: 500 },
      ],
    },
  },
  AMD: {
    RX: {
      'RX 500': [
        { name: 'RX 570', score: 115 }, { name: 'RX 580', score: 130 }, { name: 'RX 590', score: 140 },
      ],
      'RX 5000': [
        { name: 'RX 5500 XT', score: 120 }, { name: 'RX 5600 XT', score: 165 },
        { name: 'RX 5700', score: 185 }, { name: 'RX 5700 XT', score: 200 },
      ],
      'RX 6000': [
        { name: 'RX 6600', score: 190 }, { name: 'RX 6600 XT', score: 210 },
        { name: 'RX 6650 XT', score: 220 }, { name: 'RX 6700 XT', score: 245 },
        { name: 'RX 6750 XT', score: 255 }, { name: 'RX 6800', score: 275 },
        { name: 'RX 6800 XT', score: 300 }, { name: 'RX 6900 XT', score: 320 },
        { name: 'RX 6950 XT', score: 330 },
      ],
      'RX 7000': [
        { name: 'RX 7600', score: 230 }, { name: 'RX 7700 XT', score: 285 },
        { name: 'RX 7800 XT', score: 305 }, { name: 'RX 7900 GRE', score: 335 },
        { name: 'RX 7900 XT', score: 360 }, { name: 'RX 7900 XTX', score: 385 },
      ],
      'RX 9000': [
        { name: 'RX 9060 XT', score: 310 }, { name: 'RX 9070', score: 385 }, { name: 'RX 9070 XT', score: 420 },
      ],
    },
  },
}

const CPUS: Record<string, Record<string, CpuModel[]>> = {
  Intel: {
    '10e génération': [
      { name: 'i3-10100F', score: 150 }, { name: 'i5-10400F', score: 200 },
      { name: 'i5-10600K', score: 230 }, { name: 'i7-10700K', score: 240 }, { name: 'i9-10900K', score: 260 },
    ],
    '11e génération': [
      { name: 'i5-11400F', score: 230 }, { name: 'i7-11700K', score: 255 }, { name: 'i9-11900K', score: 265 },
    ],
    '12e génération': [
      { name: 'i3-12100F', score: 330 }, { name: 'i5-12400F', score: 420 },
      { name: 'i5-12500F', score: 440 }, { name: 'i5-12600K', score: 470 },
      { name: 'i7-12700F', score: 475 }, { name: 'i7-12700K', score: 485 }, { name: 'i9-12900K', score: 520 },
    ],
    '13e génération': [
      { name: 'i3-13100F', score: 350 }, { name: 'i5-13400F', score: 450 },
      { name: 'i5-13500', score: 480 }, { name: 'i5-13600K', score: 530 },
      { name: 'i7-13700F', score: 555 }, { name: 'i7-13700K', score: 565 },
      { name: 'i9-13900K', score: 615 }, { name: 'i9-13900KS', score: 630 },
    ],
    '14e génération': [
      { name: 'i3-14100F', score: 360 }, { name: 'i5-14400F', score: 470 },
      { name: 'i5-14600K', score: 540 }, { name: 'i7-14700K', score: 590 },
      { name: 'i9-14900K', score: 640 }, { name: 'i9-14900KS', score: 655 },
    ],
    'Core Ultra 200s': [
      { name: 'Ultra 5 245K', score: 590 }, { name: 'Ultra 7 265K', score: 655 }, { name: 'Ultra 9 285K', score: 690 },
    ],
  },
  AMD: {
    'Ryzen 1000/2000': [
      { name: 'R5 2600', score: 150 }, { name: 'R7 2700X', score: 165 },
    ],
    'Ryzen 3000': [
      { name: 'R3 3100', score: 170 }, { name: 'R3 3300X', score: 200 },
      { name: 'R5 3600', score: 300 }, { name: 'R7 3700X', score: 310 }, { name: 'R9 3900X', score: 420 },
    ],
    'Ryzen 4000/5000': [
      { name: 'R5 4500', score: 250 }, { name: 'R5 5500', score: 330 },
      { name: 'R5 5600G', score: 340 },       { name: 'R5 5600', score: 590 },
      { name: 'R5 5600X', score: 620 }, { name: 'R7 5700X', score: 620 },
      { name: 'R7 5700X3D', score: 830 }, { name: 'R7 5800X', score: 630 },
      { name: 'R7 5800X3D', score: 870 }, { name: 'R9 5900X', score: 640 }, { name: 'R9 5950X', score: 660 },
    ],
    'Ryzen 7000': [
      { name: 'R5 7600', score: 560 }, { name: 'R5 7600X', score: 585 },
      { name: 'R7 7700X', score: 625 }, { name: 'R7 7800X3D', score: 1050 },
      { name: 'R9 7900X', score: 640 }, { name: 'R9 7950X3D', score: 980 },
    ],
    'Ryzen 9000': [
      { name: 'R5 9600X', score: 640 }, { name: 'R7 9700X', score: 670 },
      { name: 'R7 9800X3D', score: 1100 }, { name: 'R9 9900X', score: 690 }, { name: 'R9 9950X3D', score: 1080 },
    ],
  },
}

// Vitesse RAM : bonus FPS selon la fréquence (timings serrés = latence plus basse)
const MHZ_OPTIONS: Record<'DDR4' | 'DDR5', { mhz: string; add: number }[]> = {
  DDR4: [
    { mhz: '2666 MHz', add: 0 },
    { mhz: '3200 MHz', add: 12 },
    { mhz: '3600 MHz', add: 20 },
    { mhz: '4000 MHz (OC)', add: 26 },
  ],
  DDR5: [
    { mhz: '4800 MHz', add: 0 },
    { mhz: '5600 MHz', add: 22 },
    { mhz: '6000 MHz', add: 35 },
    { mhz: '6400 MHz', add: 42 },
    { mhz: '7200 MHz+ (OC)', add: 52 },
  ],
}

// Compatibilité DDR selon la génération CPU (un 5700X ne prend PAS de DDR5)
const DDR_COMPAT: Record<string, ('DDR4' | 'DDR5')[]> = {
  // Intel
  '10e génération': ['DDR4'],
  '11e génération': ['DDR4'],
  '12e génération': ['DDR4', 'DDR5'],
  '13e génération': ['DDR4', 'DDR5'],
  '14e génération': ['DDR4', 'DDR5'],
  'Core Ultra 200s': ['DDR5'],
  // AMD
  'Ryzen 1000/2000': ['DDR4'],
  'Ryzen 3000': ['DDR4'],
  'Ryzen 4000/5000': ['DDR4'],
  'Ryzen 7000': ['DDR5'],
  'Ryzen 9000': ['DDR5'],
}

// Gain opti en pourcentage : proportionnel, n'inflate pas les petites configs
const OPTI_PCT: Record<20 | 25 | 50, number> = { 20: 0.12, 25: 0.15, 50: 0.18 }

// Moteur V3 — Fortnite Performance + résolution + bottleneck
// Profil calibré sur la config de référence (7800X3D + RTX 5060 Ti +
// 32 Go DDR5-6000 @1080p, réglages compétitifs).
// Le coefficient est calculé pour que la référence tombe pile sur la cible :
// les autres configs héritent d'une échelle réaliste, sans inflation.
export interface GameProfile {
  cpuW: number
  gpuW: number
  scale: number
  target: number
  label: string
}

// RAM : capacité avec rendements décroissants + pénalité 8 Go (stutter)
const RAM_FACTOR = [0.72, 1.0, 1.06, 1.07] // 8 / 16 / 32 / 64 Go

// Config de référence (scores internes CPU 1050 / GPU 340)
const REF = { cpu: 1050, gpu: 340, ramIdx: 2, mhz: 35 }

function rawScore(cpuW: number, gpuW: number): number {
  return (REF.cpu * cpuW + REF.gpu * gpuW + REF.mhz * (0.6 + cpuW * 0.6)) * RAM_FACTOR[REF.ramIdx]
}

const GAME_DEFS: Record<string, { cpuW: number; gpuW: number; target: number; label: string }> = {
  // Fortnite uniquement : mode Performance illimité, réglages compétitifs
  'Fortnite Performance (illimité)': { cpuW: 0.75, gpuW: 0.35, target: 965, label: 'CPU-bound • illimité' },
}

export const GAMES: Record<string, GameProfile> = Object.fromEntries(
  Object.entries(GAME_DEFS).map(([name, d]) => [
    name,
    { cpuW: d.cpuW, gpuW: d.gpuW, scale: d.target / rawScore(d.cpuW, d.gpuW), target: d.target, label: d.label },
  ])
)

export const RESOLUTIONS: Record<string, { gpuMult: number; cpuMult: number; label: string }> = {
  '1080p': { gpuMult: 1, cpuMult: 1, label: '1080p — compétitif' },
  '1440p': { gpuMult: 0.68, cpuMult: 0.97, label: '1440p — QHD' },
}

export interface FpsResult {
  avg: number
  avgStock: number
  low1: number
  gain: number
  bottleneck: 'CPU' | 'GPU' | 'Équilibré'
  bottleneckPct: number
  stutterRisk: boolean
}

// Formule V3 calibrée Fortnite Performance (moyennes APRÈS opti, 1080p) :
//   7800X3D + 5060 Ti + DDR5-6000 32Go -> ~1080 (965 stock, 1% low ~713, Équilibré)
//   5600X   + 5060   + DDR4-3200 16Go  -> ~630, bottleneck CPU @1080p
//   10100F  + GTX 1050 + DDR4 8Go      -> ~110 + alerte stutter
// Bottleneck : 7800X3D+5060Ti = Équilibré @1080p, GPU @1440p ; 5600+5060 = CPU @1080p, Équilibré @1440p.
export function estimateFpsDetailed(
  cpuScore: number,
  gpuScore: number,
  ramIdx: number,
  mhzAdd: number,
  game: string,
  resolution: string,
  offer: 20 | 25 | 50
): FpsResult {
  const g = GAMES[game] ?? GAMES['Fortnite Performance (illimité)']
  const r = RESOLUTIONS[resolution] ?? RESOLUTIONS['1080p']

  const cpuPart = cpuScore * g.cpuW * r.cpuMult
  const gpuPart = gpuScore * g.gpuW * r.gpuMult
  const ramCap = RAM_FACTOR[ramIdx] ?? 1
  // Fréquence RAM : impacte surtout Fortnite, très sensible à la latence CPU
  const ramFreq = mhzAdd * (0.6 + g.cpuW * 0.6)

  const stock = Math.max(40, (cpuPart + gpuPart + ramFreq) * ramCap * g.scale)
  const avg = Math.max(40, Math.round(stock * (1 + OPTI_PCT[offer])))

  const avgStock = Math.round(stock)
  // 1% low : meilleure stabilité avec les offres supérieures
  const LOW1_RATIO: Record<20 | 25 | 50, number> = { 20: 0.66, 25: 0.7, 50: 0.74 }
  const low1 = Math.round(avg * LOW1_RATIO[offer])
  const gain = avg - avgStock

  // Bottleneck : plafonds indépendants CPU vs GPU, calibrés sur la référence.
  // cpuCap = FPS max que le CPU peut alimenter, gpuCap = FPS max que le GPU
  // peut afficher (résolution incluse). Le plus bas des deux limite vraiment.
  // En pratique : à 1080p le CPU plafonne en premier (high-refresh), à 1440p
  // c'est le GPU — le modèle reproduit ce basculement tout seul.
  const cpuCap = (cpuPart / (REF.cpu * g.cpuW)) * g.target
  const gpuCap = (gpuPart / (REF.gpu * g.gpuW)) * g.target
  const capRatio = gpuCap / Math.max(1, cpuCap)
  const bottleneck = capRatio > 1.12 ? 'CPU' : capRatio < 0.88 ? 'GPU' : 'Équilibré'
  const bottleneckPct = bottleneck === 'Équilibré' ? 0 : Math.round(Math.abs(1 - capRatio) * 100)
  const stutterRisk = ramIdx === 0

  return { avg, avgStock, low1, gain, bottleneck, bottleneckPct, stutterRisk }
}


// ============================================================
// Configurateur — sélection en cascade marque → gamme → génération → modèle
// ============================================================
interface ConfiguratorProps {
  onOrder: (plan?: 'BASIC' | 'COMPLET' | 'ULTIME' | null) => void
}

export function Configurator({ onOrder }: ConfiguratorProps) {
  // GPU : marque → gamme → génération → modèle
  const [gpuBrand, setGpuBrand] = useState<'NVIDIA' | 'AMD'>('NVIDIA')
  const [gpuRange, setGpuRange] = useState('RTX')
  const [gpuGen, setGpuGen] = useState('Série 50')
  const [gpuIdx, setGpuIdx] = useState(1) // RTX 5060 Ti

  // CPU : marque → génération → modèle
  const [cpuBrand, setCpuBrand] = useState<'Intel' | 'AMD'>('AMD')
  const [cpuGen, setCpuGen] = useState('Ryzen 7000')
  const [cpuIdx, setCpuIdx] = useState(3) // R7 7800X3D (index 3 : 7600, 7600X, 7700X, 7800X3D...)

  const [ram, setRam] = useState(2)
  const [ddr, setDdr] = useState<'DDR4' | 'DDR5'>('DDR5')
  const [mhzIdx, setMhzIdx] = useState(2) // 6000 MHz par défaut
  // Fortnite uniquement — pas de sélecteur de jeu
  const game = 'Fortnite Performance (illimité)'
  const [resolution, setResolution] = useState('1080p')
  const [offer, setOffer] = useState<20 | 25 | 50>(20)
  const [scanning, setScanning] = useState(false)
  const [detectedMsg, setDetectedMsg] = useState<string | null>(null)
  const [refreshHz, setRefreshHz] = useState<number | null>(null)

  const gpuRanges = Object.keys(GPUS[gpuBrand])
  const gpuGens = Object.keys(GPUS[gpuBrand][gpuRange] ?? {})
  const gpuModels = GPUS[gpuBrand][gpuRange]?.[gpuGen] ?? []
  const cpuGens = Object.keys(CPUS[cpuBrand])
  const cpuModels = CPUS[cpuBrand][cpuGen] ?? []

  // Types de RAM compatibles avec le CPU sélectionné (un 5700X ne prend pas de DDR5)
  const compatibleDdr = DDR_COMPAT[cpuGen] ?? ['DDR4', 'DDR5']
  const mhzOptions = MHZ_OPTIONS[ddr]

  const cpuScore = cpuModels[cpuIdx]?.score ?? 400
  const gpuScore = gpuModels[gpuIdx]?.score ?? 300
  const mhzAdd = mhzOptions[mhzIdx]?.add ?? 0
  const result = estimateFpsDetailed(cpuScore, gpuScore, ram, mhzAdd, game, resolution, offer)
  const fps = result.avg

  // Changement de génération CPU : ajuste automatiquement le type de RAM compatible
  const changeCpuGen = (gen: string) => {
    setCpuGen(gen)
    setCpuIdx(0)
    const compat = DDR_COMPAT[gen] ?? ['DDR4', 'DDR5']
    if (!compat.includes(ddr)) {
      setDdr(compat[0])
      // Défaut : 6000 MHz en DDR5, 3200 MHz en DDR4
      setMhzIdx(compat[0] === 'DDR4' ? 1 : 2)
    }
  }

  // Détection du taux de rafraîchissement pour l'affichage
  useEffect(() => {
    detectHardware().then(s => setRefreshHz(s.refreshRateHz)).catch(() => {})
  }, [])

  // Expose la config au chatbot (personnalisation des réponses)
  useEffect(() => {
    try {
      const gpu = gpuModels[gpuIdx]?.name ?? null
      ;(window as unknown as { __fmxSpecs?: Record<string, unknown> }).__fmxSpecs = {
        gpuModel: gpu,
        ramGB: [8, 16, 32, 64][ram] ?? null,
        os: null,
        refreshRateHz: refreshHz,
      }
    } catch { /* non bloquant */ }
  }, [gpuModels, gpuIdx, ram, refreshHz])

  const changeGpuBrand = (b: 'NVIDIA' | 'AMD') => {
    const range = Object.keys(GPUS[b])[0]
    const gen = Object.keys(GPUS[b][range])[0]
    setGpuBrand(b); setGpuRange(range); setGpuGen(gen); setGpuIdx(0)
  }
  const changeGpuRange = (r: string) => {
    const gen = Object.keys(GPUS[gpuBrand][r])[0]
    setGpuRange(r); setGpuGen(gen); setGpuIdx(0)
  }
  const changeCpuBrand = (b: 'Intel' | 'AMD') => {
    const gen = Object.keys(CPUS[b])[0]
    setCpuBrand(b)
    changeCpuGen(gen)
  }

  // Détection auto : retrouve le modèle le plus proche dans l'arbre
  const handleDetect = async () => {
    setScanning(true)
    setDetectedMsg(null)
    try {
      const specs = await detectHardware()
      if (specs.refreshRateHz) setRefreshHz(specs.refreshRateHz)
      const gpuStr = (specs.gpuModel || specs.gpuRenderer || '').toLowerCase()
      if (gpuStr) {
        const brand = gpuStr.includes('nvidia') ? 'NVIDIA' : 'AMD'
        setGpuBrand(brand)
        let found = false
        for (const range of Object.keys(GPUS[brand])) {
          for (const gen of Object.keys(GPUS[brand][range])) {
            GPUS[brand][range][gen].forEach((m, i) => {
              // Match sur le numéro de modèle (ex: "5060 ti" dans la chaîne WebGL)
              const num = m.name.match(/\d{3,4}/)?.[0]
              if (!found && num && gpuStr.includes(num.toLowerCase())) {
                const ti = m.name.toLowerCase().includes('ti')
                if (!ti || gpuStr.includes('ti')) {
                  setGpuRange(range); setGpuGen(gen); setGpuIdx(i); found = true
                }
              }
            })
          }
        }
      }
      if (specs.cpuCores) {
        const threads = specs.cpuCores
        let gen = 'Ryzen 4000/5000', brand: 'Intel' | 'AMD' = 'AMD', idx = 5
        if (threads >= 20) { brand = 'AMD'; gen = 'Ryzen 9000'; idx = 2 }
        else if (threads >= 16) { brand = 'AMD'; gen = 'Ryzen 7000'; idx = 3 }
        else if (threads >= 12) { brand = 'AMD'; gen = 'Ryzen 7000'; idx = 0 }
        else if (threads >= 8) { brand = 'AMD'; gen = 'Ryzen 4000/5000'; idx = 5 }
        else { brand = 'Intel'; gen = '12e génération'; idx = 0 }
        setCpuBrand(brand)
        setCpuGen(gen)
        setCpuIdx(idx)
        // Aligne le type de RAM sur la compatibilité du CPU détecté
        const compat = DDR_COMPAT[gen] ?? ['DDR4', 'DDR5']
        if (!compat.includes(ddr)) {
          setDdr(compat[0])
          setMhzIdx(compat[0] === 'DDR4' ? 1 : 2)
        }
      }
      if (specs.ramGB) setRam(specs.ramGB >= 64 ? 3 : specs.ramGB >= 32 ? 2 : specs.ramGB >= 16 ? 1 : 0)
      setDetectedMsg('Config détectée et préremplie — vérifie le modèle exact.')
    } catch {
      setDetectedMsg('Détection impossible sur ce navigateur.')
    } finally {
      setScanning(false)
    }
  }

  const selectClass = 'w-full rounded-xl border border-white/[0.08] bg-[#0f0f12] px-3.5 py-2.5 text-[13px] text-white transition-all duration-150 hover:border-white/25 hover:bg-[#141418] focus:border-fmx-red/50 focus:outline-none'

  return (
    <section id="config" className="relative mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col scroll-mt-24 px-5 lg:px-10">
      <div className="mb-3 shrink-0 text-center">
        <h2 className="font-display text-[clamp(22px,3vw,30px)] font-extrabold tracking-tight text-white">
          Estimateur FPS
        </h2>
        <p className="mx-auto mt-1 max-w-[640px] text-[12px] leading-snug text-fmx-gray">
          CPU, GPU, RAM, jeu et résolution — moteur V3 calibré sur benchs réels.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <PcViewer3D fps={fps} gain={result.gain} refreshHz={refreshHz} gameLabel={`${game} • ${resolution}`} />
          </div>
          {/* Panneau résultats détaillés */}
          <div className="mt-3 grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <div className="text-[11px] uppercase tracking-wider text-fmx-gray">Avant FMX</div>
              <div className="text-[21px] font-extrabold leading-tight text-fmx-gray">{result.avgStock}</div>
              <div className="text-[11px] text-fmx-gray">FPS moyens</div>
            </div>
            <div className="rounded-xl border border-fmx-red/30 bg-fmx-red/[0.07] p-3 text-center">
              <div className="text-[11px] uppercase tracking-wider text-fmx-red">Après FMX</div>
              <div className="text-[21px] font-extrabold leading-tight text-white">{result.avg}</div>
              <div className="text-[11px] text-green-400">+{result.gain} FPS</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <div className="text-[11px] uppercase tracking-wider text-fmx-gray">1% Low</div>
              <div className="text-[21px] font-extrabold leading-tight text-white">{result.low1}</div>
              <div className="text-[11px] text-fmx-gray">fluidité min</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <div className="text-[11px] uppercase tracking-wider text-fmx-gray">Limite</div>
              <div className={`text-[18px] font-extrabold leading-tight ${result.bottleneck === 'Équilibré' ? 'text-green-400' : 'text-yellow-400'}`}>{result.bottleneck}</div>
              <div className="text-[11px] text-fmx-gray">{result.bottleneck === 'Équilibré' ? 'config équilibrée' : `bridé ${result.bottleneck} · ${result.bottleneckPct}%`}</div>
            </div>
          </div>
          {result.stutterRisk && (
            <p className="mt-2 shrink-0 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] p-2 text-center text-[11px] text-yellow-200/90">
              ⚠ 8 Go de RAM détectés — risque élevé de stutters. 16 Go minimum recommandé pour le compétitif.
            </p>
          )}
        </div>

        <div className="rounded-[20px] border border-white/[0.08] bg-fmx-carbon p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Configure ta config</h3>
              <p className="mt-0.5 text-[12px] text-fmx-gray">Scores issus de benchs Fortnite réels.</p>
            </div>
            <button
              onClick={handleDetect}
              disabled={scanning}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-fmx-red/40 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-fmx-red transition-all duration-150 hover:scale-105 hover:bg-fmx-red/10 hover:shadow-[0_0_16px_rgba(255,26,26,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <ScanLine className={`h-3.5 w-3.5 ${scanning ? 'animate-pulse' : ''}`} />
              {scanning ? 'Scan...' : 'Détecter'}
            </button>
          </div>
          {detectedMsg && <p className="mt-2 text-[11px] text-green-400">{detectedMsg}</p>}

          {/* GPU en cascade */}
          <div className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-gray-300">Carte graphique</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {(['NVIDIA', 'AMD'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => changeGpuBrand(b)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all duration-150 hover:scale-[1.03] hover:border-fmx-red/50 hover:shadow-[0_0_14px_rgba(255,26,26,0.2)] ${
                    gpuBrand === b ? 'border-fmx-red bg-fmx-red/15 text-fmx-red' : 'border-white/[0.08] bg-[#0f0f12] text-fmx-gray hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <select value={gpuRange} onChange={e => changeGpuRange(e.target.value)} className={selectClass} aria-label="Gamme GPU">
              {gpuRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <select
              value={gpuGen}
              onChange={e => { setGpuGen(e.target.value); setGpuIdx(0) }}
              className={selectClass}
              aria-label="Génération GPU"
            >
              {gpuGens.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={gpuIdx} onChange={e => setGpuIdx(Number(e.target.value))} className={selectClass} aria-label="Modèle GPU">
              {gpuModels.map((m, i) => <option key={m.name} value={i}>{m.name}</option>)}
            </select>
          </div>

          {/* CPU en cascade */}
          <div className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-gray-300">Processeur</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {(['AMD', 'Intel'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => changeCpuBrand(b)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all duration-150 hover:scale-[1.03] hover:border-fmx-red/50 hover:shadow-[0_0_14px_rgba(255,26,26,0.2)] ${
                    cpuBrand === b ? 'border-fmx-red bg-fmx-red/15 text-fmx-red' : 'border-white/[0.08] bg-[#0f0f12] text-fmx-gray hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <select value={cpuGen} onChange={e => changeCpuGen(e.target.value)} className={selectClass} aria-label="Génération CPU">
              {cpuGens.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="mt-2.5">
            <select value={cpuIdx} onChange={e => setCpuIdx(Number(e.target.value))} className={selectClass} aria-label="Modèle CPU">
              {cpuModels.map((m, i) => <option key={m.name} value={i}>{m.name}{m.score >= 1000 ? ' — X3D' : ''}</option>)}
            </select>
          </div>

          {/* RAM / DDR / Fréquence */}
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <select value={ram} onChange={e => setRam(Number(e.target.value))} className={selectClass} aria-label="RAM">
              {['8 Go', '16 Go', '32 Go', '64 Go'].map((o, i) => <option key={o} value={i}>RAM — {o}</option>)}
            </select>
            <select
              value={ddr}
              onChange={e => { const v = e.target.value as 'DDR4' | 'DDR5'; setDdr(v); setMhzIdx(v === 'DDR4' ? 1 : 2) }}
              className={selectClass}
              aria-label="Type de RAM"
              title={compatibleDdr.length === 1 ? `Seul ${compatibleDdr[0]} est compatible avec ce CPU` : ''}
            >
              {compatibleDdr.map(t => <option key={t} value={t}>{t}{compatibleDdr.length === 1 ? ' (imposé par le CPU)' : ''}</option>)}
            </select>
            <select value={mhzIdx} onChange={e => setMhzIdx(Number(e.target.value))} className={selectClass} aria-label="Fréquence RAM">
              {mhzOptions.map((o, i) => <option key={o.mhz} value={i}>{ddr} {o.mhz}</option>)}
            </select>
            <select value={resolution} onChange={e => setResolution(e.target.value)} className={selectClass} aria-label="Résolution">
              {Object.entries(RESOLUTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-[#0f0f12] px-3.5 py-2.5">
            <span className="text-[13px] font-bold text-white">Fortnite — Performance, illimité</span>
            <span className="shrink-0 rounded-full bg-fmx-red/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-fmx-red">CPU-bound</span>
          </div>
          {compatibleDdr.length === 1 && (
            <p className="mt-1.5 text-[11px] text-fmx-gray">
              Ton {cpuBrand} {cpuGen} ne supporte que la {compatibleDdr[0]} — c&apos;est déjà pris en compte.
            </p>
          )}

          {/* Offre */}
          <div className="mb-2 mt-3">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-300">
              Ce qui est inclus
            </label>
            <div className="mb-2 flex gap-2">
              {([20, 25, 50] as const).map(o => (
                <button
                  key={o}
                  onClick={() => setOffer(o)}
                  className={`flex-1 rounded-full py-2.5 text-xs font-extrabold transition-all duration-150 hover:scale-105 ${
                    offer === o ? 'border border-fmx-red bg-fmx-red text-white hover:shadow-[0_0_18px_rgba(255,26,26,0.45)]' : 'border border-white/[0.08] bg-white/[0.06] text-fmx-gray hover:border-white/25 hover:text-white'
                  }`}
                >
                  {o === 20 ? 'Windows 20€' : o === 25 ? 'Complet 25€' : 'Ultime 50€'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { short: 'Système', on: true, extra: '' },
                { short: 'Pilotes', on: true, extra: '' },
                { short: 'CM', on: offer >= 25, extra: offer >= 25 ? 'inclus' : '25€' },
                { short: 'Ultime', on: offer === 50, extra: offer === 50 ? 'inclus' : '50€' },
              ].map(f => (
                <div
                  key={f.short}
                  title={f.short === 'Système' ? 'Épuration système + priorités jeu' : f.short === 'Pilotes' ? 'Pilote GPU + réseau stabilisé' : f.short === 'CM' ? 'Carte mère : RAM haute vitesse + débridage' : 'Windows propre + UV/OC + suivi à vie'}
                  className={`truncate rounded-lg border px-2 py-2 text-center text-[11px] font-bold transition-colors ${
                    f.on ? 'border-fmx-red/35 bg-fmx-red/[0.07] text-white' : 'border-[#26262b] text-fmx-gray-dark'
                  }`}
                >
                  {f.on ? <span className="text-fmx-red">✓ </span> : <span>✕ </span>}
                  {f.short}{f.extra ? <span className={f.on ? 'text-fmx-red' : ''}> · {f.extra}</span> : null}
                </div>
              ))}
            </div>
          </div>

          {/* Prix + CTA */}
          <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-fmx-red/20 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #111113, #1a0a0a)' }}>
            <div className="flex items-baseline gap-2">
              <strong className="text-[24px] leading-none text-white">{offer}€</strong>
              <span className="text-[11px] text-fmx-gray">paiement unique</span>
            </div>
            <button onClick={() => onOrder(offer === 20 ? 'BASIC' : offer === 25 ? 'COMPLET' : 'ULTIME')} className="rounded-full bg-fmx-red px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(255,26,26,0.5)]">
              Commander →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
