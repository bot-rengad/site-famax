'use client'

import { forwardRef, isValidElement, cloneElement, ButtonHTMLAttributes, ReactElement } from 'react'
import { cn } from '@/lib/utils/helpers'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'ghost' | 'outline' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
  asChild?: boolean
}

const buttonClasses = (
  variant: NonNullable<ButtonProps['variant']>,
  size: NonNullable<ButtonProps['size']>,
  fullWidth?: boolean,
  className?: string
) =>
  cn(
    // Styles de base communs à toutes les variantes
    'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 ease-expo focus:outline-none focus:ring-2 focus:ring-fmx-red focus:ring-offset-2 focus:ring-offset-fmx-black disabled:opacity-50 disabled:cursor-not-allowed',
    {
      neon: 'bg-gradient-to-r from-fmx-red to-fmx-red-dark text-fmx-white hover:shadow-neon-red hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden',
      ghost: 'bg-transparent text-fmx-white border border-fmx-border hover:border-fmx-red/50 hover:bg-fmx-red/10 hover:shadow-neon-red-sm',
      outline: 'bg-transparent text-fmx-white border border-fmx-red hover:bg-fmx-red/10',
      secondary: 'bg-fmx-carbon text-fmx-white border border-fmx-border hover:border-fmx-red/30 hover:bg-fmx-carbon-light',
      danger: 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50',
    }[variant],
    {
      sm: 'px-4 py-2 text-xs rounded-full gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-full gap-2',
      lg: 'px-6 py-3 text-base rounded-full gap-2.5',
      xl: 'px-8 py-4 text-lg rounded-full gap-3',
    }[size],
    fullWidth && 'w-full',
    className
  )
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'neon',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Mode "asChild" : fusionne les classes du bouton dans l'élément enfant (ex: <a>)
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>
      return cloneElement(child, {
        className: buttonClasses(variant, size, fullWidth, cn(child.props.className, className)),
        ...(props as object),
      })
    }

    const baseStyles = 'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 ease-expo focus:outline-none focus:ring-2 focus:ring-fmx-red focus:ring-offset-2 focus:ring-offset-fmx-black disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      neon: 'bg-gradient-to-r from-fmx-red to-fmx-red-dark text-fmx-white hover:shadow-neon-red hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden',
      ghost: 'bg-transparent text-fmx-white border border-fmx-border hover:border-fmx-red/50 hover:bg-fmx-red/10 hover:shadow-neon-red-sm',
      outline: 'bg-transparent text-fmx-white border border-fmx-red hover:bg-fmx-red/10',
      secondary: 'bg-fmx-carbon text-fmx-white border border-fmx-border hover:border-fmx-red/30 hover:bg-fmx-carbon-light',
      danger: 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50',
    }

    // Arrondis unifiés en pilule (cohérent avec buttonClasses ci-dessus)
    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-full gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-full gap-2',
      lg: 'px-6 py-3 text-base rounded-full gap-2.5',
      xl: 'px-8 py-4 text-lg rounded-full gap-3',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    )
  }
)

export { Button, buttonClasses }
export default Button