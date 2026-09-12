import { createHmac, timingSafeEqual } from 'crypto'

// Configuration OAuth Discord
// Les identifiants doivent être définis dans .env (Discord Developer Portal)
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''

const DISCORD_API = 'https://discord.com/api/v10'

// URL de rappel : priorité au domaine réel de la requête (toujours exact,
// même si NEXT_PUBLIC_APP_URL est périmé), sinon la variable d'env.
export function getRedirectUri(requestOrigin?: string): string {
  if (requestOrigin?.startsWith('http')) return `${requestOrigin}/api/auth/discord/callback`
  return process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`
    : 'http://localhost:3000/api/auth/discord/callback'
}

// Indique si l'OAuth Discord est configuré sur cette instance
export function isDiscordConfigured(): boolean {
  return DISCORD_CLIENT_ID.length > 0 && DISCORD_CLIENT_SECRET.length > 0
}

// Construit l'URL d'autorisation Discord (scope identify + email)
export function buildAuthorizeUrl(state: string, requestOrigin?: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: getRedirectUri(requestOrigin),
    response_type: 'code',
    scope: 'identify email',
    state,
    prompt: 'consent',
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

interface SignedState {
  payload: string // JSON : { mode, userId?, ts }
  sig: string
}

// Signe le paramètre state avec le JWT_SECRET (protection CSRF)
function signState(data: string): string {
  return createHmac('sha256', process.env.JWT_SECRET || 'fmx-super-secret-key-change-in-production-min-32-chars')
    .update(data)
    .digest('base64url')
}

export function createState(mode: 'login' | 'link', userId?: string): string {
  const payload = JSON.stringify({ mode, userId: userId || null, ts: Date.now() })
  const sig = signState(payload)
  return Buffer.from(JSON.stringify({ payload, sig } satisfies SignedState)).toString('base64url')
}

export function verifyState(state: string): { mode: 'login' | 'link'; userId?: string } | null {
  try {
    const { payload, sig } = JSON.parse(Buffer.from(state, 'base64url').toString()) as SignedState
    const expected = signState(payload)
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    const parsed = JSON.parse(payload) as { mode: 'login' | 'link'; userId?: string | null; ts: number }
    // Expire après 10 minutes
    if (Date.now() - parsed.ts > 10 * 60 * 1000) return null
    return { mode: parsed.mode, userId: parsed.userId || undefined }
  } catch {
    return null
  }
}

// Profil public Discord renvoyé par l'API
export interface DiscordProfile {
  id: string
  username: string
  globalName: string | null
  email: string | null
  avatar: string | null
}

// Échange le code d'autorisation contre un token puis récupère le profil
// (le redirect_uri doit être IDENTIQUE à celui de l'autorisation)
export async function exchangeCodeForProfile(code: string, requestOrigin?: string): Promise<DiscordProfile | null> {
  try {
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: getRedirectUri(requestOrigin),
      }),
    })

    if (!tokenRes.ok) return null
    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) return null

    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (!userRes.ok) return null

    const user = (await userRes.json()) as {
      id: string
      username: string
      global_name?: string | null
      email?: string | null
      avatar?: string | null
    }

    return {
      id: user.id,
      username: user.username,
      globalName: user.global_name ?? user.username,
      email: user.email ?? null,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null,
    }
  } catch {
    return null
  }
}
