'use client'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui'

type BannerType = 'connecting' | 'reconnecting' | 'polling' | 'disconnected' | 'error'

interface StatusBannerProps {
  type: BannerType
  message?: string
  onRetry?: () => void
  className?: string
}

export function StatusBanner({ type, message, onRetry, className }: StatusBannerProps) {
  const configs: Record<BannerType, { bg: string; icon: React.ReactNode; defaultMessage: string }> = {
    connecting: {
      bg: 'bg-kibble-primary/10 text-kibble-primary',
      icon: <Spinner size="sm" />,
      defaultMessage: 'Connecting...',
    },
    reconnecting: {
      bg: 'bg-kibble-warning/10 text-kibble-warning',
      icon: <Spinner size="sm" />,
      defaultMessage: 'Reconnecting...',
    },
    polling: {
      bg: 'bg-kibble-warning/10 text-kibble-warning',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      defaultMessage: 'Using polling mode',
    },
    disconnected: {
      bg: 'bg-kibble-error/10 text-kibble-error',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      defaultMessage: 'Disconnected',
    },
    error: {
      bg: 'bg-kibble-error/10 text-kibble-error',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      defaultMessage: 'Connection error',
    },
  }

  const config = configs[type]

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-sm',
        config.bg,
        className
      )}
    >
      {config.icon}
      <span>{message || config.defaultMessage}</span>
      {onRetry && type === 'disconnected' && (
        <button
          onClick={onRetry}
          className="ml-2 underline hover:no-underline font-medium"
        >
          Retry
        </button>
      )}
    </div>
  )
}
