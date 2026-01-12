'use client'

import { useState } from 'react'
import { Input } from '@/components/ui'
import { SessionCard } from './session-card'
import type { Session } from '@/types'

interface SessionListProps {
  sessions: Session[]
}

export function SessionList({ sessions }: SessionListProps) {
  const [search, setSearch] = useState('')

  const filteredSessions = sessions.filter((session) => {
    const searchLower = search.toLowerCase()
    return (
      (session.title?.toLowerCase().includes(searchLower) || false) ||
      session.repo_url.toLowerCase().includes(searchLower)
    )
  })

  const activeSessions = filteredSessions.filter((s) =>
    ['active', 'ready', 'waiting', 'connected', 'starting'].includes(s.status)
  )

  const historySessions = filteredSessions.filter(
    (s) => !['active', 'ready', 'waiting', 'connected', 'starting'].includes(s.status)
  )

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-3 text-kibble-text-tertiary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-kibble-text-secondary mb-2">No sessions yet</p>
        <p className="text-sm text-kibble-text-tertiary">
          Start a session from a project to begin chatting with the AI assistant
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search sessions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredSessions.length === 0 ? (
        <div className="text-center py-8 text-kibble-text-secondary">
          No sessions found matching &quot;{search}&quot;
        </div>
      ) : (
        <>
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Active ({activeSessions.length})
              </h2>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <SessionCard key={session.session_id} session={session} />
                ))}
              </div>
            </section>
          )}

          {/* History */}
          {historySessions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                History ({historySessions.length})
              </h2>
              <div className="space-y-3">
                {historySessions.map((session) => (
                  <SessionCard key={session.session_id} session={session} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
