'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout, PageContainer } from '@/components/layout'
import { Card, LoadingScreen } from '@/components/ui'
import { PRHeader, PRChecks, PRComments, MergeButton } from '@/components/pr'
import { MarkdownRenderer } from '@/components/chat/markdown-renderer'
import { useAppStore } from '@/stores/app-store'
import { githubClient } from '@/lib/github'
import type { PullRequest, PRComment, CheckRun } from '@/types'

export default function PRDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { githubToken } = useAppStore()

  const owner = params.owner as string
  const repo = params.repo as string
  const number = parseInt(params.number as string, 10)

  const [pr, setPr] = useState<PullRequest | null>(null)
  const [comments, setComments] = useState<PRComment[]>([])
  const [checks, setChecks] = useState<CheckRun[]>([])
  const [loading, setLoading] = useState(true)
  const [checksLoading, setChecksLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }

    loadPR()
  }, [owner, repo, number, githubToken])

  const loadPR = async () => {
    if (!githubToken) return

    setLoading(true)
    setError(null)

    try {
      const prData = await githubClient.getPullRequest(githubToken, owner, repo, number)
      setPr(prData)

      // Load comments and checks in parallel
      loadComments()
      loadChecks(prData.head.sha)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pull request')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    if (!githubToken) return

    setCommentsLoading(true)
    try {
      const commentsData = await githubClient.getPRComments(githubToken, owner, repo, number)
      setComments(commentsData)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const loadChecks = async (sha: string) => {
    if (!githubToken) return

    setChecksLoading(true)
    try {
      const checksData = await githubClient.getCheckRuns(githubToken, owner, repo, sha)
      setChecks(checksData.check_runs)
    } catch (err) {
      console.error('Failed to load checks:', err)
    } finally {
      setChecksLoading(false)
    }
  }

  const handleMerge = async (method: 'merge' | 'squash' | 'rebase') => {
    if (!githubToken || !pr) return

    await githubClient.mergePullRequest(githubToken, owner, repo, number, undefined, undefined, method)

    // Reload PR to update state
    const updatedPr = await githubClient.getPullRequest(githubToken, owner, repo, number)
    setPr(updatedPr)
  }

  if (!githubToken) return null

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingScreen message="Loading pull request..." />
        </PageContainer>
      </Layout>
    )
  }

  if (error || !pr) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-kibble-error mb-4">{error || 'Pull request not found'}</p>
            <Link href="/projects" className="text-kibble-primary hover:underline">
              Back to Projects
            </Link>
          </div>
        </PageContainer>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageContainer className="max-w-4xl">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-kibble-text-secondary hover:text-kibble-text-primary mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* PR Header */}
        <PRHeader pr={pr} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {pr.body && (
              <Card>
                <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                  Description
                </h2>
                <MarkdownRenderer content={pr.body} />
              </Card>
            )}

            {/* Comments */}
            <div>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Comments ({comments.length})
              </h2>
              <PRComments comments={comments} loading={commentsLoading} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Merge Section */}
            <Card>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Merge
              </h2>
              <MergeButton pr={pr} onMerge={handleMerge} />
            </Card>

            {/* Checks */}
            <div>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Checks
              </h2>
              <PRChecks checks={checks} loading={checksLoading} />
            </div>

            {/* Links */}
            <Card>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Links
              </h2>
              <div className="space-y-2">
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-kibble-primary hover:underline"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  View on GitHub
                </a>
                <a
                  href={`${pr.html_url}/files`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-kibble-primary hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Files Changed
                </a>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </Layout>
  )
}
