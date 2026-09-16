'use client'

import { cn } from '@/lib/utils/helpers'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'red' | 'green' | 'yellow' | 'gray' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  icon?: React.ReactNode
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-fmx-red/20 text-fmx-red border border-fmx-red/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    gray: 'bg-fmx-gray-dark/20 text-fmx-gray border border-fmx-gray-dark/30',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'red' && 'bg-red-400',
            variant === 'green' && 'bg-green-400',
            variant === 'yellow' && 'bg-yellow-400',
            variant === 'gray' && 'bg-fmx-gray',
            variant === 'blue' && 'bg-blue-400',
            variant === 'purple' && 'bg-purple-400',
            variant === 'default' && 'bg-fmx-red'
          )}
        />
      )}
      {icon}
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  type?: 'order' | 'license' | 'ticket' | 'script'
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    // Commandes — libellés alignés avec le tunnel client/admin
    PENDING: { variant: 'yellow', label: 'En attente de preuve' },
    PAID: { variant: 'green', label: 'Payée' },
    COMPLETED: { variant: 'green', label: 'Terminée' },
    CANCELLED: { variant: 'red', label: 'Annulée' },
    REFUNDED: { variant: 'gray', label: 'Remboursée' },
    // Licenses
    ACTIVE: { variant: 'green', label: 'Active' },
    EXPIRED: { variant: 'gray', label: 'Expirée' },
    REVOKED: { variant: 'red', label: 'Révoquée' },
    // Tickets
    OPEN: { variant: 'red', label: 'Ouvert' },
    IN_PROGRESS: { variant: 'blue', label: 'En cours' },
    WAITING_CUSTOMER: { variant: 'yellow', label: 'En attente client' },
    CLOSED: { variant: 'green', label: 'Fermé' },
  }

  const config = statusConfig[status] || { variant: 'gray', label: status }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}