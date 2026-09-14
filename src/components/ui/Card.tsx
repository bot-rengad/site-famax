'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-fmx-carbon border border-white/[0.08] shadow-card',
      glass: 'border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-glass',
      elevated: 'bg-gradient-to-b from-[#161616] to-[#0e0e0e] border border-fmx-red/25 shadow-card-hover',
      bordered: 'bg-transparent border border-fmx-border',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-5 sm:p-6 lg:p-8',
      xl: 'p-5 sm:p-8 lg:p-10',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          hover && 'transition-colors duration-200 hover:border-fmx-red/40',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-heading-lg text-fmx-white', className)}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-fmx-white-dim text-body-sm mt-1', className)} {...props}>
      {children}
    </p>
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-fmx-border/50 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
)
CardFooter.displayName = 'CardFooter'