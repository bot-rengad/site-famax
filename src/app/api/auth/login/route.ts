import { NextResponse } from 'next/server'

// Connexion email désactivée : 100% Discord (/api/auth/discord).
export async function POST() {
  return NextResponse.json(
    { error: 'Connexion par email désactivée — connecte-toi avec Discord.' },
    { status: 410 }
  )
}
