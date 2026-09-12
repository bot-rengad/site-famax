// Vérification serveur Cloudflare Turnstile.
// Inactif tant que TURNSTILE_SECRET_KEY n'est pas défini (retour skipped).
// Le jour de l'activation : appeler avec le token reçu du formulaire.

interface VerifyResult {
  ok: boolean
  skipped: boolean
  error?: string
}

export async function verifyTurnstile(token: string | null | undefined, ip?: string | null): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY || ''
  if (!secret) return { ok: true, skipped: true }
  if (!token) return { ok: false, skipped: false, error: 'missing-token' }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip || '' }),
    })
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (data.success) return { ok: true, skipped: false }
    return { ok: false, skipped: false, error: (data['error-codes'] || []).join(',') || 'invalid' }
  } catch {
    // Échec réseau : on refuse plutôt que de laisser passer (fail-closed)
    return { ok: false, skipped: false, error: 'verify-unreachable' }
  }
}
