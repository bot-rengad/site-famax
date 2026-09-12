'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Copy, FileCode, Terminal, Shield, Cpu, Globe, Gamepad2, Settings,
  Zap, Lock, ExternalLink, Filter, ChevronDown, X
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'

interface Script {
  id: string
  name: string
  description: string
  category: string
  content: string
  version: string
  requiresAdmin: boolean
  downloadCount: number
  createdAt: string
}

const categoryConfig: Record<string, { icon: any; color: string; label: string; requiredPack: string }> = {
  'SYSTEM_CLEANUP': { icon: Shield, color: 'text-blue-400', label: 'Nettoyage Système', requiredPack: 'BASIC' },
  'TIMER_RESOLUTION': { icon: Zap, color: 'text-yellow-400', label: 'Timer Resolution', requiredPack: 'BASIC' },
  'POWER_MANAGEMENT': { icon: Cpu, color: 'text-orange-400', label: 'Gestion Alimentation', requiredPack: 'PRO' },
  'REGISTRY_TWEAKS': { icon: Settings, color: 'text-purple-400', label: 'Registre', requiredPack: 'PRO' },
  'GPU_OPTIMIZATION': { icon: Cpu, color: 'text-green-400', label: 'GPU / NVIDIA', requiredPack: 'PRO' },
  'NETWORK_OPTIMIZATION': { icon: Globe, color: 'text-cyan-400', label: 'Réseau', requiredPack: 'PRO' },
  'GAME_SPECIFIC': { icon: Gamepad2, color: 'text-pink-400', label: 'Jeux Spécifiques', requiredPack: 'PRO' },
  'DEBLOAT': { icon: Shield, color: 'text-red-400', label: 'Debloat / Privacy', requiredPack: 'BASIC' },
  'FULL_AUTOMATION': { icon: Zap, color: 'text-fmx-red', label: 'Automatisation Complète', requiredPack: 'ULTIMATE' },
}

const categoryOrder = [
  'SYSTEM_CLEANUP', 'TIMER_RESOLUTION', 'POWER_MANAGEMENT', 'REGISTRY_TWEAKS',
  'GPU_OPTIMIZATION', 'NETWORK_OPTIMIZATION', 'GAME_SPECIFIC', 'DEBLOAT', 'FULL_AUTOMATION'
]

export default function DownloadsPage() {
  const [scripts, setScripts] = useState<Record<string, Script[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [userPack, setUserPack] = useState<'BASIC' | 'PRO' | 'ULTIMATE'>('PRO')
  const [modalScript, setModalScript] = useState<Script | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/scripts')
      .then(res => res.json())
      .then(data => {
        setScripts(data.scripts || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Get user license for pack detection
    fetch('/api/licenses')
      .then(res => res.json())
      .then(data => {
        const activeLicense = data.licenses?.find((l: any) => l.status === 'ACTIVE')
        if (activeLicense) setUserPack(activeLicense.packageType as any)
      })
      .catch(() => {})
  }, [])

  const allScripts = Object.values(scripts).flat()
  const filteredScripts = allScripts.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getPackLevel = (pack: string) => {
    const levels = { BASIC: 1, PRO: 2, ULTIMATE: 3 }
    return levels[pack as keyof typeof levels] || 1
  }

  const canAccess = (requiredPack: string) => getPackLevel(userPack) >= getPackLevel(requiredPack)

  const handleDownload = async (script: Script) => {
    setDownloading(script.id)
    try {
      const res = await fetch(`/api/scripts?id=${script.id}`)
      const data = await res.json()
      if (data.script?.content) {
        const blob = new Blob([data.script.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${script.name.replace(/\s+/g, '_')}.${script.category === 'REGISTRY_TWEAKS' ? 'reg' : script.category.includes('POWER') || script.category.includes('FULL') ? 'ini' : 'ps1'}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error('Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const handleCopy = async (script: Script) => {
    try {
      const res = await fetch(`/api/scripts?id=${script.id}`)
      const data = await res.json()
      if (data.script?.content) {
        await navigator.clipboard.writeText(data.script.content)
      }
    } catch (e) {
      console.error('Copy failed')
    }
  }

  const categories = ['ALL', ...categoryOrder.filter(c => scripts[c]?.length)]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-display-sm text-fmx-white mb-1">Téléchargements</h1>
          <p className="text-fmx-white-dim">
            Scripts d'automatisation PowerShell, Batch, Registre (.reg) et configs (.ini)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={userPack === 'BASIC' ? 'gray' : userPack === 'PRO' ? 'red' : 'yellow'} icon={<Shield className="w-3 h-3" />}>
            Pack {userPack}
          </Badge>
          <span className="text-fmx-white-dim text-sm">
            {userPack === 'BASIC' && 'Mettez à niveau pour accéder aux scripts avancés'}
            {userPack === 'PRO' && 'Accès complet aux scripts Pro'}
            {userPack === 'ULTIMATE' && 'Accès illimité + scripts Ultimate'}
          </span>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <Card variant="glass" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fmx-gray" />
            <Input
              placeholder="Rechercher un script..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeCategory} onChange={setActiveCategory} className="flex-1">
            <TabsList className="flex-wrap">
              {categories.map(cat => {
                const config = categoryConfig[cat]
                const count = cat === 'ALL' ? filteredScripts.length : scripts[cat]?.length || 0
                return (
                  <TabsTrigger key={cat} value={cat} className="flex-1 min-w-0 justify-center gap-1 py-2">
                    {config && <config.icon className={cn('w-4 h-4', config.color)} />}
                    <span className="hidden sm:inline truncate">{config?.label || cat}</span>
                    <span className="text-xs text-fmx-gray">{count}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Scripts Grid */}
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} variant="glass" padding="lg" className="animate-pulse">
              <div className="h-6 bg-fmx-border rounded w-3/4 mb-4" />
              <div className="h-4 bg-fmx-border rounded w-1/2 mb-2" />
              <div className="h-4 bg-fmx-border rounded w-1/3" />
            </Card>
          ))}
        </div>
      ) : filteredScripts.length === 0 ? (
        <Card variant="glass" padding="xl" className="text-center">
          <FileCode className="w-16 h-16 mx-auto mb-4 text-fmx-gray" />
          <h3 className="font-display text-heading-md text-fmx-white mb-2">Aucun script trouvé</h3>
          <p className="text-fmx-white-dim">Essayez de modifier votre recherche ou vos filtres</p>
          <Button variant="ghost" onClick={() => { setSearch(''); setActiveCategory('ALL') }} className="mt-4">
            <X className="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </Card>
      ) : (
        <Tabs value={activeCategory} onChange={setActiveCategory}>
          {categoryOrder.map(cat => {
            const config = categoryConfig[cat]
            const catScripts = scripts[cat] || []
            if (catScripts.length === 0) return null

            const Icon = config.icon
            return (
              <TabsContent key={cat} value={cat}>
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mt-6"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-7 h-7', config.color)} />
                    <div>
                      <h2 className="font-display text-heading-lg text-fmx-white">{config.label}</h2>
                      <p className="text-fmx-white-dim text-sm">{catScripts.length} script(s) disponible(s)</p>
                    </div>
                    <Badge variant={userPack === 'ULTIMATE' || (userPack === 'PRO' && config.requiredPack !== 'ULTIMATE') || (userPack === 'BASIC' && config.requiredPack === 'BASIC') ? 'green' : 'yellow'} size="sm">
                      {config.requiredPack} requis
                    </Badge>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    {catScripts.map((script, index) => {
                      const hasAccess = canAccess(config.requiredPack)
                      return (
                        <motion.div
                          key={script.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'glass-card p-4 relative overflow-hidden group transition-all duration-300',
                            !hasAccess && 'opacity-60 border-fmx-border/30'
                          )}
                        >
                          {!hasAccess && (
                            <div className="absolute inset-0 bg-fmx-black/50 flex items-center justify-center z-10">
                              <Lock className="w-8 h-8 text-fmx-gray" />
                            </div>
                          )}

                          <div className={cn('relative z-10', !hasAccess && 'pointer-events-none')}>
                            <div className="flex items-start gap-3 mb-3">
                              <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                config.color.replace('text-', 'bg-').replace('400', '/20')
                              )}>
                                <Icon className={cn('w-6 h-6', config.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={cn('font-display font-medium text-fmx-white truncate', !hasAccess && 'text-fmx-gray')}>
                                  {script.name}
                                </h3>
                                <p className={cn('text-sm mt-1 truncate', !hasAccess && 'text-fmx-gray')}>
                                  {script.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-fmx-gray mb-3">
                              <span className="font-mono">{script.version}</span>
                              <span className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" />
                                {script.downloadCount.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={hasAccess ? 'neon' : 'ghost'}
                                size="sm"
                                className="flex-1 min-w-0 justify-center gap-1.5"
                                onClick={() => handleDownload(script)}
                                loading={downloading === script.id}
                                disabled={!hasAccess || downloading === script.id}
                              >
                                <Download className="w-3.5 h-3.5" />
                                {downloading === script.id ? 'Téléchargement...' : 'Télécharger'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(script)}
                                disabled={!hasAccess}
                                className="gap-1.5"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalScript(script)}
                                disabled={!hasAccess}
                                className="gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Voir
                              </Button>
                            </div>

                            {!hasAccess && (
                              <p className="text-xs text-fmx-gray mt-2 text-center">
                                Nécessite le pack <span className="font-medium text-fmx-red">{config.requiredPack}</span>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </TabsContent>
            )
          })}
        </Tabs>
      )}

      {/* Script View Modal */}
      <Modal
        isOpen={!!modalScript}
        onClose={() => setModalScript(null)}
        title={modalScript?.name}
        size="xl"
      >
        {modalScript && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gray" icon={<FileCode className="w-3 h-3" />}>
                {modalScript.category}
              </Badge>
              {modalScript.requiresAdmin && (
                <Badge variant="yellow" icon={<Shield className="w-3 h-3" />}>
                  Admin requis
                </Badge>
              )}
              <Badge variant="green" size="sm">
                v{modalScript.version}
              </Badge>
            </div>
            <p className="text-fmx-white-dim">{modalScript.description}</p>
            <div className="relative">
              <pre className="bg-fmx-black border border-fmx-border rounded-lg p-4 overflow-x-auto max-h-96">
                <code className="font-mono text-sm text-fmx-white-dim whitespace-pre-wrap">
                  {modalScript.content}
                </code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(modalScript)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setModalScript(null)}>Fermer</Button>
              <Button variant="neon" onClick={() => { handleCopy(modalScript); setModalScript(null) }}>
                <Copy className="w-4 h-4 mr-2" />
                Tout copier
              </Button>
              <Button variant="ghost" onClick={() => handleDownload(modalScript)}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}