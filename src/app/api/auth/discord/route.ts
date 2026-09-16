import { NextRequest, NextResponse } from 'next/server'
import { isDiscordConfigured, buildAuthorizeUrl, createState, safeRedirect } from '@/lib/discord'
import { getSession } from '@/lib/auth/server'

// Point d'entrée OAuth Discord : redirige le visiteur vers la page d'autorisation
// Accepte ?redirect=/dashboard/order pour revenir au tunnel d'achat après login.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const { origin } = url

  // Vérifie que les clés API sont configurées sur l'instance
  if (!isDiscordConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=discord_not_configured`)
  }

  const session = await getSession()
  const redirect = safeRedirect(url.searchParams.get('redirect'))

  // Utilisateur connecté = liaison de compte, sinon connexion/inscription directe
  let state: string
  try {
    state = createState(session ? 'link' : 'login', session?.userId, redirect ?? undefined)
  } catch (e) {
    // JWT_SECRET manquant/invalide côté serveur : message clair au lieu d'un crash 500
    console.error('Discord OAuth state error:', e)
    return NextResponse.redirect(`${origin}/auth/login?error=discord_server`)
  }

  // Domaine réel de la requête : le redirect_uri est toujours exact
  return NextResponse.redirect(buildAuthorizeUrl(state, origin))
}
