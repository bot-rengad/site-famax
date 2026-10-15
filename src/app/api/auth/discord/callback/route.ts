import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { createToken } from '@/lib/auth/jwt'
import { setSessionCookie } from '@/lib/auth/server'
import { isDiscordConfigured, verifyState, exchangeCodeForProfile, safeRedirect } from '@/lib/discord'

function redirectWith(origin: string, path: string, params?: Record<string, string>) {
  const url = new URL(path, origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return NextResponse.redirect(url.toString())
}

// Premier admin : le Discord dont l'ID correspond à ADMIN_DISCORD_ID
// reçoit automatiquement le rôle ADMIN (à définir dans .env).
async function grantAdminIfOwner(userId: string, discordId: string) {
  if (!process.env.ADMIN_DISCORD_ID || discordId !== process.env.ADMIN_DISCORD_ID) return
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
  })
}

// Rappel OAuth Discord : échange le code, puis lie ou crée le compte
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // L'utilisateur a refusé l'autorisation sur Discord
  if (error) {
    return redirectWith(origin, '/auth/login', { error: 'discord_denied' })
  }

  if (!isDiscordConfigured()) {
    return redirectWith(origin, '/auth/login', { error: 'discord_not_configured' })
  }

  if (!code || !state) {
    return redirectWith(origin, '/auth/login', { error: 'discord_invalid' })
  }

  // Protection CSRF : le state doit être signé par nous et non expiré.
  // (verifyState peut lever si le secret serveur est mal configuré → erreur claire, pas de 500)
  let stateData
  try {
    stateData = verifyState(state)
  } catch (e) {
    console.error('Discord OAuth verify error:', e)
    return redirectWith(origin, '/auth/login', { error: 'discord_server' })
  }
  if (!stateData) {
    return redirectWith(origin, '/auth/login', { error: 'discord_state' })
  }

  const profile = await exchangeCodeForProfile(code, origin)
  if (!profile) {
    return redirectWith(origin, '/auth/login', { error: 'discord_exchange' })
  }

  try {
    // ---- Cas 1 : liaison du Discord au compte actuellement connecté ----
    if (stateData.mode === 'link' && stateData.userId) {
      const existingLink = await prisma.user.findUnique({ where: { discordId: profile.id } })

      // Ce Discord est déjà lié à un autre compte FMX
      if (existingLink && existingLink.id !== stateData.userId) {
        return redirectWith(origin, '/dashboard/settings', { error: 'discord_already_linked' })
      }

      await prisma.user.update({
        where: { id: stateData.userId },
        data: {
          discordId: profile.id,
          discordUsername: profile.username,
          discordGlobalName: profile.globalName,
          discordAvatar: profile.avatar,
          discordVerifiedAt: new Date(),
          // Le nom d'affichage devient le nom Discord
          name: profile.globalName,
        },
      })
      await grantAdminIfOwner(stateData.userId, profile.id)

      await prisma.activityLog.create({
        data: {
          userId: stateData.userId,
          action: 'DISCORD_VERIFIED',
          details: `Discord vérifié : ${profile.username}`,
        },
      })

      return redirectWith(origin, '/', { verified: 'discord' })
    }

    // ---- Cas 2 : connexion / inscription via Discord ----
    // 2a. Un compte existe déjà avec ce Discord -> connexion directe
    let user = await prisma.user.findUnique({ where: { discordId: profile.id } })

    if (!user) {
      // 2b. Aucun compte avec ce Discord : on regarde si l'email Discord est déjà pris
      const email = profile.email?.toLowerCase() || `${profile.id}@discord.fmx-local`
      const emailTaken = await prisma.user.findUnique({ where: { email } })

      if (emailTaken) {
        // Email déjà utilisé par un autre compte Discord : refus explicite
        // (sinon P2002 → crash « discord_server » incompréhensible).
        if (emailTaken.discordId && emailTaken.discordId !== profile.id) {
          return redirectWith(origin, '/auth/login', { error: 'discord_email_used' })
        }
        // Compte créé avant/autrement (sans Discord ou même Discord) : on lie
        // ce Discord au compte existant au lieu de planter.
        user = await prisma.user.update({
          where: { id: emailTaken.id },
          data: {
            discordId: profile.id,
            discordUsername: profile.username,
            discordGlobalName: profile.globalName,
            discordAvatar: profile.avatar,
            discordVerifiedAt: new Date(),
          },
        })
      } else {
        // Inscription automatique avec le pseudo Discord
        user = await prisma.user.create({
          data: {
            email,
            // Mot de passe aléatoire : la connexion passe obligatoirement par Discord
            passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
            name: profile.globalName,
            role: 'USER',
            emailVerified: new Date(),
            discordId: profile.id,
            discordUsername: profile.username,
            discordGlobalName: profile.globalName,
            discordAvatar: profile.avatar,
            discordVerifiedAt: new Date(),
          },
        })
      }
    }
    else if (!user.discordVerifiedAt) {
      // 2c. Compte existant retrouvé par email mais jamais vérifié Discord
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId: profile.id,
          discordUsername: profile.username,
          discordGlobalName: profile.globalName,
          discordAvatar: profile.avatar,
          discordVerifiedAt: new Date(),
        },
      })
    }

    // Premier admin via ADMIN_DISCORD_ID (avant d'ouvrir la session)
    await grantAdminIfOwner(user.id, profile.id)
    // grantAdminIfOwner a pu promouvoir ce compte : on relit le rôle réel
    // pour que le JWT soit créé avec le bon rôle dès la première connexion.
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    const role = dbUser?.role || user.role

    // Enregistre la session en DB PUIS pose le cookie : la session doit exister
    // en DB pour être révocable (getSession la vérifie à chaque requête).
    const sessionId = crypto.randomUUID()
    const ua = request.headers.get('user-agent')
    const ip =
      request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
      request.headers.get('x-real-ip')
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: ua,
        ipAddress: ip,
      },
    })
    // Hygiène : purge les sessions expirées (best-effort, non bloquant)
    prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {})

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role,
      sessionId,
    })
    await setSessionCookie(token)

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `Connexion via Discord (${profile.username})`,
      },
    })

    // Retour au tunnel d'achat si demandé (ex: /dashboard/order?pack=COMPLET),
    // sinon page d'accueil (le header affiche pseudo + avatar).
    const backTo = safeRedirect(stateData.redirect) ?? '/'
    if (backTo !== '/') return NextResponse.redirect(new URL(backTo, origin).toString())
    return redirectWith(origin, '/', { verified: 'discord' })
  } catch (err) {
    console.error('Discord callback error:', err)
    return redirectWith(origin, '/auth/login', { error: 'discord_server' })
  }
}