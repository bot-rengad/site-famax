import { redirect } from 'next/navigation'

// Écran retiré : FMX applique l'optimisation pour le client.
// Redirection pour ne pas casser les anciens liens/bookmarks.
export default function DownloadsPage() {
  redirect('/dashboard')
}
