'use client'

import { cn } from '@/lib/utils'
import type { CheckRun } from '@/types'

interface PRChecksProps {
  checks: CheckRun[]
  loading?: boolean
}

export function PRChecks({ checks, loading }: PRChecksProps) {
  if (loading) {
    return (
      <div className="p-4 bg-kibble-background rounded-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (checks.length === 0) {
    return (
      <div className="p-4 bg-kibble-background rounded-lg text-center text-kibble-text-tertiary text-sm">
        No checks found
      </div>
    )
  }

  const passed = checks.filter((c) => c.conclusion === 'success').length
  const failed = checks.filter((c) => c.conclusion === 'failure').length
  const pending = checks.filter((c) => c.status !== 'completed').length
  const total = checks.length

  const getOverallStatus = () => {
    if (failed > 0) return 'failure'
    if (pending > 0) return 'pending'
    return 'success'
  }

  const status = getOverallStatus()

  return (
    <div className="bg-kibble-background rounded-lg overflow-hidden">
      {/* Summary */}
      <div className={cn(
        'px-4 py-3 flex items-center justify-between',
        status === 'success' && 'bg-kibble-success/10',
        status === 'failure' && 'bg-kibble-error/10',
        status === 'pending' && 'bg-kibble-warning/10'
      )}>
        <div className="flex items-center gap-2">
          {status === 'success' && (
            <svg className="w-5 h-5 text-kibble-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'failure' && (
            <svg className="w-5 h-5 text-kibble-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'pending' && (
            <svg className="w-5 h-5 text-kibble-warning animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span className={cn(
            'font-medium',
            status === 'success' && 'text-kibble-success',
            status === 'failure' && 'text-kibble-error',
            status === 'pending' && 'text-kibble-warning'
          )}>
            {status === 'success' && 'All checks passed'}
            {status === 'failure' && `${failed} check${failed > 1 ? 's' : ''} failed`}
            {status === 'pending' && `${pending} check${pending > 1 ? 's' : ''} pending`}
          </span>
        </div>
        <span className="text-sm text-kibble-text-tertiary">
          {passed}/{total} passed
        </span>
      </div>

      {/* Check List */}
      <div className="divide-y divide-gray-100">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>
    </div>
  )
}

function CheckRow({ check }: { check: CheckRun }) {
  const getIcon = () => {
    if (check.status !== 'completed') {
      return (
        <div className="w-4 h-4 border-2 border-kibble-warning border-t-transparent rounded-full animate-spin" />
      )
    }

    switch (check.conclusion) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-kibble-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'failure':
        return (
          <svg className="w-4 h-4 text-kibble-error" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'skipped':
        return (
          <svg className="w-4 h-4 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <a
      href={check.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
    >
      {getIcon()}
      <span className="text-sm text-kibble-text-primary">{check.name}</span>
    </a>
  )
}
