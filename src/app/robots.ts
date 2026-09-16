import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://famaxopti.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Zones privées : espace client, admin et API jamais indexés
        disallow: ['/api/', '/admin/', '/dashboard/', '/auth/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
