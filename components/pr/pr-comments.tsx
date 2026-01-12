'use client'

import { Card } from '@/components/ui'
import { MarkdownRenderer } from '@/components/chat/markdown-renderer'
import { formatDate } from '@/lib/utils'
import type { PRComment } from '@/types'

interface PRCommentsProps {
  comments: PRComment[]
  loading?: boolean
}

export function PRComments({ comments, loading }: PRCommentsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-kibble-text-tertiary">
        No comments yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

function CommentCard({ comment }: { comment: PRComment }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-kibble-background border-b border-gray-100">
        <img
          src={comment.user.avatar_url}
          alt={comment.user.login}
          className="w-6 h-6 rounded-full"
        />
        <span className="font-medium text-sm text-kibble-text-primary">
          {comment.user.login}
        </span>
        <span className="text-xs text-kibble-text-tertiary">
          commented {formatDate(comment.created_at)}
        </span>
      </div>
      <div className="p-4">
        <MarkdownRenderer content={comment.body} />
      </div>
    </Card>
  )
}
