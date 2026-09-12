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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'FMx — Optimized by FMx | Optimisation PC Ultime',
    template: '%s | FMx Optimisation',
  },
  description: "L'optimisation PC haut de gamme pour joueurs compétitifs. Analyse UserDiag et avis du staff, intervention à distance en 30-45 minutes.",
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
    url: 'https://fmx-optimisation.com',
    siteName: 'FMX Optimisation',
    title: 'FMX Optimisation — Dominez vos performances',
    description: 'L\'optimisation PC ultime pour gamers exigeants. FPS Maximaux & Latence Zéro.',
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
    description: 'Dominez vos performances : FPS Max & Latence Zéro',
    images: ['/images/logo.png'],
    creator: '@fmxopt',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
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
      <body className="min-h-screen bg-fmx-black text-fmx-white antialiased">
        {children}
      </body>
    </html>
  )
}