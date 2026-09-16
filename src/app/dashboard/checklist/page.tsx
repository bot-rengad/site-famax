'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Cpu, Database, Monitor, Zap, Settings, Globe, Gamepad2,
  Check, Copy, Download, ChevronDown, ChevronUp, AlertCircle, Info,
  Clock, Target, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress, CircularProgress, StepProgress } from '@/components/ui/Progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { CHECKLIST_CATEGORIES, ChecklistCategoryId } from '@/lib/checklist-categories'

// Checklist data matching seed
const checklistData: Record<ChecklistCategoryId, Array<{
  id: string
  title: string
  description: string
  script?: string
  scriptContent?: string
  requiresAdmin: boolean
  order: number
}>> = {
  'security': [
    { id: 'security-restore-point', title: 'Créer un point de restauration système', description: 'Avant toute modification, créez un point de restauration Windows pour pouvoir revenir en arrière en cas de problème.', script: 'restore_point.ps1', requiresAdmin: true, order: 1 },
    { id: 'security-sfc-dism', title: 'Vérifier l\'intégrité des fichiers système', description: 'Exécuter sfc /scannow et DISM pour réparer les fichiers corrompus.', script: 'sfc_dism.ps1', requiresAdmin: true, order: 2 },
  ],
  'hardware-bios': [
    { id: 'hardware-xmp', title: 'Activer XMP/EXPO dans le BIOS', description: 'Activer le profil mémoire XMP (Intel) ou EXPO (AMD) pour atteindre la fréquence annoncée de vos barrettes RAM.', requiresAdmin: false, order: 1 },
    { id: 'hardware-cstates', title: 'Désactiver les économies d\'énergie CPU (C-States)', description: 'Désactiver C-States, EIST, SpeedStep pour une latence constante.', script: 'bios_cstates_disable.md', requiresAdmin: false, order: 2 },
    { id: 'hardware-rebar', title: 'Activer Above 4G Decoding & Resizable BAR', description: 'Requis pour ReBAR/SAM sur GPU récentes. Activez dans BIOS > PCIe Settings.', requiresAdmin: false, order: 3 },
  ],
  'system-registry': [
    { id: 'system-hags', title: 'Activer GPU Scheduling (HAGS)', description: 'Windows 10/11: Paramètres > Système > Affichage > Graphiques > Changer les paramètres graphiques par défaut > Activer.', script: 'hags_enable.reg', requiresAdmin: true, order: 1 },
    { id: 'system-core-isolation', title: 'Désactiver Core Isolation (Memory Integrity)', description: 'Sécurité Windows > Isolation du noyau > Intégrité de la mémoire : DÉSACTIVÉ (requiert redémarrage).', script: 'disable_core_isolation.reg', requiresAdmin: true, order: 2 },
    { id: 'system-gpu-priority', title: 'Registre: GPU Priority 8 (Tasks) & 6 (Games)', description: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Scheduler\\Tasks\\GPU Priority = 8', script: 'registry_gpu_priority.reg', requiresAdmin: true, order: 3 },
    { id: 'system-sfio', title: 'Registre: High SFIO Priority & Scheduling', description: 'Priorité E/S haute pour les tâches multimédia. Clés: High SFIO Priority = 1, Scheduling Priority = High.', script: 'registry_sfio_priority.reg', requiresAdmin: true, order: 4 },
    { id: 'system-menushowdelay', title: 'MenuShowDelay = 0', description: 'Supprime le délai d\'affichage des menus pour une UI plus réactive.', script: 'registry_menushowdelay.reg', requiresAdmin: true, order: 5 },
    { id: 'system-debloat', title: 'Debloat Windows & Désactiver Télémétrie', description: 'Supprimer apps préinstallées, désactiver télémétrie, services inutiles (DiagTrack, WSearch, etc.).', script: 'debloat.ps1', requiresAdmin: true, order: 6 },
  ],
  'nvidia-drivers': [
    { id: 'nvidia-power', title: 'Mode Gestion Alimentation: Performance Maximale', description: 'Panneau NVIDIA > Gérer les paramètres 3D > Mode gestion de l\'alimentation = Préférer les performances maximales.', requiresAdmin: false, order: 1 },
    { id: 'nvidia-low-latency', title: 'Faible Latence: Ultra', description: 'Panneau NVIDIA > Faible latence = Ultra (réduit la file d\'attente de rendu CPU).', requiresAdmin: false, order: 2 },
    { id: 'nvidia-threaded', title: 'Qualité: Haute Performance + Optimisation Threadée', description: 'Filtrage texture: Haute performance, Optimisation threadée: Activé.', requiresAdmin: false, order: 3 },
    { id: 'nvidia-overlay', title: 'Désactiver Overlay GeForce Experience', description: 'GeForce Experience > Paramètres > Général > Partage > DÉSACTIVÉ (gain 2-3% FPS).', script: 'disable_gfe_overlay.reg', requiresAdmin: false, order: 4 },
    { id: 'nvidia-shader-cache', title: 'Cache Shaders: Activé (10GB)', description: 'Taille cache: 10GB (ou max), réduit les micro-freeze de compilation shader.', requiresAdmin: false, order: 5 },
  ],
  'msi-affinity': [
    { id: 'msi-gpu', title: 'Activer MSI sur GPU (Message Signaled Interrupts)', description: 'Utiliser MSI Utility v3: Sélectionner GPU > Activer MSI Mode > Priorité High.', script: 'gpu_msi_enable.ps1', requiresAdmin: true, order: 1 },
    { id: 'msi-ethernet', title: 'Activer MSI sur Carte Réseau Ethernet', description: 'Gestionnaire de périphériques > Carte réseau > Propriétés > MSI: Activé, Priorité: High.', script: 'ethernet_msi_enable.ps1', requiresAdmin: true, order: 2 },
    { id: 'msi-usb', title: 'Activer MSI sur Contrôleurs USB', description: 'Gestionnaire > Contrôleurs de bus USB > Chaque contrôleur: MSI Activé.', script: 'usb_msi_enable.ps1', requiresAdmin: true, order: 3 },
    { id: 'affinity-intpolicy', title: 'Configurer IntPolicy.exe (Affinité CPU Jeu)', description: 'SetProcessAffinityMask: Masque sans cœurs 0/1 (système). Dédier cœurs physiques au jeu.', script: 'intpolicy_config.ps1', requiresAdmin: true, order: 4 },
  ],
  'dedicated-software': [
    { id: 'parkcontrol', title: 'ParkControl: Bitsum Highest Performance', description: 'Désactiver complètement le stationnement des cœurs (Core Parking). Profil: Bitsum Highest Performance.', script: 'parkcontrol_config.ini', requiresAdmin: false, order: 1 },
    { id: 'processlasso', title: 'Process Lasso: Priorité Processus Élevée', description: 'Lancement auto, Priorité processeur: Élevée, Priorité E/S: Haute, Exclure de ProBalance.', script: 'processlasso_config.ini', requiresAdmin: false, order: 2 },
    { id: 'islc', title: 'ISLC: Timer Resolution 0.50ms + Seuil RAM', description: 'Timer Resolution: 0.50ms, Seuil RAM Standby: 1024MB (32GB), 2048MB (64GB). Lancement auto.', script: 'islc_config.ini', requiresAdmin: true, order: 3 },
  ],
  'network': [
    { id: 'network-green-ethernet', title: 'Désactiver Green Ethernet (Économie d\'énergie)', description: 'Gestionnaire > Carte réseau > Gestion de l\'alimentation > Décocher "Autoriser l\'ordinateur à éteindre ce périphérique".', script: 'disable_green_ethernet.ps1', requiresAdmin: true, order: 1 },
    { id: 'network-speed-duplex', title: 'Forcer Speed & Duplex 1.0 Gbps Full Duplex', description: 'Propriétés carte réseau > Avancé > Speed & Duplex = 1.0 Gbps Full Duplex (pas Auto).', script: 'force_speed_duplex.ps1', requiresAdmin: true, order: 2 },
    { id: 'network-dns', title: 'DNS Cloudflare 1.1.1.1 / 1.0.0.1 + DoH', description: 'IPv4: 1.1.1.1 / 1.0.0.1, IPv6: 2606:4700:4700::1111 / ::1001. DoH: Activé.', script: 'dns_cloudflare.ps1', requiresAdmin: true, order: 3 },
    { id: 'network-purge', title: 'Scripts Purge DNS / Winsock / IP', description: 'ipconfig /flushdns, netsh winsock reset, netsh int ip reset. Exécuter en admin.', script: 'network_purge_all.bat', requiresAdmin: true, order: 4 },
    { id: 'network-qos', title: 'QoS Gaming & Optimisation TCP/IP', description: 'Désactiver Nagle Algorithm (TcpAckFrequency=1), TCP Window Scaling, MTU optimisé (1472).', script: 'qos_gaming_tcpip.ps1', requiresAdmin: true, order: 5 },
  ],
  'game-optimization': [
    { id: 'game-fso', title: 'Désactiver Optimisations Plein Écran (FSO)', description: 'Propriétés .exe jeu > Compatibilité > Désactiver les optimisations plein écran. Force DPI: Application.', script: 'disable_fso_all_games.ps1', requiresAdmin: false, order: 1 },
    { id: 'game-dpi', title: 'DPI Scaling: Application (pas Système)', description: 'Évite le scaling Windows qui ajoute de la latence. Override DPI scaling behavior.', script: 'dpi_scaling_fix.reg', requiresAdmin: false, order: 2 },
    { id: 'game-configs', title: 'Configs Jeu Spécifiques (Fortnite/Valorant/CS2)', description: 'Launch options, GameUserSettings.ini, NVIDIA Profile Inspector par jeu.', script: 'game_configs_pack.zip', requiresAdmin: false, order: 3 },
  ],
}

const categoryIcons: Record<ChecklistCategoryId, any> = {
  'security': Shield,
  'hardware-bios': Cpu,
  'system-registry': Database,
  'nvidia-drivers': Monitor,
  'msi-affinity': Zap,
  'dedicated-software': Settings,
  'network': Globe,
  'game-optimization': Gamepad2,
}

export default function ChecklistPage() {
  const [progress, setProgress] = useState<Record<string, { completed: boolean; notes: string }>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [scriptModal, setScriptModal] = useState<{ open: boolean; item: any; category: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ChecklistCategoryId>('security')

  // Load progress on mount + lien profond depuis l'assistant (/dashboard/checklist#<categorie>)
  useEffect(() => {
    try {
      const hash = window.location.hash.replace('#', '') as ChecklistCategoryId
      if (hash && CHECKLIST_CATEGORIES.some(c => c.id === hash)) setActiveTab(hash)
    } catch {}
    fetch('/api/checklist')
      .then(res => res.json())
      .then(data => {
        const prog: Record<string, { completed: boolean; notes: string }> = {}
        Object.values(data.checklist).flat().forEach((item: any) => {
          prog[item.id] = { completed: item.completed, notes: item.notes || '' }
        })
        setProgress(prog)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Save progress
  const toggleItem = async (itemId: string, category: ChecklistCategoryId) => {
    const newCompleted = !progress[itemId]?.completed
    const newProgress = { ...progress, [itemId]: { completed: newCompleted, notes: progress[itemId]?.notes || '' } }
    setProgress(newProgress)

    try {
      await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItemId: itemId.replace(`checklist-${category}-`, ''), completed: newCompleted }),
      })
    } catch (e) {
      // Revert on error
      setProgress(progress)
    }
  }

  const updateNotes = (itemId: string, notes: string) => {
    setProgress(prev => ({ ...prev, [itemId]: { ...prev[itemId], notes } }))
  }

  const openScript = (item: any, category: string) => {
    setScriptModal({ open: true, item, category })
  }

  const handleSaveNotes = async (itemId: string) => {
    try {
      await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItemId: itemId, completed: progress[itemId]?.completed, notes: progress[itemId]?.notes }),
      })
    } catch (e) {
      console.error('Failed to save notes')
    }
  }

  // Calculate stats
  const allItems = Object.values(checklistData).flat()
  const totalItems = allItems.length
  const completedItems = allItems.filter(item => progress[item.id]?.completed).length
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const categoryStats = CHECKLIST_CATEGORIES.map(cat => {
    const items = checklistData[cat.id] || []
    const catCompleted = items.filter(item => progress[item.id]?.completed).length
    return { ...cat, completed: catCompleted, total: items.length, percent: items.length > 0 ? Math.round((catCompleted / items.length) * 100) : 0 }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Global Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <h1 className="font-display text-display-sm text-fmx-white mb-1">Checklist FMX Optimisation</h1>
          <p className="text-fmx-white-dim">Guide pas à pas — {totalItems} étapes sur 8 catégories pour une optimisation complète</p>
        </div>
        <div className="flex items-center gap-6">
          <CircularProgress value={completionPercent} size={80} strokeWidth={6} showLabel />
          <div>
            <div className="font-display text-heading-lg text-fmx-white">{completedItems}/{totalItems} modules complétés</div>
            <Progress value={completionPercent} max={100} className="w-64" animated striped />
          </div>
        </div>
      </motion.div>

      {/* Category Progress Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3"
      >
        {categoryStats.map((cat) => {
          const Icon = categoryIcons[cat.id]
          return (
            <Card key={cat.id} variant="glass" padding="md" className="text-center hover:border-fmx-red/30 transition-all duration-200 group">
              <Icon className="w-6 h-6 mx-auto mb-2 text-fmx-red group-hover:scale-110 transition-transform" />
              <p className="font-display font-medium text-sm text-fmx-white">{cat.name}</p>
              <p className="text-fmx-red font-display text-lg">{cat.percent}%</p>
              <Progress value={cat.percent} max={100} size="sm" className="mt-2" animated />
            </Card>
          )
        })}
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onChange={(v) => setActiveTab(v as ChecklistCategoryId)} className="w-full">
        <TabsList className="w-full flex-wrap gap-2">
          {CHECKLIST_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id]
            const stats = categoryStats.find(s => s.id === cat.id)
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="flex-1 min-w-0 justify-center gap-2 py-3">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.name}</span>
                {stats && stats.percent === 100 && <Check className="w-3.5 h-3.5 text-green-400" />}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {CHECKLIST_CATEGORIES.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <AnimatePresence mode="wait">
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4 mt-6">
                  {checklistData[cat.id].map((item, index) => {
                    const itemProgress = progress[item.id] || { completed: false, notes: '' }
                    const Icon = categoryIcons[cat.id]
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={cn(
                          'glass-card p-4 relative overflow-hidden transition-all duration-300',
                          itemProgress.completed && 'border-fmx-red/30 bg-fmx-red/5'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleItem(item.id, cat.id)}
                            className={cn(
                              'relative w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
                              itemProgress.completed
                                ? 'bg-fmx-red border-fmx-red text-fmx-white'
                                : 'border-fmx-border text-fmx-gray hover:border-fmx-red/50'
                            )}
                            aria-label={itemProgress.completed ? 'Marquer comme non fait' : 'Marquer comme fait'}
                          >
                            {itemProgress.completed && <Check className="w-4 h-4" />}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-fmx-carbon border border-fmx-border/50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-fmx-red" />
                              </div>
                              <div className="flex-1">
                                <h4 className={cn('font-display font-medium text-fmx-white', itemProgress.completed && 'line-through text-fmx-white-dim')}>
                                  {item.title}
                                </h4>
                                <p className="text-fmx-white-dim text-sm mt-1">{item.description}</p>

                                {/* Script Actions */}
                                {item.script && (
                                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openScript(item, cat.id)}
                                      className="gap-1.5 px-3"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Copier script
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const content = item.scriptContent || `# ${item.title}\n# Script: ${item.script}\n# TODO: Contenu du script`
                                        navigator.clipboard.writeText(content)
                                      }}
                                      className="gap-1.5 px-3"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Télécharger
                                    </Button>
                                    {item.requiresAdmin && (
                                      <Badge variant="yellow" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                                        Admin requis
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Notes */}
                                <div className="mt-3">
                                  <textarea
                                    value={itemProgress.notes}
                                    onChange={e => updateNotes(item.id, e.target.value)}
                                    onBlur={() => handleSaveNotes(item.id)}
                                    placeholder="Vos notes privées (ex: valeurs BIOS, version driver, résultats bench...)"
                                    className="w-full px-3 py-2 rounded-lg bg-fmx-black border border-fmx-border/50 text-fmx-white placeholder-fmx-gray text-sm focus:border-fmx-red focus:ring-1 focus:ring-fmx-red resize-none min-h-[60px]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse for long descriptions */}
                          {item.description.length > 200 && (
                            <button
                              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                              className="flex-shrink-0 p-1 text-fmx-gray hover:text-fmx-white transition-colors"
                            >
                              {expanded === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          )}
                        </div>

                        {expanded === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-fmx-border/50 text-sm text-fmx-white-dim"
                          >
                            <p>{item.description}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {/* Script Modal */}
      <Modal
        isOpen={!!scriptModal}
        onClose={() => setScriptModal(null)}
        title={scriptModal?.item.title}
        size="xl"
      >
        {scriptModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-fmx-white-dim">
              <Badge variant="gray" icon={<Info className="w-3 h-3" />}>
                {scriptModal.category}
              </Badge>
              {scriptModal.item.requiresAdmin && (
                <Badge variant="yellow" icon={<AlertCircle className="w-3 h-3" />}>
                  Exécution Admin requise
                </Badge>
              )}
            </div>
            <div className="relative">
              <pre className="bg-fmx-black border border-fmx-border rounded-lg p-4 overflow-x-auto max-h-96">
                <code className="font-mono text-sm text-fmx-white-dim whitespace-pre-wrap">
                  {scriptModal.item.scriptContent || `# ${scriptModal.item.title}\n# Fichier: ${scriptModal.item.script}\n# Contenu non disponible dans la démo.\n# Téléchargez le fichier complet depuis l'onglet Téléchargements.`}
                </code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => navigator.clipboard.writeText(scriptModal.item.scriptContent || '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setScriptModal(null)}>Fermer</Button>
              <Button variant="neon" onClick={() => {
                navigator.clipboard.writeText(scriptModal.item.scriptContent || '')
                setScriptModal(null)
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Tout copier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}