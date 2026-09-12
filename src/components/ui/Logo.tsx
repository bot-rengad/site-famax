import { cn } from '@/lib/utils/helpers'

interface LogoProps {
  /** Taille de la police du logo en px */
  size?: number
  /** Affiche le sous-titre "OPTIMIZED BY FMx" */
  withSub?: boolean
  className?: string
}

// Logo textuel officiel : FM en blanc + x rouge un peu plus bas (typo Syne ExtraBold)
export function Logo({ size = 28, withSub = false, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-baseline leading-none', className)}>
      <span
        className="font-display font-extrabold tracking-tight text-fmx-white"
        style={{ fontSize: size, letterSpacing: '-0.04em' }}
      >
        FM<span className="relative text-fmx-red" style={{ top: '0.12em' }}>x</span>
      </span>
      {withSub && (
        <span
          className="ml-2 hidden font-sans font-medium uppercase text-fmx-gray sm:inline"
          style={{ fontSize: Math.max(9, size * 0.36), letterSpacing: '0.2em', transform: 'translateY(-4px)' }}
        >
          Optimized by FMx
        </span>
      )}
    </span>
  )
}

export default Logo
