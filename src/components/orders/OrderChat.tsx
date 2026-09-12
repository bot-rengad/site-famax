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
export function OrderChat({ orderId, compact = false }: { orderId: string; compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40', compact ? 'max-h-[320px]' : 'max-h-[480px]')}>
      {failed && (
        <button
          onClick={load}
          className="border-b border-yellow-500/25 bg-yellow-500/[0.08] px-4 py-2.5 text-center text-[12px] font-bold text-yellow-200 transition-colors hover:bg-yellow-500/[0.14]"
        >
          ⚠ Connexion perdue (base en réveil ?) — clique pour réessayer
        </button>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !failed && (
          <p className="py-6 text-center text-[13px] text-fmx-gray">
            Aucun message pour le moment. Pose ta question ici, le staff te répond sur cette commande.
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
      <div className="flex gap-2 border-t border-white/[0.08] p-3">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Écris ton message…"
          maxLength={2000}
          className="flex-1 rounded-full border border-white/[0.08] bg-[#0f0f12] px-4 py-2.5 text-[13px] text-white placeholder:text-fmx-gray focus:border-fmx-red/50 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          aria-label="Envoyer"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fmx-red text-white transition-transform hover:scale-105 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
