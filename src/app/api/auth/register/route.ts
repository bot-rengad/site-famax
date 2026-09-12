import { NextResponse } from 'next/server'

// Inscription email désactivée : 100% Discord (/api/auth/discord).
export async function POST() {
  return NextResponse.json(
    { error: 'Inscription par email désactivée — connecte-toi avec Discord.' },
    { status: 410 }
  )
}
