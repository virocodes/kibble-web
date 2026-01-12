'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  size?: 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-kibble-text-secondary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'bg-transparent border border-gray-200 text-kibble-text-secondary',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Status Badge for sessions
export type StatusBadgeStatus = 'active' | 'ready' | 'working' | 'waiting' | 'stopped' | 'error'

export function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  const config: Record<StatusBadgeStatus, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    ready: { variant: 'success', label: 'Ready' },
    working: { variant: 'warning', label: 'Working' },
    waiting: { variant: 'warning', label: 'Waiting' },
    stopped: { variant: 'default', label: 'Stopped' },
    error: { variant: 'error', label: 'Error' },
  }

  const { variant, label } = config[status] || config.stopped

  return (
    <Badge variant={variant} className="gap-1">
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'success' && 'bg-green-500',
        variant === 'warning' && 'bg-orange-500',
        variant === 'error' && 'bg-red-500',
        variant === 'default' && 'bg-gray-400'
      )} />
      {label}
    </Badge>
  )
}

// PR State Badge
export type PRStateBadgeState = 'open' | 'closed' | 'merged' | 'draft'

interface PRStateBadgeProps {
  state: 'open' | 'closed'
  merged?: boolean
  draft?: boolean
}

export function PRStateBadge({ state, merged, draft }: PRStateBadgeProps) {
  // Determine the display state based on props
  let displayState: PRStateBadgeState = state
  if (merged) displayState = 'merged'
  else if (draft) displayState = 'draft'

  const config: Record<PRStateBadgeState, { variant: BadgeProps['variant']; label: string }> = {
    open: { variant: 'success', label: 'Open' },
    closed: { variant: 'error', label: 'Closed' },
    merged: { variant: 'info', label: 'Merged' },
    draft: { variant: 'default', label: 'Draft' },
  }

  const { variant, label } = config[displayState]

  return <Badge variant={variant}>{label}</Badge>
}

// Plan Status Badge
export type PlanBadgeStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed'

export function PlanStatusBadge({ status }: { status: PlanBadgeStatus }) {
  const config: Record<PlanBadgeStatus, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'info', label: 'Approved' },
    rejected: { variant: 'error', label: 'Rejected' },
    executing: { variant: 'warning', label: 'Executing' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'error', label: 'Failed' },
  }

  const { variant, label } = config[status]

  return <Badge variant={variant}>{label}</Badge>
}
