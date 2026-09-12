'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Zap, Terminal, Bot, Loader2, Copy, Trash2, ChevronUp, ChevronDown,
  AlertCircle, CheckCircle, Info, Target, Download, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { CHECKLIST_CATEGORIES, ChecklistCategoryId } from '@/lib/checklist-categories'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  recommendations?: any[]
  quickActions?: any[]
}

interface Recommendation {
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  scriptId?: string
  checklistItemIds?: string[]
}

const quickPrompts = [
  { label: 'Micro-freeze en 1v1', query: 'Micro-freeze en 1v1 sur Valorant, FPS drops soudains' },
  { label: 'High ping / Packet loss', query: 'High ping 80ms sur serveur FR, packet loss 2-3%' },
  { label: 'Input lag souris', query: 'Input lag souris perceptible, décalage clic/tir' },
  { label: 'Stutter toutes les 30s', query: 'Stutter régulier toutes les 30 secondes environ' },
  { label: 'CPU 100% en jeu', query: 'CPU à 100% en jeu, FPS instables, ventilateurs à fond' },
  { label: 'Crash / BSOD aléatoire', query: 'Crash aléatoires ou BSOD pendant les sessions gaming' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [context, setContext] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [modalRec, setModalRec] = useState<Recommendation | null>(null)

  // Load user profile for context
  useEffect(() => {
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => setContext(data.user?.profile))
      .catch(() => {})
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Envoie un message à l'IA (utilisé par le formulaire et les prompts rapides)
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, context }),
      })

      if (!res.ok) throw new Error('Erreur IA')

      const data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.analysis,
        timestamp: new Date(),
        recommendations: data.recommendations,
        quickActions: data.quickActions,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Erreur de connexion à l\'assistant IA. Veuillez réessayer.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleQuickPrompt = (query: string) => {
    setInput(query)
    sendMessage(query)
  }

  const handleAction = (action: any) => {
    switch (action.action) {
      case 'run_script':
        if (action.payload?.scriptId) {
          window.open(`/dashboard/downloads?script=${action.payload.scriptId}`, '_blank')
        }
        break
      case 'open_checklist':
        if (action.payload?.category) {
          window.location.href = `/dashboard/checklist#${action.payload.category}`
        } else {
          window.location.href = '/dashboard/checklist'
        }
        break
      case 'open_downloads':
        window.location.href = '/dashboard/downloads'
        break
      case 'create_ticket':
        window.location.href = '/dashboard/tickets'
        break
    }
  }

  const openRecModal = (rec: Recommendation) => {
    setModalRec(rec)
  }

  const categoryColors: Record<string, string> = {
    'security': 'text-blue-400',
    'hardware-bios': 'text-orange-400',
    'system-registry': 'text-purple-400',
    'nvidia-drivers': 'text-green-400',
    'msi-affinity': 'text-red-400',
    'dedicated-software': 'text-yellow-400',
    'network': 'text-cyan-400',
    'game-optimization': 'text-pink-400',
  }

  const categoryNames: Record<string, string> = {
    'security': 'Sécurité',
    'hardware-bios': 'Matériel/BIOS',
    'system-registry': 'Système/Registre',
    'nvidia-drivers': 'Drivers NVIDIA',
    'msi-affinity': 'MSI/Affinity',
    'dedicated-software': 'Logiciels Dédiés',
    'network': 'Réseau',
    'game-optimization': 'Optimisation Jeux',
  }

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fmx-red to-fmx-red-dark flex items-center justify-center">
            <Bot className="w-7 h-7 text-fmx-white" />
          </div>
          <div>
            <h1 className="font-display text-display-sm text-fmx-white">Assistant IA FMX</h1>
            <p className="text-fmx-white-dim text-sm">Diagnostiquez vos problèmes performance en langage naturel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <Trash2 className="w-4 h-4 mr-1" />
            Nouveau chat
          </Button>
        </div>
      </motion.div>

      {/* Context Bar */}
      {context && (
        <Card variant="bordered" padding="sm" className="hidden md:block">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-fmx-gray">Contexte détecté :</span>
            {context.cpu && <Badge variant="gray" size="sm">{context.cpu}</Badge>}
            {context.gpu && <Badge variant="gray" size="sm">{context.gpu}</Badge>}
            {context.ram && <Badge variant="gray" size="sm">{context.ram}</Badge>}
            {context.os && <Badge variant="gray" size="sm">{context.os}</Badge>}
            {context.favoriteGame && <Badge variant="red" size="sm" icon={<Target className="w-3 h-3" />}>{context.favoriteGame}</Badge>}
          </div>
        </Card>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2" role="log" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && showSuggestions && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full py-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-fmx-red/10 flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-fmx-red" />
              </div>
              <h3 className="font-display text-heading-md text-fmx-white mb-2">Comment puis-je vous aider ?</h3>
              <p className="text-fmx-white-dim text-center max-w-md mb-8">
                Décrivez votre problème (ex: "Micro-freeze en 1v1", "High ping", "Input lag") et je vous donnerai des recommandations précises basées sur la checklist FMX.
              </p>
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {quickPrompts.map((prompt, i) => (
                  <motion.button
                    key={prompt.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleQuickPrompt(prompt.query)}
                    className="px-4 py-2 rounded-lg bg-fmx-carbon border border-fmx-border/50 text-fmx-white-dim hover:border-fmx-red/50 hover:bg-fmx-red/10 hover:text-fmx-white transition-all duration-200 text-sm text-left min-w-[200px]"
                  >
                    {prompt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                message.role === 'user'
                  ? 'bg-gradient-to-br from-fmx-red to-fmx-red-dark'
                  : 'bg-fmx-carbon border border-fmx-border/50'
              )}>
                {message.role === 'user' ? (
                  <Terminal className="w-5 h-5 text-fmx-white" />
                ) : (
                  <Bot className="w-5 h-5 text-fmx-red" />
                )}
              </div>

              <div className={cn(
                'flex-1 max-w-[85%]',
                message.role === 'user' ? 'text-right' : 'text-left'
              )}>
                <div className={cn(
                  'inline-block px-4 py-3 rounded-2xl',
                  message.role === 'user'
                    ? 'bg-fmx-red/20 border border-fmx-red/30 text-fmx-white'
                    : 'bg-fmx-carbon border border-fmx-border/50 text-fmx-white'
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Recommendations */}
                {message.role === 'assistant' && message.recommendations && message.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {message.recommendations.map((rec: Recommendation, i: number) => (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'justify-start gap-2 w-full',
                          rec.priority === 'high' && 'border-l-2 border-fmx-red',
                          rec.priority === 'medium' && 'border-l-2 border-yellow-400',
                          rec.priority === 'low' && 'border-l-2 border-blue-400'
                        )}
                        onClick={() => openRecModal(rec)}
                      >
                        <Badge
                          variant={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'}
                          size="sm"
                          className={cn(categoryColors[rec.category])}
                        >
                          {categoryNames[rec.category] || rec.category}
                        </Badge>
                        <span className="flex-1 text-left font-medium">{rec.title}</span>
                        <Info className="w-4 h-4 text-fmx-gray" />
                      </Button>
                    ))}
                  </motion.div>
                )}

                {/* Quick Actions */}
                {message.role === 'assistant' && message.quickActions && message.quickActions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {message.quickActions.map((action: any, i: number) => (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(action)}
                        className="gap-1.5"
                      >
                        {action.action === 'run_script' && <Download className="w-3.5 h-3.5" />}
                        {action.action === 'open_checklist' && <ExternalLink className="w-3.5 h-3.5" />}
                        {action.action === 'create_ticket' && <AlertCircle className="w-3.5 h-3.5" />}
                        {action.label}
                      </Button>
                    ))}
                  </motion.div>
                )}

                <div className="flex items-center justify-end gap-2 mt-1 text-xs text-fmx-gray">
                  <span>{message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-fmx-carbon border border-fmx-border/50 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-fmx-red" />
          </div>
          <div className="flex-1 max-w-[85%]">
            <div className="inline-block px-4 py-3 rounded-2xl bg-fmx-carbon border border-fmx-border/50">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-fmx-red animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-fmx-red animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-fmx-red animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Décrivez votre problème... (ex: 'Micro-freeze en 1v1 Valorant', 'Ping 100ms sur serveur FR')"
            rows={1}
            className={cn(
              'input-field w-full resize-none pr-16 min-h-[56px] max-h-48',
              'bg-fmx-carbon border-fmx-border focus:border-fmx-red'
            )}
            style={{ height: 'auto' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            disabled={loading}
            aria-label="Votre message"
          />
          <Button
            type="submit"
            variant="neon"
            size="sm"
            className="absolute right-2 bottom-2"
            disabled={!input.trim() || loading}
            loading={loading}
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-fmx-gray text-center mt-2">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-fmx-carbon border border-fmx-border rounded text-fmx-white">Entrée</kbd> pour envoyer,
          <kbd className="px-1.5 py-0.5 bg-fmx-carbon border border-fmx-border rounded text-fmx-white">Shift+Entrée</kbd> pour nouvelle ligne
        </p>
      </form>

      {/* Recommendation Detail Modal */}
      <Modal
        isOpen={!!modalRec}
        onClose={() => setModalRec(null)}
        title={modalRec?.title}
        size="lg"
      >
        {modalRec && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={modalRec.priority === 'high' ? 'red' : modalRec.priority === 'medium' ? 'yellow' : 'blue'}
                icon={<CheckCircle className="w-3 h-3" />}
              >
                Priorité: {modalRec.priority === 'high' ? 'Urgent' : modalRec.priority === 'medium' ? 'Recommandé' : 'Optionnel'}
              </Badge>
              <Badge variant="gray" className={cn(categoryColors[modalRec.category])}>
                {categoryNames[modalRec.category] || modalRec.category}
              </Badge>
            </div>

            <p className="text-fmx-white-dim">{modalRec.description}</p>

            {modalRec.scriptId && (
              <div className="p-3 rounded-lg bg-fmx-carbon border border-fmx-border/50">
                <p className="text-xs text-fmx-gray mb-1">Script associé :</p>
                <code className="font-mono text-fmx-red text-sm">{modalRec.scriptId}</code>
              </div>
            )}

            {modalRec.checklistItemIds && modalRec.checklistItemIds.length > 0 && (
              <div>
                <p className="text-xs text-fmx-gray mb-2">Éléments de checklist concernés :</p>
                <div className="flex flex-wrap gap-1">
                  {modalRec.checklistItemIds.map((id: string, i: number) => (
                    <Badge key={i} variant="gray" size="sm" className="font-mono text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="neon" onClick={() => {
                if (modalRec.scriptId) {
                  window.open(`/dashboard/downloads?script=${modalRec.scriptId}`, '_blank')
                }
                setModalRec(null)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Voir script / Télécharger
              </Button>
              <Button variant="ghost" onClick={() => {
                window.location.href = '/dashboard/checklist'
                setModalRec(null)
              }}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir dans la Checklist
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}