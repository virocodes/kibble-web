'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout, PageContainer } from '@/components/layout'
import { Card, Button, Textarea, LoadingScreen, ConfirmDialog } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import type { Project } from '@/types'

export default function ProjectSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { githubToken, removeProject } = useAppStore()

  const [project, setProject] = useState<Project | null>(null)
  const [envFile, setEnvFile] = useState('')
  const [originalEnvFile, setOriginalEnvFile] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      const data = await apiClient.getProject(projectId, githubToken)
      setProject(data.project)
      setEnvFile(data.env_file || '')
      setOriginalEnvFile(data.env_file || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEnv = async () => {
    if (!githubToken) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.updateProject(projectId, envFile, githubToken)
      setOriginalEnvFile(envFile)
      setSuccess('Environment file saved successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save environment file')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!githubToken) return

    setDeleting(true)
    try {
      await apiClient.deleteProject(projectId, githubToken)
      removeProject(projectId)
      router.replace('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      setDeleting(false)
    }
  }

  const hasEnvChanges = envFile !== originalEnvFile

  if (!githubToken) return null

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingScreen message="Loading settings..." />
        </PageContainer>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-kibble-error mb-4">{error || 'Project not found'}</p>
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
      <PageContainer className="max-w-2xl">
        {/* Header */}
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-kibble-text-secondary hover:text-kibble-text-primary mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </Link>

        <h1 className="text-xl font-bold text-kibble-text-primary mb-6">
          Project Settings
        </h1>

        {/* Error / Success */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-kibble-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-kibble-success">
            {success}
          </div>
        )}

        {/* Environment File */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-kibble-text-primary mb-2">
            Environment File
          </h2>
          <p className="text-sm text-kibble-text-secondary mb-4">
            Configure environment variables for this project. These will be available to the agent during sessions.
          </p>

          <Textarea
            value={envFile}
            onChange={(e) => setEnvFile(e.target.value)}
            placeholder="API_KEY=your_api_key&#10;DATABASE_URL=postgres://..."
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-kibble-text-tertiary">
              {hasEnvChanges ? 'Unsaved changes' : 'No changes'}
            </p>
            <Button
              onClick={handleSaveEnv}
              disabled={!hasEnvChanges || saving}
              loading={saving}
            >
              Save Environment
            </Button>
          </div>
        </Card>

        {/* Configuration Link */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-kibble-text-primary mb-2">
            Advanced Configuration
          </h2>
          <p className="text-sm text-kibble-text-secondary mb-4">
            Configure MCP servers, subagents, and skills for this project.
          </p>
          <Link href={`/projects/${projectId}/config`}>
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open Configuration
            </Button>
          </Link>
        </Card>

        {/* Danger Zone */}
        <Card className="border-kibble-error/20">
          <h2 className="text-lg font-semibold text-kibble-error mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-kibble-text-secondary mb-4">
            Once you delete a project, there is no going back. This will delete all sessions and configuration.
          </p>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </Button>
        </Card>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.repo_full_name}"? This action cannot be undone.`}
          confirmText={deleting ? 'Deleting...' : 'Delete Project'}
          variant="danger"
        />
      </PageContainer>
    </Layout>
  )
}
