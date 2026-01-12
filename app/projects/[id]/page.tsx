'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout, PageContainer } from '@/components/layout'
import { Button, Card, Badge, StatusBadge, LoadingScreen, EmptyState, ConfirmDialog } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import { formatDate, getLanguageColor } from '@/lib/utils'
import type { Project, Session, ProjectDetailResponse } from '@/types'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { githubToken } = useAppStore()

  const [project, setProject] = useState<Project | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [envFile, setEnvFile] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }
    loadProjectDetails()
  }, [projectId, githubToken])

  const loadProjectDetails = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const data: ProjectDetailResponse = await apiClient.getProject(projectId, githubToken)
      setProject(data.project)
      setSessions(data.sessions || [])
      setEnvFile(data.env_file)
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!githubToken) return
    setDeleting(true)
    try {
      await apiClient.deleteProject(projectId, githubToken)
      router.replace('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setDeleting(false)
    }
  }

  const activeSessions = sessions.filter((s) =>
    ['active', 'ready', 'waiting', 'connected'].includes(s.status)
  )
  const historySessions = sessions.filter(
    (s) => !['active', 'ready', 'waiting', 'connected'].includes(s.status)
  )

  if (!githubToken) return null

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingScreen message="Loading project..." />
        </PageContainer>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <PageContainer>
          <EmptyState
            title="Project not found"
            description="The project you're looking for doesn't exist or you don't have access."
            action={
              <Button onClick={() => router.push('/projects')}>
                Back to Projects
              </Button>
            }
          />
        </PageContainer>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageContainer>
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-kibble-text-secondary hover:text-kibble-text-primary mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </Link>

        {/* Project Header */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-kibble-text-primary">
                  {project.repo_full_name}
                </h1>
                {project.is_private && (
                  <Badge variant="outline" size="sm">Private</Badge>
                )}
                {project.active_session_count > 0 && (
                  <StatusBadge status="active" />
                )}
              </div>
              {project.description && (
                <p className="text-sm text-kibble-text-secondary mb-3">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-kibble-text-tertiary">
                {project.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(project.language) }}
                    />
                    {project.language}
                  </div>
                )}
                <span>{project.session_count} sessions</span>
                {envFile && (
                  <Badge variant="success" size="sm">Env configured</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/projects/${projectId}/start`}>
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Session
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/settings`}>
                <Button variant="secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Sessions */}
        <div className="space-y-6">
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Active Sessions ({activeSessions.length})
              </h2>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <SessionRow key={session.session_id} session={session} />
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
                  <SessionRow key={session.session_id} session={session} />
                ))}
              </div>
            </section>
          )}

          {sessions.length === 0 && (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="No sessions yet"
              description="Start a new session to begin working with the AI assistant"
              action={
                <Link href={`/projects/${projectId}/start`}>
                  <Button>Start Session</Button>
                </Link>
              }
            />
          )}
        </div>

        {/* Delete section */}
        <Card className="mt-8 border-kibble-error/20">
          <h3 className="text-lg font-semibold text-kibble-error mb-2">Danger Zone</h3>
          <p className="text-sm text-kibble-text-secondary mb-4">
            Delete this project. This action cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={activeSessions.length > 0}
          >
            Delete Project
          </Button>
          {activeSessions.length > 0 && (
            <p className="text-xs text-kibble-text-tertiary mt-2">
              End all active sessions before deleting the project.
            </p>
          )}
        </Card>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.repo_full_name}"? This will delete all session history.`}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          variant="danger"
        />
      </PageContainer>
    </Layout>
  )
}

function SessionRow({ session }: { session: Session }) {
  const getStatusBadge = (status: string) => {
    if (['active', 'ready', 'connected'].includes(status)) return 'active'
    if (['waiting', 'starting'].includes(status)) return 'waiting'
    if (['stopped', 'stopping'].includes(status)) return 'stopped'
    return 'stopped'
  }

  return (
    <Link href={`/sessions/${session.session_id}`}>
      <Card interactive className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-kibble-text-primary">
              {session.title || 'Untitled Session'}
            </h3>
            <StatusBadge status={getStatusBadge(session.status) as any} />
          </div>
          <p className="text-sm text-kibble-text-tertiary">
            {session.messages_count} messages · {formatDate(session.created_at)}
          </p>
        </div>
        {session.pr_url && (
          <Badge variant="info" size="sm">
            PR
          </Badge>
        )}
      </Card>
    </Link>
  )
}
