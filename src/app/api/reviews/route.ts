import { NextResponse } from 'next/server'

// Avis clients lus depuis le salon Discord (bot) — cache 1h pour
// respecter les rate limits Discord. Token 100% serveur, jamais exposé.
export const revalidate = 3600

interface DiscordAuthor {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
  bot?: boolean
}

interface DiscordEmbed {
  title?: string | null
  description?: string | null
  author?: { name?: string | null; icon_url?: string | null } | null
  thumbnail?: { url?: string | null } | null
  fields?: { name?: string | null; value?: string | null }[] | null
}

interface DiscordMessage {
  id: string
  content: string
  author: DiscordAuthor
  embeds?: DiscordEmbed[] | null
  timestamp: string
}

export interface PublicReview {
  id: string
  author: string
  avatar: string | null
  content: string
  config: string | null
  date: string
  stars: number
}

function cdnAvatar(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=64`
}

function cleanText(raw: string): string {
  return raw
    .replace(/<@!?\d+>/g, '')
    .replace(/<#\d+>/g, '')
    .replace(/<:\w+:\d+>/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400)
}

function countStars(text: string): number {
  const n = (text.match(/[⭐★]/g) || []).length
  return n > 0 ? Math.min(5, n) : 5
}

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN
  const channelId = process.env.DISCORD_REVIEWS_CHANNEL_ID

  if (!token || !channelId) {
    return NextResponse.json({ reviews: [], error: 'Avis non configurés' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`,
      {
        headers: { Authorization: `Bot ${token}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) {
      console.error('Discord reviews fetch error:', res.status)
      return NextResponse.json({ reviews: [], error: 'Discord indisponible' }, { status: 502 })
    }

    const messages = (await res.json()) as DiscordMessage[]
    const reviews: PublicReview[] = []

    for (const m of messages) {
      const embed = m.embeds?.[0]
      const raw = embed?.description || embed?.title || m.content || ''
      const content = cleanText(raw)
      // Ignore commandes, messages vides et textes trop courts (pas des avis)
      if (content.length < 10 || content.startsWith('!') || content.startsWith('/')) continue

      // Format du bot d'avis : titre "Avis de <pseudo>", champ "Note" en ⭐, champ "Config"
      const fromTitle = embed?.title?.match(/avis de (.+)/i)?.[1]?.trim() || null
      const fromBot = !!m.author.bot
      const author =
        fromTitle ||
        (fromBot && embed?.author?.name ? embed.author.name : null) ||
        m.author.global_name ||
        m.author.username ||
        'Client FMX'
      const noteField = embed?.fields?.find(f => /note/i.test(f?.name || ''))?.value || ''
      const counted = (noteField.match(/[⭐★]/g) || []).length
      const stars = counted > 0 ? Math.min(5, counted) : countStars(raw)
      const config =
        embed?.fields?.find(f => /config/i.test(f?.name || ''))?.value?.trim().slice(0, 80) || null
      const avatar =
        embed?.thumbnail?.url ||
        (fromBot && embed?.author?.icon_url ? embed.author.icon_url : null) ||
        cdnAvatar(m.author.id, m.author.avatar)

      reviews.push({
        id: m.id,
        author: author.slice(0, 32),
        avatar,
        content,
        config,
        date: m.timestamp,
        stars,
      })
      if (reviews.length >= 12) break
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Reviews route error:', error)
    return NextResponse.json({ reviews: [], error: 'Erreur serveur' }, { status: 500 })
  }
}
