'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout, PageContainer } from '@/components/layout'
import { Button, Card, Textarea, Badge, LoadingScreen } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import { getLanguageColor } from '@/lib/utils'
import type { Project, ProjectDetailResponse } from '@/types'

export default function StartSessionPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { githubToken, addSession } = useAppStore()

  const [project, setProject] = useState<Project | null>(null)
  const [envFile, setEnvFile] = useState<string | undefined>()
  const [taskDescription, setTaskDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }
    loadProject()
  }, [projectId, githubToken])

  const loadProject = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const data: ProjectDetailResponse = await apiClient.getProject(projectId, githubToken)
      setProject(data.project)
      setEnvFile(data.env_file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!githubToken || !project) return

    setCreating(true)
    setError(null)

    try {
      const response = await apiClient.createSessionInProject(
        projectId,
        githubToken,
        taskDescription.trim() || undefined
      )

      // Add session to store
      addSession({
        session_id: response.session_id,
        repo_url: project.repo_url,
        status: 'starting',
        created_at: new Date().toISOString(),
        messages_count: 0,
        project_id: projectId,
      })

      // Navigate to chat
      router.push(`/sessions/${response.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setCreating(false)
    }
  }

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
          <div className="text-center py-12">
            <p className="text-kibble-text-secondary">Project not found</p>
          </div>
        </PageContainer>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageContainer className="max-w-2xl">
        {/* Back link */}
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-kibble-text-secondary hover:text-kibble-text-primary mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </Link>

        <Card>
          <h1 className="text-xl font-bold text-kibble-text-primary mb-6">
            Start New Session
          </h1>

          {/* Project Info */}
          <div className="p-4 bg-kibble-background rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
              </svg>
              <div>
                <p className="font-medium text-kibble-text-primary">
                  {project.repo_full_name}
                </p>
                <div className="flex items-center gap-2 text-sm text-kibble-text-tertiary">
                  {project.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(project.language) }}
                      />
                      {project.language}
                    </span>
                  )}
                  {envFile && (
                    <Badge variant="success" size="sm">Env ready</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="mb-6">
            <Textarea
              label="Task Description (optional)"
              placeholder="Describe what you want to accomplish in this session..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
              helperText="You can also describe your task after the session starts"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-kibble-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button onClick={handleStartSession} loading={creating}>
              Start Session
            </Button>
          </div>
        </Card>
      </PageContainer>
    </Layout>
  )
}
