import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono, Syne } from 'next/font/google'
import '../styles/globals.css'

// 3 familles suffisent (Inter doublonnait Space Grotesk en sans-serif) :
// - Space Grotesk : texte courant, - Syne : display, - JetBrains Mono : code.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
  weight: ['400', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '600'],
})

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  weight: ['700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://famaxopti.vercel.app'),
  title: {
    default: 'FMX Optimisation — Optimisation PC Gaming Premium',
    template: '%s | FMX Optimisation',
  },
  description: "L'optimisation PC haut de gamme pour joueurs compétitifs. Analyse UserDiag et avis du staff, intervention à distance (~15 min selon pack), suivi inclus.",
  keywords: ['optimisation PC', 'gaming', 'FPS', 'latence', 'esport', 'performance', 'overclocking', 'tweak', 'Windows'],
  authors: [{ name: 'FMX Optimisation' }],
  creator: 'FMX Optimisation',
  publisher: 'FMX Optimisation',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/images/favicon.ico', sizes: 'any' },
      { url: '/images/logo.png', type: 'image/png' },
    ],
    shortcut: '/images/favicon.ico',
    apple: '/images/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'FMX Optimisation',
    title: 'FMX Optimisation — Optimisation PC Gaming Premium',
    description: "Diagnostic UserDiag et avis du staff, intervention à distance, suivi inclus.",
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'FMX Optimisation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FMX Optimisation',
    description: 'Diagnostic UserDiag et avis du staff, intervention à distance, suivi inclus.',
    images: ['/images/logo.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#060608',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${jetbrains.variable} ${syne.variable}`}>
      <body className="min-h-screen overflow-x-clip bg-fmx-black font-sans text-fmx-white antialiased">
        {children}
      </body>
    </html>
  )
}