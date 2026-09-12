'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Cpu, Monitor, MemoryStick, HardDrive, Cpu as CpuIcon, Wifi, Gamepad2, MousePointer, Keyboard, CheckCircle, Loader2, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { detectHardware, DetectedSpecs } from '@/lib/utils/hardware-detect'

const emptyForm = {
  cpu: '',
  gpu: '',
  ram: '',
  motherboard: '',
  storage: '',
  os: '',
  favoriteGame: '',
  monitorRefresh: '',
  mouseDPI: '',
  keyboardPolling: '',
  cpuCores: null as number | null,
  gpuRenderer: null as string | null,
  autoDetected: false,
}

const hardwareOptions = {
  cpu: ['Intel i9-13900K', 'Intel i7-13700K', 'Intel i5-13600K', 'AMD Ryzen 9 7950X3D', 'AMD Ryzen 7 7800X3D', 'AMD Ryzen 5 7600X', 'Autre...'],
  gpu: ['NVIDIA RTX 4090 24GB', 'NVIDIA RTX 4080 16GB', 'NVIDIA RTX 3080 10GB', 'NVIDIA RTX 3070 8GB', 'AMD RX 7900 XTX 24GB', 'AMD RX 7800 XT 16GB', 'Autre...'],
  ram: ['16GB DDR4-3200', '16GB DDR5-5600', '32GB DDR4-3600', '32GB DDR5-6000 CL30', '32GB DDR5-7200', '64GB DDR5-6000', '64GB DDR5-7200', 'Autre...'],
  storage: ['Samsung 990 Pro 1TB', 'Samsung 990 Pro 2TB', 'Samsung 990 Pro 4TB', 'WD Black SN850X 1TB', 'WD Black SN850X 2TB', 'Crucial T700 2TB', 'Autre...'],
  os: ['Windows 11 Pro 23H2', 'Windows 11 Home 23H2', 'Windows 10 Pro 22H2', 'Windows 10 Enterprise LTSC'],
  monitorRefresh: ['60Hz', '75Hz', '120Hz', '144Hz', '165Hz', '240Hz', '360Hz', '540Hz'],
  mouseDPI: ['400', '800', '1200', '1600', '2400', '3200', 'Autre...'],
  keyboardPolling: ['125Hz', '250Hz', '500Hz', '1000Hz', '2000Hz', '4000Hz', '8000Hz'],
}

export default function ProfilePage() {
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectedSpecs | null>(null)

  // Charge le profil existant au montage de la page
  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        const profile = data.user?.profile
        if (profile) {
          const { id, userId, createdAt, updatedAt, ...rest } = profile
          setFormData(prev => ({ ...prev, ...rest }))
        }
      })
      .catch(() => {})
  }, [])

  // Détecte automatiquement la configuration du PC du visiteur
  const handleDetect = async () => {
    setDetecting(true)
    try {
      const specs = await detectHardware()
      setDetected(specs)
      setFormData(prev => ({
        ...prev,
        // Préremplit les champs avec ce que le navigateur a détecté
        gpu: specs.gpuModel || prev.gpu,
        os: specs.os === 'Windows 10/11'
          ? 'Windows 11 Pro 23H2'
          : specs.os && specs.os.startsWith('Windows')
            ? `${specs.os} Pro`
            : prev.os,
        ram: specs.ramGB ? `${specs.ramGB}GB DDR4` : prev.ram,
        monitorRefresh: specs.refreshRateHz ? `${specs.refreshRateHz}Hz` : prev.monitorRefresh,
        cpuCores: specs.cpuCores,
        gpuRenderer: specs.gpuRenderer,
        autoDetected: true,
      }))
      toast.success('Configuration détectée ! Vérifiez et complétez les détails.')
    } catch {
      toast.error('Échec de la détection automatique')
    } finally {
      setDetecting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Erreur sauvegarde')
      setSaved(true)
      toast.success('Profil mis à jour !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-display-sm text-fmx-white mb-1">Mon Profil Hardware</h1>
          <p className="text-fmx-white-dim">
            Configurez votre setup pour des recommandations d'optimisation précises et personnalisées.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDetect} loading={detecting} disabled={detecting || saving}>
            <ScanLine className={cn('w-4 h-4 mr-2', detecting && 'animate-pulse')} />
            {detecting ? 'Détection...' : 'Détecter ma config'}
          </Button>
          <Button variant="neon" onClick={handleSave} loading={saving} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
        </div>
      </motion.div>

      {/* Résultat de la détection automatique */}
      {detected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-fmx-red" />
                Matériel détecté par le navigateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                {[
                  { label: 'GPU', value: detected.gpuModel || detected.gpuRenderer || 'Non détecté' },
                  { label: 'Threads CPU', value: detected.cpuCores ? `${detected.cpuCores} threads` : 'Non détecté' },
                  { label: 'RAM (navigateur)', value: detected.ramGB ? `${detected.ramGB} Go+` : 'Non détecté' },
                  { label: 'OS', value: detected.os || 'Non détecté' },
                  { label: 'Écran', value: detected.refreshRateHz ? `${detected.refreshRateHz} Hz` : 'Non détecté' },
                  { label: 'Résolution', value: detected.screenResolution || 'Non détecté' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg bg-fmx-carbon/50 border border-fmx-border/40">
                    <p className="text-xs text-fmx-gray mb-1">{item.label}</p>
                    <p className="font-medium text-fmx-white text-xs break-words">{item.value}</p>
                  </div>
                ))}
              </div>
              {detected && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {formData.autoDetected && <Badge variant="green" dot>Config synchronisée avec votre profil</Badge>}
                  {!detected.gpuModel && (
                    <span className="text-xs text-fmx-gray">
                      Certaines infos (modèle CPU exact, quantité RAM précise) ne sont pas exposées par le navigateur : complétez-les manuellement.
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grid Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CPU / GPU / RAM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CpuIcon className="w-6 h-6 text-fmx-red" />
                Processeur & Carte Mère
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="cpu"
                label="Processeur (CPU)"
                value={formData.cpu}
                onChange={handleChange}
                options={hardwareOptions.cpu.map(o => ({ value: o, label: o }))}
                placeholder="Sélectionnez votre CPU"
              />
              <Input
                name="motherboard"
                label="Carte Mère (Modèle exact)"
                placeholder="Ex: MSI MPG Z790 Edge WiFi"
                value={formData.motherboard}
                onChange={handleChange}
                hint="Modèle complet pour vérification BIOS/XMP"
              />
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-fmx-red" />
                Carte Graphique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="gpu"
                label="Carte Graphique (GPU)"
                value={formData.gpu}
                onChange={handleChange}
                options={hardwareOptions.gpu.map(o => ({ value: o, label: o }))}
                placeholder="Sélectionnez votre GPU"
              />
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="w-6 h-6 text-fmx-red" />
                Mémoire & Stockage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="ram"
                label="Mémoire Vive (RAM)"
                value={formData.ram}
                onChange={handleChange}
                options={hardwareOptions.ram.map(o => ({ value: o, label: o }))}
                placeholder="Sélectionnez votre RAM"
                hint="Incluez fréquence et timings (ex: CL30) si possible"
              />
              <Select
                name="storage"
                label="Stockage Principal (OS/Jeux)"
                value={formData.storage}
                onChange={handleChange}
                options={hardwareOptions.storage.map(o => ({ value: o, label: o }))}
                placeholder="Sélectionnez votre SSD/NVMe"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar: OS, Jeu, Périphériques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-6 h-6 text-fmx-red" />
                Système & Jeu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="os"
                label="Système d'Exploitation"
                value={formData.os}
                onChange={handleChange}
                options={hardwareOptions.os.map(o => ({ value: o, label: o }))}
                placeholder="Sélectionnez votre OS"
              />
              <Input
                name="favoriteGame"
                label="Jeu Principal / Favori"
                placeholder="Ex: Fortnite, Valorant, CS2, Warzone..."
                value={formData.favoriteGame}
                onChange={handleChange}
                hint="Pour optimisations spécifiques par jeu"
              />
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-6 h-6 text-fmx-red" />
                Moniteur & Réseau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="monitorRefresh"
                label="Taux de Rafraîchissement"
                value={formData.monitorRefresh}
                onChange={handleChange}
                options={hardwareOptions.monitorRefresh.map(o => ({ value: o, label: o }))}
                placeholder="Hz de votre écran"
              />
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-6 h-6 text-fmx-red" />
                Périphériques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                name="mouseDPI"
                label="DPI Souris"
                value={formData.mouseDPI}
                onChange={handleChange}
                options={hardwareOptions.mouseDPI.map(o => ({ value: o, label: o }))}
                placeholder="DPI utilisé en jeu"
              />
              <Select
                name="keyboardPolling"
                label="Polling Rate Clavier"
                value={formData.keyboardPolling}
                onChange={handleChange}
                options={hardwareOptions.keyboardPolling.map(o => ({ value: o, label: o }))}
                placeholder="Hz de votre clavier"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Prochaines Étapes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" fullWidth className="justify-start gap-3 py-3 hover:bg-fmx-red/10">
                <span className="w-10 h-10 rounded-lg bg-fmx-red/10 flex items-center justify-center">
                  <CpuIcon className="w-5 h-5 text-fmx-red" />
                </span>
                <div className="text-left">
                  <p className="font-medium text-fmx-white">Checklist FMX</p>
                  <p className="text-xs text-fmx-gray">Lancer l'optimisation guidée</p>
                </div>
              </Button>
              <Button variant="ghost" fullWidth className="justify-start gap-3 py-3 hover:bg-blue-500/10" asChild>
                <a href="/dashboard/downloads">
                  <span className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-blue-400" />
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-fmx-white">Téléchargements</p>
                    <p className="text-xs text-fmx-gray">Scripts pour votre config</p>
                  </div>
                </a>
              </Button>
              <Button variant="ghost" fullWidth className="justify-start gap-3 py-3 hover:bg-yellow-500/10" asChild>
                <a href="/dashboard/ai-assistant">
                  <span className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-yellow-400" />
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-fmx-white">Assistant IA</p>
                    <p className="text-xs text-fmx-gray">Diagnostiquer un problème</p>
                  </div>
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}