import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/discord',
  '/api/auth/discord/callback',
  '/api/health',
]

const DASHBOARD_PATHS = [
  '/dashboard',
  '/admin',
  '/api/users',
  '/api/orders',
  '/api/licenses',
  '/api/scripts',
  '/api/checklist',
  '/api/ai-assistant',
  '/api/tickets',
  '/api/admin',
]

// Rate limiting en mémoire (par instance — suffisant en mono-instance ;
// en multi-instances derrière un LB, passer sur Redis/Upstash).
// Fenêtre glissante : max requêtes par IP et par période.
const RATE_LIMITS: { prefix: string; limit: number; windowMs: number }[] = [
  { prefix: '/api/auth', limit: 20, windowMs: 60_000 }, // anti brute-force login/OAuth
  { prefix: '/api/orders', limit: 20, windowMs: 60_000 }, // anti-spam commandes
  { prefix: '/api/chat', limit: 30, windowMs: 60_000 }, // anti-spam chatbot
  { prefix: '/api/tickets', limit: 30, windowMs: 60_000 },
]

const hits = new Map<string, number[]>()

function isRateLimited(ip: string, pathname: string): { limited: boolean; retryAfter: number } {
  const rule = RATE_LIMITS.find(r => pathname.startsWith(r.prefix))
  if (!rule) return { limited: false, retryAfter: 0 }
  const now = Date.now()
  const key = `${rule.prefix}:${ip}`
  const windowStart = now - rule.windowMs
  const times = (hits.get(key) || []).filter(t => t > windowStart)
  if (times.length >= rule.limit) {
    const retryAfter = Math.ceil((times[0] + rule.windowMs - now) / 1000)
    return { limited: true, retryAfter: Math.max(1, retryAfter) }
  }
  times.push(now)
  // Anti-fuite mémoire : borne le tableau
  if (times.length > rule.limit * 2) times.splice(0, times.length - rule.limit * 2)
  hits.set(key, times)
  return { limited: false, retryAfter: 0 }
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Anti-CSRF pragmatique pour une auth cookie SameSite=Lax :
// les requêtes cross-site depuis un navigateur envoient toujours Origin/Referer.
// Si l'un est présent et ne correspond pas à l'hôte, on bloque.
function csrfBlocked(request: NextRequest): boolean {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false
  if (!request.nextUrl.pathname.startsWith('/api/')) return false
  const host = request.headers.get('host') || ''
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const matches = (url: string | null) => {
    if (!url) return false
    try {
      return new URL(url).host === host
    } catch {
      return false
    }
  }
  if (origin || referer) {
    return !matches(origin) && !matches(referer)
  }
  return false // pas de navigateur (curl, webhook) : on laisse passer
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Fichiers statiques : jamais de rate limit ni d'auth
  if (pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/scripts') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Rate limiting API (avant l'auth pour protéger le login lui-même)
  if (pathname.startsWith('/api/')) {
    const { limited, retryAfter } = isRateLimited(clientIp(request), pathname)
    if (limited) {
      return NextResponse.json(
        { error: 'Trop de requêtes, réessaie dans quelques secondes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
    if (csrfBlocked(request)) {
      return NextResponse.json({ error: 'Requête refusée (origine invalide).' }, { status: 403 })
    }
  }

  // Permet les chemins publics : '/' exact, sinon préfixe exact (évite que '/' matche tout)
  const isPublic = PUBLIC_PATHS.some(p => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
  if (isPublic) {
    return NextResponse.next()
  }

  // Check authentication for dashboard and API routes
  const isDashboard = DASHBOARD_PATHS.some(p => pathname.startsWith(p))

  if (isDashboard) {
    const token = request.cookies.get('fmx_session')?.value

    if (!token) {
      // Redirect to login for dashboard pages
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      // Return 401 for API routes
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('fmx_session')
      return response
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/auth/:path*',
    '/api/chat/:path*',
    '/api/users/:path*',
    '/api/orders/:path*',
    '/api/licenses/:path*',
    '/api/scripts/:path*',
    '/api/checklist/:path*',
    '/api/ai-assistant/:path*',
    '/api/tickets/:path*',
    '/api/admin/:path*',
  ],
}
