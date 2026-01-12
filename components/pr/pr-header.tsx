'use client'

import { Badge, PRStateBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { PullRequest } from '@/types'

interface PRHeaderProps {
  pr: PullRequest
}

export function PRHeader({ pr }: PRHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <PRStateBadge state={pr.state} merged={!!pr.merged_at} draft={pr.draft} />
            <span className="text-kibble-text-tertiary">#{pr.number}</span>
          </div>

          <h1 className="text-xl font-bold text-kibble-text-primary mb-2">
            {pr.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-kibble-text-secondary">
            <div className="flex items-center gap-2">
              <img
                src={pr.user.avatar_url}
                alt={pr.user.login}
                className="w-5 h-5 rounded-full"
              />
              <span>{pr.user.login}</span>
            </div>
            <span>opened {formatDate(pr.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Badge variant="outline" size="sm" className="font-mono">
          {pr.base.ref}
        </Badge>
        <svg className="w-4 h-4 text-kibble-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        <Badge variant="outline" size="sm" className="font-mono">
          {pr.head.ref}
        </Badge>
      </div>
    </div>
  )
}
