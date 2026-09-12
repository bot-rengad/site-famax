// Notifications Discord via webhook — salon staff (preuves / logs)
// Requis dans .env : DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/<id>/<token>"
// Le webhook doit être créé dans le salon staff qui reçoit les preuves de paiement.

interface OrderNotify {
  orderNumber: string
  packageType: string
  amount: number
  paymentMethod: string | null
  discordUsername: string | null
  discordId: string | null
  email: string
}

function webhookUrl(): string {
  return process.env.DISCORD_WEBHOOK_URL || ''
}

export function isDiscordWebhookConfigured(): boolean {
  const url = webhookUrl()
  return url.startsWith('https://discord.com/api/webhooks/')
}

async function postToDiscord(payload: Record<string, unknown>): Promise<void> {
  const url = webhookUrl()
  if (!isDiscordWebhookConfigured()) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Discord refuse certaines requêtes sans User-Agent navigateur (403)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FMX-Market/1.0',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[discord-notify] webhook failed:', err)
  }
}

// Nouvelle commande en attente de preuve — le staff vérifie puis valide
export async function notifyNewOrder(order: OrderNotify): Promise<void> {
  const discordRef = order.discordId
    ? `<@${order.discordId}> (${order.discordUsername ?? order.discordId})`
    : order.discordUsername ?? 'non lié — demander au client de vérifier avec Discord'

  await postToDiscord({
    username: 'FMX Market',
    embeds: [
      {
        title: '🧾 Nouvelle commande — preuve à vérifier',
        color: 0xff1a1a,
        fields: [
          { name: 'Commande', value: order.orderNumber, inline: true },
          { name: 'Pack', value: `${order.packageType} — ${order.amount}€`, inline: true },
          { name: 'Paiement', value: order.paymentMethod ?? '—', inline: true },
          { name: 'Client Discord', value: discordRef, inline: false },
          { name: 'Email', value: order.email, inline: true },
          {
            name: 'À faire',
            value: '1. Vérifier la note du paiement (= pseudo Discord)\n2. Vérifier la capture dans le ticket\n3. Valider avec `/valider @membre <clé>` ou depuis /admin',
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  })
}

// Licence générée — traçabilité staff
export async function notifyLicenseActivated(orderNumber: string, licenseKey: string, discordUsername: string | null): Promise<void> {
  await postToDiscord({
    username: 'FMX Market',
    embeds: [
      {
        title: '🔑 Licence générée',
        color: 0x22c55e,
        fields: [
          { name: 'Commande', value: orderNumber, inline: true },
          { name: 'Client Discord', value: discordUsername ?? '—', inline: true },
          { name: 'Clé', value: `\`${licenseKey}\``, inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
