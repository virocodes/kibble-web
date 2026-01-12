'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, PageContainer, PageHeader } from '@/components/layout'
import { LoadingScreen } from '@/components/ui'
import { SessionList } from '@/components/sessions'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import type { Session } from '@/types'

export default function SessionsPage() {
  const router = useRouter()
  const { githubToken, sessions, setSessions } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }

    loadSessions()
  }, [githubToken])

  const loadSessions = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const fetchedSessions = await apiClient.listSessions(githubToken)
      setSessions(fetchedSessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!githubToken) {
    return null
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Sessions"
          description={`${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
        />

        {loading ? (
          <LoadingScreen message="Loading sessions..." />
        ) : (
          <SessionList sessions={sessions} />
        )}
      </PageContainer>
    </Layout>
  )
}
