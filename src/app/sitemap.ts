import type { MetadataRoute } from 'next'

// Sitemap des pages publiques uniquement (jamais dashboard/admin/api/auth).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://famaxopti.vercel.app'
  const now = new Date()
  const pages = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/estimateur', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/test-ecran', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/conditions-generales', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' as const },
  ];
  return pages.map(p => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
