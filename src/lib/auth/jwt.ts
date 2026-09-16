import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const JWT_SECRET_VALUE = process.env.JWT_SECRET
if (!JWT_SECRET_VALUE && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET manquant en production — ajoutez-le dans Vercel → Environment Variables')
}
if (JWT_SECRET_VALUE && JWT_SECRET_VALUE.length < 32) {
  throw new Error('JWT_SECRET trop court — 32 caractères minimum (openssl rand -base64 48)')
}
const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_VALUE || 'fmx-dev-only-secret-min-32-chars-local-dev-only'
)

const JWT_ISSUER = 'fmx-optimisation'
const JWT_AUDIENCE = 'fmx-users'

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segments = 5
  const segmentLength = 5
  // crypto.getRandomValues quand dispo (navigateur/edge), sinon Math.random en repli
  const rand = (n: number): number => {
    try {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      return buf[0] % n
    } catch {
      return Math.floor(Math.random() * n)
    }
  }
  let key = ''
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(rand(chars.length))
    }
    if (i < segments - 1) key += '-'
  }
  return `FMX-${key}`
}

export function generateOrderNumber(pseudo?: string | null): string {
  // Format lisible lié au client : FMX-pseudo-482 (pseudo nettoyé + 3 chiffres).
  // Ancien format FMX-8K2N4P toujours accepté en lecture (commandes existantes).
  const clean = (pseudo || 'client').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'client'
  let digits = '100'
  try {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    digits = String(100 + (buf[0] % 900))
  } catch {
    digits = String(Math.floor(100 + Math.random() * 900))
  }
  return `FMX-${clean}-${digits}`
}