import { NextRequest, NextResponse } from 'next/server'
import { isDiscordConfigured, buildAuthorizeUrl, createState } from '@/lib/discord'
import { getSession } from '@/lib/auth/server'

// Point d'entrée OAuth Discord : redirige le visiteur vers la page d'autorisation
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  // Vérifie que les clés API sont configurées sur l'instance
  if (!isDiscordConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=discord_not_configured`)
  }

  const session = await getSession()

  // Utilisateur connecté = liaison de compte, sinon connexion/inscription directe
  const state = createState(session ? 'link' : 'login', session?.userId)

  // Domaine réel de la requête : le redirect_uri est toujours exact
  return NextResponse.redirect(buildAuthorizeUrl(state, origin))
}
