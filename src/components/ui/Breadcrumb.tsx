import Link from 'next/link'

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-8 text-[12px] text-fmx-gray">
      <Link href="/" className="hover:text-white">Accueil</Link>
      <span className="mx-2">/</span>
      <span className="text-white">{current}</span>
    </nav>
  )
}
