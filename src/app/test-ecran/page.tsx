'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Play, Pause, RotateCcw, MonitorCheck } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { detectHardware } from '@/lib/utils/hardware-detect'

// Test fluidité façon UFO test : 4 lignes comparent le Hz natif de l'écran
// à 120 / 60 / 30 Hz simulés (mouvement quantifié comme Blur Busters).
// Vitesse constante en px/s, sync vsync native (rAF + dt).
const SPEEDS = [480, 960, 1920]
const SKIN_URL = 'https://fortnite-api.com/images/cosmetics/br/cid_349_athena_commando_m_banana/smallicon.png'

interface Stats {
  fps: number
  avgMs: number
  low1Ms: number
  dropped: number
}

// Soucoupe de repli si l'image Fortnite ne charge pas
function UfoFallback() {
  return (
    <svg viewBox="0 0 110 54" className="h-14 w-[110px] drop-shadow-[0_0_18px_rgba(255,26,26,0.55)]" aria-hidden="true">
      <ellipse cx="55" cy="38" rx="48" ry="12" fill="#1b1b20" stroke="#FF1A1A" strokeWidth="2" />
      <ellipse cx="55" cy="26" rx="22" ry="14" fill="#2a2a31" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <circle cx="28" cy="38" r="3.4" fill="#FF1A1A" />
      <circle cx="55" cy="41" r="3.4" fill="#FF1A1A" />
      <circle cx="82" cy="38" r="3.4" fill="#FF1A1A" />
    </svg>
  )
}

export default function TestEcranPage() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const graphRef = useRef<HTMLCanvasElement>(null)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(960)
  const [hz, setHz] = useState<number | null>(null)
  const [skinOk, setSkinOk] = useState(true)
  const [rates, setRates] = useState<number[]>([])
  const [stats, setStats] = useState<Stats>({ fps: 0, avgMs: 0, low1Ms: 0, dropped: 0 })

  // Refs mutées par la boucle (zéro re-render par frame)
  const sim = useRef({
    t: 0,
    last: 0,
    emaFps: 0,
    deltas: [] as number[],
    dropped: 0,
    frame: 0,
    running: true,
    speed: 960,
    hz: null as number | null,
    // Vérification honnête : changements de position réels par ligne et par seconde
    lastQ: [-1, -1, -1, -1],
    counts: [0, 0, 0, 0],
    rateT0: 0,
  })

  useEffect(() => { sim.current.running = running }, [running])
  useEffect(() => { sim.current.speed = speed }, [speed])

  // Hz réel de l'écran (mesuré, comme l'estimateur)
  useEffect(() => {
    detectHardware().then(s => {
      if (s.refreshRateHz) {
        setHz(s.refreshRateHz)
        sim.current.hz = s.refreshRateHz
      }
    }).catch(() => {})
  }, [])

  const reset = () => {
    sim.current.deltas = []
    sim.current.dropped = 0
    sim.current.emaFps = 0
    sim.current.lastQ = [-1, -1, -1, -1]
    sim.current.counts = [0, 0, 0, 0]
    sim.current.rateT0 = performance.now()
    setRates([])
    setStats({ fps: 0, avgMs: 0, low1Ms: 0, dropped: 0 })
  }

  // Lignes : Hz natif + divisions (÷1.5 / ÷2 / ÷4) comme UFO test
  const base = hz ?? 165
  const rows = [
    { key: 'native', fps: base, label: hz ? `Ton écran • ${hz} Hz` : 'Ton écran', hot: true },
    { key: 'd15', fps: base / 1.5, label: `${Math.round(base / 1.5)} Hz (÷1.5)`, hot: false },
    { key: 'd2', fps: base / 2, label: `${Math.round(base / 2)} Hz (÷2)`, hot: false },
    { key: 'd4', fps: base / 4, label: `${Math.round(base / 4)} Hz (÷4)`, hot: false },
  ]

  useEffect(() => {
    const s = sim.current
    s.last = performance.now()
    s.rateT0 = performance.now()
    let raf = 0

    const drawGraph = () => {
      const canvas = graphRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const W = canvas.width
      const H = canvas.height
      const interval = 1000 / (s.hz ?? 60)
      const maxMs = Math.max(34, interval * 2.5)
      ctx.clearRect(0, 0, W, H)
      const yTarget = H - (interval / maxMs) * H
      ctx.strokeStyle = 'rgba(34,197,94,0.5)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(0, yTarget)
      ctx.lineTo(W, yTarget)
      ctx.stroke()
      ctx.setLineDash([])
      const deltas = s.deltas.slice(-120)
      const bw = W / 120
      deltas.forEach((d, i) => {
        const h = Math.min(1, d / maxMs) * H
        ctx.fillStyle = d <= interval * 1.3 ? '#22c55e' : d <= interval * 1.8 ? '#fbbf24' : '#ff1a1a'
        ctx.fillRect(W - (deltas.length - i) * bw, H - h, Math.max(1, bw - 0.5), h)
      })
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dtMs = now - s.last
      s.last = now
      if (!s.running || dtMs <= 0 || dtMs > 250) return
      s.t += dtMs / 1000

      // Chaque ligne avance par pas de 1/fps : ÷4 saccade, natif est fluide.
      // Le -50% vertical est inclus ici (le transform inline écrase la classe).
      const trackW = rowRefs.current[0]?.parentElement?.clientWidth ?? 800
      const span = trackW + 160
      const b = s.hz ?? 165
      const list = [b, b / 1.5, b / 2, b / 4]
      list.forEach((fps, i) => {
        const el = rowRefs.current[i]
        if (!el) return
        const step = 1 / fps
        const q = Math.floor(s.t / step)
        if (q !== s.lastQ[i]) {
          s.lastQ[i] = q
          s.counts[i] += 1
        }
        const x = (s.speed * step * q) % span
        el.style.transform = `translate3d(${(x - 160).toFixed(1)}px,-50%,0)`
      })

      // Taux réel mesuré par ligne, chaque seconde
      if (now - s.rateT0 >= 1000) {
        setRates([...s.counts])
        s.counts = [0, 0, 0, 0]
        s.rateT0 = now
      }

      // Stats (raf natif)
      const interval = 1000 / (s.hz ?? 60)
      s.emaFps += (1000 / dtMs - s.emaFps) * 0.06
      s.deltas.push(dtMs)
      if (s.deltas.length > 240) s.deltas.shift()
      if (dtMs > interval * 1.8) s.dropped += 1
      s.frame += 1

      drawGraph()

      if (s.frame % 10 === 0) {
        const ds = [...s.deltas].sort((a, b) => a - b)
        const avg = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0
        const low1 = ds.length ? ds[Math.min(ds.length - 1, Math.floor(ds.length * 0.99))] : 0
        setStats({
          fps: Math.round(s.emaFps),
          avgMs: Math.round(avg * 10) / 10,
          low1Ms: Math.round(low1 * 10) / 10,
          dropped: s.dropped,
        })
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const fluid = hz !== null && stats.fps >= hz - 3 && stats.dropped === 0 && stats.fps > 0

  return (
    <div className="min-h-screen overflow-x-clip bg-fmx-black text-fmx-white">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10">
        <Link href="/" className="text-[13px] font-medium text-fmx-gray transition-colors hover:text-white">
          ← Accueil du site
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-display-sm text-fmx-white">Test fluidité écran</h1>
            <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-fmx-gray">
              Comme UFO test : Peely défile à vitesse constante. La 1re ligne tourne au Hz natif
              de ton écran, les autres simulent ÷1.5 / ÷2 / ÷4. Si la 1re saccade comme la ÷4,
              ton navigateur ne suit pas.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-bold">
            <MonitorCheck className="h-4 w-4 text-fmx-red" />
            {hz ? <span>Écran : {hz} Hz</span> : <span className="text-fmx-gray">Détection Hz…</span>}
          </div>
        </div>

        {/* 4 lignes comparatives — plein écran pour tracker jusqu'au bout */}
        <div className="relative left-1/2 mt-6 grid w-screen max-w-none -translate-x-1/2 gap-3">
          {rows.map((row, i) => (
            <div key={row.key} className={cn(
              'relative h-28 overflow-hidden border-y bg-[#0a0a0c]',
              row.hot ? 'border-fmx-red/40' : 'border-white/[0.08]'
            )}
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 120px)',
              }}
            >
              <span className={cn(
                'absolute left-5 top-2.5 z-10 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]',
                row.hot ? 'bg-fmx-red text-white' : 'border border-white/10 bg-black/60 text-fmx-gray'
              )}>
                {row.label}
              </span>
              <span className="absolute right-5 top-2.5 z-10 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[11px] font-bold text-green-400">
                {rates[i] != null ? `${rates[i]} Hz réels` : 'mesure…'}
              </span>
              <div
                ref={el => { rowRefs.current[i] = el }}
                className="absolute top-1/2 -translate-y-1/2 will-change-transform"
              >
                {skinOk ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={SKIN_URL}
                    alt="Peely Fortnite"
                    width={76}
                    height={76}
                    className="h-[76px] w-[76px] object-contain drop-shadow-[0_0_16px_rgba(255,26,26,0.45)]"
                    onError={() => setSkinOk(false)}
                    draggable={false}
                  />
                ) : (
                  <UfoFallback />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contrôles */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className="inline-flex items-center gap-2 rounded-full bg-fmx-red px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:-translate-y-px"
          >
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Lecture</>}
          </button>
          {SPEEDS.map(v => (
            <button
              key={v}
              onClick={() => setSpeed(v)}
              className={cn(
                'rounded-full border px-4 py-2.5 text-[13px] font-bold transition-colors',
                speed === v
                  ? 'border-fmx-red bg-fmx-red/[0.12] text-white'
                  : 'border-white/10 text-fmx-gray hover:text-white'
              )}
            >
              {v} px/s
            </button>
          ))}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[13px] font-bold text-fmx-gray transition-colors hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Reset stats
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'FPS mesurés', value: stats.fps ? `${stats.fps}` : '—', sub: hz ? `objectif ${hz}` : '…' },
            { label: 'Frame moyenne', value: stats.avgMs ? `${stats.avgMs} ms` : '—', sub: hz ? `vsync ${(1000 / hz).toFixed(1)} ms` : '…' },
            { label: 'Pire 1%', value: stats.low1Ms ? `${stats.low1Ms} ms` : '—', sub: 'pics de saccade' },
            { label: 'Frames sautées', value: `${stats.dropped}`, sub: stats.dropped === 0 ? 'aucune' : 'saccades vues' },
          ].map(c => (
            <div key={c.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <div className="text-[11px] uppercase tracking-wider text-fmx-gray">{c.label}</div>
              <div className="mt-1 text-[24px] font-extrabold text-white">{c.value}</div>
              <div className="text-[11px] text-fmx-gray">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Graphe temps de frame */}
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center justify-between text-[12px] text-fmx-gray">
            <b className="text-white">Temps par frame (120 dernières)</b>
            <span><span className="text-green-400">■</span> OK <span className="text-yellow-400">■</span> limite <span className="text-fmx-red">■</span> sautée</span>
          </div>
          <canvas ref={graphRef} width={880} height={120} className="h-[120px] w-full" />
        </div>

        {/* Verdict */}
        <div className={cn(
          'mt-4 rounded-2xl border p-4 text-[13px] leading-relaxed',
          fluid
            ? 'border-green-500/30 bg-green-500/[0.06] text-green-200'
            : 'border-white/[0.08] bg-white/[0.02] text-fmx-gray'
        )}>
          {stats.fps === 0 ? (
            <>Laisse tourner quelques secondes pour le verdict…</>
          ) : fluid ? (
            <><b className="text-white">Fluide à {hz} Hz.</b> Ton écran et ton navigateur suivent. Si l&apos;accueil saccade quand même, c&apos;est un calque de la landing — dis-le et on le traque.</>
          ) : (
            <><b className="text-white">Saccades détectées ici aussi</b> ({stats.dropped} frames sautées). Dans ce cas ça vient de ta machine : autre onglet lourd, économiseur batterie, GPU en économie d&apos;énergie, ou vsync forcée — pas du site.</>
          )}
        </div>

        <p className="mt-4 text-center text-[12px] text-fmx-gray">
          Astuce : passe en plein écran (F11), ferme les autres onglets, puis compare avec le scroll de l&apos;accueil.
        </p>
      </div>
    </div>
  )
}
