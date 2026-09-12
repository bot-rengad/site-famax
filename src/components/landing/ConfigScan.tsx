'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, Monitor, Cpu, MemoryStick, Gauge, Wifi, ChevronDown, ChevronUp } from 'lucide-react'
import { detectHardware, DetectedSpecs } from '@/lib/utils/hardware-detect'
import { Button } from '@/components/ui/Button'

// Widget de scan automatique : détecte la config du visiteur dès l'arrivée sur le site
export function ConfigScan() {
  const [specs, setSpecs] = useState<DetectedSpecs | null>(null)
  const [scanning, setScanning] = useState(true)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    // Scan automatique au chargement de la page
    detectHardware()
      .then(specs => {
        setSpecs(specs)
        // Expose les specs détectées au chatbot FMX (contexte local uniquement)
        ;(window as unknown as { __fmxSpecs?: Partial<DetectedSpecs> }).__fmxSpecs = {
          gpuModel: specs.gpuModel,
          cpuCores: specs.cpuCores,
          ramGB: specs.ramGB,
          os: specs.os,
          refreshRateHz: specs.refreshRateHz,
        }
      })
      .catch(() => {})
      .finally(() => setScanning(false))
  }, [])

  const items = specs ? [
    { icon: Monitor, label: 'Carte graphique', value: specs.gpuModel || (specs.gpuRenderer ? 'Détectée' : null) },
    { icon: Cpu, label: 'Processeur', value: specs.cpuCores ? `${specs.cpuCores} threads` : null },
    { icon: MemoryStick, label: 'Mémoire', value: specs.ramGB ? `≥ ${specs.ramGB} Go` : null },
    { icon: Monitor, label: 'Système', value: specs.os },
    { icon: Gauge, label: 'Écran', value: specs.refreshRateHz ? `${specs.refreshRateHz} Hz` : null },
    { icon: Wifi, label: 'Connexion', value: specs.networkType ? specs.networkType.toUpperCase() : null },
  ] : []

  return (
    <section className="relative py-12 overflow-hidden" aria-label="Scan de votre configuration">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card max-w-4xl mx-auto overflow-hidden"
        >
          {/* En-tête cliquable */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between gap-4 p-5 lg:p-6 text-left"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 rounded-xl bg-fmx-red/10 border border-fmx-red/30 flex items-center justify-center flex-shrink-0">
                <ScanLine className={`w-5 h-5 text-fmx-red ${scanning ? 'animate-pulse' : ''}`} aria-hidden="true" />
                {!scanning && specs && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-fmx-black" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2 className="font-display font-semibold text-fmx-white">
                  {scanning ? 'Analyse de votre configuration...' : 'Aperçu de votre configuration'}
                </h2>
                <p className="text-xs text-fmx-gray mt-0.5">
                  {scanning
                    ? 'Lecture automatique de votre matériel par le navigateur'
                    : 'Détection indicative — ce n\'est pas votre config exacte, à compléter dans le panel client'}
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-fmx-gray flex-shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-fmx-gray flex-shrink-0" aria-hidden="true" />
            )}
          </button>

          {/* Résultats du scan */}
          <AnimatePresence initial={false}>
            {expanded && !scanning && specs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 lg:px-6 pb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="p-3.5 rounded-xl bg-fmx-carbon/60 border border-fmx-border/40">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-3.5 h-3.5 text-fmx-red" aria-hidden="true" />
                          <span className="text-[11px] uppercase tracking-wider text-fmx-gray">{item.label}</span>
                        </div>
                        <p className={`font-display font-medium text-sm break-words ${item.value ? 'text-fmx-white' : 'text-fmx-gray'}`}>
                          {item.value || 'Non exposé par le navigateur'}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <p className="px-5 lg:px-6 pb-5 text-xs text-fmx-gray">
                  Attention : il s&apos;agit d&apos;un aperçu indicatif, pas de votre config exacte — le navigateur ne peut pas tout voir
                  (modèle CPU précis, quantité de RAM exacte, etc.). Ton optimisation FMX sera ajustée sur ta configuration
                  complète que tu renseigneras dans ton panel client après achat.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {expanded && scanning && (
            <div className="px-5 lg:px-6 pb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-fmx-carbon/60 border border-fmx-border/40">
                <div className="w-5 h-5 border-2 border-fmx-red border-t-transparent rounded-full animate-spin flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-fmx-white-dim">Détection du GPU, CPU, RAM, système d&apos;exploitation et écran...</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
