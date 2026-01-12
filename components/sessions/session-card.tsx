'use client'

import Link from 'next/link'
import { Card, Badge, StatusBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Session } from '@/types'

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  const getStatusBadge = (status: string) => {
    if (['active', 'ready', 'connected'].includes(status)) return 'active'
    if (['waiting', 'starting'].includes(status)) return 'waiting'
    return 'stopped'
  }

  return (
    <Link href={`/sessions/${session.session_id}`}>
      <Card interactive className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-kibble-text-primary truncate">
              {session.title || 'Untitled Session'}
            </h3>
            <StatusBadge status={getStatusBadge(session.status) as any} />
          </div>
          <p className="text-sm text-kibble-text-secondary truncate mb-1">
            {session.repo_url.split('/').slice(-2).join('/')}
          </p>
          <p className="text-xs text-kibble-text-tertiary">
            {session.messages_count} messages · {formatDate(session.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {session.pr_url && (
            <Badge variant="info" size="sm">
              PR
            </Badge>
          )}
          <svg className="w-5 h-5 text-kibble-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  )
}
