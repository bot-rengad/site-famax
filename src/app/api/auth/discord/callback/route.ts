import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { createToken } from '@/lib/auth/jwt'
import { setSessionCookie } from '@/lib/auth/server'
import { isDiscordConfigured, verifyState, exchangeCodeForProfile } from '@/lib/discord'

function redirectWith(origin: string, path: string, params?: Record<string, string>) {
  const url = new URL(path, origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return NextResponse.redirect(url.toString())
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

  // Protection CSRF : le state doit être signé par nous et non expiré
  const stateData = verifyState(state)
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

      await prisma.activityLog.create({
        data: {
          userId: stateData.userId,
          action: 'DISCORD_VERIFIED',
          details: `Discord vérifié : ${profile.username}`,
        },
      })

      return redirectWith(origin, '/dashboard', { verified: 'discord' })
    }

    // ---- Cas 2 : connexion / inscription via Discord ----

    // 2a. Un compte existe déjà avec ce Discord -> connexion directe
    let user = await prisma.user.findUnique({ where: { discordId: profile.id } })

    if (!user) {
      // 2b. Aucun compte : inscription automatique avec le pseudo Discord
      const email = profile.email?.toLowerCase() || `${profile.id}@discord.fmx-local`
      const emailTaken = await prisma.user.findUnique({ where: { email } })

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

    // Ouvre une session FMX pour cet utilisateur
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: crypto.randomUUID(),
    })
    await setSessionCookie(token)

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `Connexion via Discord (${profile.username})`,
      },
    })

    return redirectWith(origin, '/dashboard', { verified: 'discord' })
  } catch (err) {
    console.error('Discord callback error:', err)
    return redirectWith(origin, '/auth/login', { error: 'discord_server' })
  }
}