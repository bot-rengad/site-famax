'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface ChatMessage {
  id: string
  message: string
  isStaff: boolean
  createdAt: string
  userId: string
  user?: { discordGlobalName: string | null; discordUsername: string | null; name: string | null } | null
}

// Fil de discussion d'une commande : client ↔ staff.
// Rafraîchi toutes les 5 s (simple et fiable, pas de websocket à héberger).
export function OrderChat({ orderId, compact = false, className }: { orderId: string; compact?: boolean; className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Zone de saisie auto-agrandissante façon Discord (min 3 lignes, max ~8)
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [draft])

  const load = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setFailed(false)
    } catch {
      // Échec (base en réveil, réseau...) : on l'affiche au lieu du vide silencieux
      setFailed(true)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length])

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setFailed(false)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, data.message])
      setDraft('')
    } catch {
      // Le brouillon est conservé : rien n'est perdu, un bouton Réessayer apparaît
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  const sender = (m: ChatMessage) =>
    m.isStaff ? 'Staff FMX' : m.user?.discordGlobalName || m.user?.discordUsername || m.user?.name || 'Client'

  return (
    <div className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40', compact && 'max-h-[480px]', className)}>
      {failed && (
        <button
          onClick={load}
          className="border-b border-yellow-500/25 bg-yellow-500/[0.08] px-4 py-2.5 text-center text-[12px] font-bold text-yellow-200 transition-colors hover:bg-yellow-500/[0.14]"
        >
          ⚠ Connexion perdue (base en réveil ?) — clique pour réessayer
        </button>
      )}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !failed && (
          <p className="mx-auto max-w-[420px] py-6 text-center text-[13px] leading-relaxed text-fmx-gray">
            Pour démarrer : <b className="text-white">envoie ici ta capture de paiement</b> (ou sur
            Discord, salon preuves) avec ton pseudo en note, puis pose tes questions —
            le staff te répond sur cette commande.
          </p>
        )}
        {messages.map(m => (
          <div key={m.id} className={cn('flex flex-col gap-1', m.isStaff ? 'items-start' : 'items-end')}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-fmx-gray">
              {sender(m)} {m.isStaff && <span className="text-fmx-red">• staff</span>}
            </span>
            <p
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                m.isStaff ? 'bg-white/[0.07] text-white' : 'bg-fmx-red text-white'
              )}
            >
              {m.message}
            </p>
            <span className="text-[10px] text-fmx-gray">
              {new Date(m.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-white/[0.08] bg-white/[0.01] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={draft}
            rows={3}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Écris ton message…"
            maxLength={2000}
            className="max-h-[180px] min-h-[76px] flex-1 resize-none overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0f0f12] px-4 py-3 text-[14px] leading-relaxed text-white placeholder:text-fmx-gray focus:border-fmx-red/50 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            aria-label="Envoyer"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-fmx-red text-white transition-all duration-150 hover:scale-105 hover:bg-[#ff2b2b] hover:shadow-[0_0_20px_rgba(255,26,26,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-fmx-gray">
          Entrée pour envoyer • Maj + Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  )
}
