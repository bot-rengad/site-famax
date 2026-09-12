'use client'

import { cn } from '@/lib/utils/helpers'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  animated?: boolean
  striped?: boolean
  className?: string
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  variant = 'default',
  animated = false,
  striped = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const variants = {
    default: 'bg-gradient-to-r from-fmx-red to-fmx-red-dark',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
  }

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-display text-caption text-fmx-white-dim">
            {label || 'Progression'}
          </span>
          {showLabel && (
            <span className="font-mono text-body-sm text-fmx-red">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'progress-bar',
          sizes[size],
          'relative overflow-hidden'
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progression'}
      >
        <div
          className={cn(
            'progress-fill',
            variants[variant],
            striped && 'bg-[length:20px_20px] animate-shimmer',
            animated && 'transition-all duration-500 ease-expo'
          )}
          style={{ width: `${percentage}%` }}
        />
        {striped && (
          <div
            className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent25%,transparent50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent75%,transparent)]"
            style={{ backgroundSize: '20px 20px' }}
          />
        )}
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  showLabel = true,
  label,
  variant = 'default',
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const variants = {
    default: 'stroke-fmx-red',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-fmx-border"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(
            'transition-all duration-500 ease-expo',
            variants[variant],
            'stroke-linecap-round'
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {(showLabel || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showLabel && (
            <span className="font-display font-bold text-fmx-white" style={{ fontSize: size * 0.18 }}>
              {Math.round(percentage)}%
            </span>
          )}
          {label && (
            <span className="font-display text-caption text-fmx-white-dim mt-0.5" style={{ fontSize: size * 0.08 }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface StepProgressProps {
  steps: { label: string; completed: boolean; current?: boolean }[]
  className?: string
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-fmx-border" />
      <div className="relative flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={cn(
                'relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                step.completed
                  ? 'bg-fmx-red border-fmx-red text-fmx-white'
                  : step.current
                  ? 'bg-fmx-carbon border-fmx-red text-fmx-red ring-2 ring-fmx-red/20'
                  : 'bg-fmx-carbon border-fmx-border text-fmx-gray'
              )}
            >
              {step.completed ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="font-display font-bold text-xs">{index + 1}</span>
              )}
            </div>
            <span className={cn(
              'mt-2 font-display text-caption text-center w-24',
              step.completed ? 'text-fmx-red' : step.current ? 'text-fmx-white' : 'text-fmx-gray'
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-1/2 top-[14px] w-full h-0.5 -translate-y-1/2 transition-all duration-300',
                  step.completed ? 'bg-fmx-red' : 'bg-fmx-border'
                )}
                style={{ left: '50%', width: '100%' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}