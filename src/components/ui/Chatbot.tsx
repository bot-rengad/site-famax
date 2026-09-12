'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface Message {
  id: number
  role: 'user' | 'bot'
  content: string
  quickReplies?: string[]
}

// Rend le markdown simple (**gras**) utilisé dans les réponses du bot
function renderBold(text: string) {
  return text.split('\n').map((line, li) => (
    <span key={li}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={pi} className="text-fmx-white font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={pi}>{part}</span>
        )
      )}
      {li < text.split('\n').length - 1 && <br />}
    </span>
  ))
}

const WELCOME: Message = {
  id: 0,
  role: 'bot',
  content:
    "Salut ! Je suis l'assistant FMX. Pose-moi tes questions sur l'optimisation : prix, résultats, compatibilité avec ta config...",
  quickReplies: ['Ça coûte combien ?', 'Quels résultats ?', 'Compatible avec mon PC ?', 'Chutes de FPS'],
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Envoi d'un message au moteur FMX avec la config détectée du visiteur
  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: trimmed }])
    setLoading(true)

    try {
      // Contexte optionnel : specs détectées par le scan de la page d'accueil
      const context = (window as unknown as { __fmxSpecs?: Record<string, unknown> }).__fmxSpecs

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context }),
      })
      const data = await res.json()

      // Petit délai pour un rendu naturel
      await new Promise(r => setTimeout(r, 450))

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: data.reply,
        quickReplies: data.quickReplies || [],
      }])
      if (!open) setUnread(true)
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: 'Connexion perdue. Réessaie dans un instant !',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReply = (q: string) => sendMessage(q)

  const toggleOpen = () => {
    setOpen(o => !o)
    setUnread(false)
  }

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={toggleOpen}
        className={cn(
          'fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-neon-red transition-all duration-300',
          'bg-gradient-to-br from-fmx-red to-fmx-red-dark hover:scale-110 active:scale-95',
          open && 'rotate-90'
        )}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat FMX'}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {!open && unread && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-fmx-black" />
        )}
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-40 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96',
              'rounded-2xl overflow-hidden border border-fmx-border/60 shadow-glass flex flex-col',
              'bg-fmx-black-light/95 backdrop-blur-xl'
            )}
            style={{ maxHeight: 'min(560px, calc(100vh - 8rem))' }}
            role="dialog"
            aria-label="Chat assistant FMX"
          >
            {/* En-tête */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-fmx-red/15 to-transparent border-b border-fmx-border/50">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-fmx-red to-fmx-red-dark flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-fmx-black" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-fmx-white text-sm">Assistant FMX</p>
                <p className="text-[11px] text-green-400">En ligne — répond en quelques secondes</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'max-w-[85%]',
                    msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                  )}
                >
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-fmx-red to-fmx-red-dark text-white rounded-br-md'
                        : 'bg-fmx-carbon border border-fmx-border/50 text-fmx-white-dim rounded-bl-md'
                    )}
                  >
                    {msg.role === 'bot' ? renderBold(msg.content) : msg.content}
                  </div>

                  {/* Réponses rapides */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickReplies.map(qr => (
                        <button
                          key={qr}
                          onClick={() => handleQuickReply(qr)}
                          disabled={loading}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                            'border-fmx-red/40 text-fmx-red hover:bg-fmx-red/10 disabled:opacity-40'
                          )}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Indicateur de saisie */}
              {loading && (
                <div className="mr-auto max-w-[60%]">
                  <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-fmx-carbon border border-fmx-border/50 inline-flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-fmx-red"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <form
              onSubmit={e => { e.preventDefault(); sendMessage(input) }}
              className="flex items-center gap-2 p-3 border-t border-fmx-border/50"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Écris ta question..."
                maxLength={500}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl bg-fmx-carbon/70 border border-fmx-border/50 text-sm text-fmx-white',
                  'placeholder:text-fmx-gray focus:outline-none focus:border-fmx-red/50'
                )}
                aria-label="Votre message"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  input.trim() && !loading
                    ? 'bg-gradient-to-br from-fmx-red to-fmx-red-dark text-white hover:scale-105'
                    : 'bg-fmx-carbon text-fmx-gray cursor-not-allowed'
                )}
                aria-label="Envoyer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
