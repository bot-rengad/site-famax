import { redirect } from 'next/navigation'

// Plus d'inscription email : tout passe par Discord.
export default function RegisterPage() {
  redirect('/auth/login')
}
