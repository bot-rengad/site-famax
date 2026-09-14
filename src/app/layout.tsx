import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono, Syne, Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
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
  description: "L'optimisation PC haut de gamme pour joueurs compétitifs. Analyse UserDiag et avis du staff, intervention à distance en 15 minutes.",
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
    url: 'https://famaxopti.vercel.app',
    siteName: 'FMX Optimisation',
    title: 'FMX Optimisation — Optimisation PC Gaming Premium',
    description: "Diagnostic UserDiag et avis du staff, intervention à distance en 15 minutes, suivi 30 jours.",
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
    description: 'Diagnostic UserDiag et avis du staff, intervention à distance en 15 minutes.',
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
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${syne.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen overflow-x-clip bg-fmx-black text-fmx-white antialiased">
        {children}
      </body>
    </html>
  )
}