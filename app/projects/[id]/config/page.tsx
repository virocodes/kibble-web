'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout, PageContainer } from '@/components/layout'
import { Card, Button, LoadingScreen } from '@/components/ui'
import { MCPServerEditor, SubagentEditor, SkillEditor, JSONEditor } from '@/components/config'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ProjectConfiguration, Project } from '@/types'

type Tab = 'mcp' | 'subagents' | 'skills' | 'json'

export default function ProjectConfigPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { githubToken } = useAppStore()

  const [project, setProject] = useState<Project | null>(null)
  const [config, setConfig] = useState<ProjectConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('mcp')
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }
    loadData()
  }, [projectId, githubToken])

  const loadData = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const [projectData, configData] = await Promise.all([
        apiClient.getProject(projectId, githubToken),
        apiClient.getProjectConfiguration(projectId, githubToken),
      ])
      setProject(projectData.project)
      setConfig(configData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (newConfig: ProjectConfiguration) => {
    setConfig(newConfig)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!githubToken || !config) return

    setSaving(true)
    setError(null)
    try {
      await apiClient.updateProjectConfiguration(projectId, config, githubToken)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!githubToken) return null

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingScreen message="Loading configuration..." />
        </PageContainer>
      </Layout>
    )
  }

  if (!project || !config) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-kibble-error mb-4">{error || 'Failed to load configuration'}</p>
            <Link href={`/projects/${projectId}`} className="text-kibble-primary hover:underline">
              Back to Project
            </Link>
          </div>
        </PageContainer>
      </Layout>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'mcp', label: 'MCP Servers' },
    { id: 'subagents', label: 'Subagents' },
    { id: 'skills', label: 'Skills' },
    { id: 'json', label: 'JSON' },
  ]

  return (
    <Layout>
      <PageContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-1 text-sm text-kibble-text-secondary hover:text-kibble-text-primary mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Project
            </Link>
            <h1 className="text-xl font-bold text-kibble-text-primary">
              Configuration
            </h1>
            <p className="text-sm text-kibble-text-secondary">
              {project.repo_full_name}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            loading={saving}
          >
            Save Changes
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-kibble-error">
            {error}
          </div>
        )}

        {/* Unsaved changes warning */}
        {hasChanges && (
          <div className="mb-6 p-3 bg-kibble-warning/10 border border-kibble-warning/30 rounded-lg text-sm text-kibble-warning flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            You have unsaved changes
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-kibble-primary text-kibble-primary'
                    : 'border-transparent text-kibble-text-secondary hover:text-kibble-text-primary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Card>
          {activeTab === 'mcp' && (
            <MCPServerEditor
              servers={config.mcp_servers}
              onChange={(servers) => handleConfigChange({ ...config, mcp_servers: servers })}
            />
          )}

          {activeTab === 'subagents' && (
            <SubagentEditor
              subagents={config.subagents}
              onChange={(subagents) => handleConfigChange({ ...config, subagents })}
            />
          )}

          {activeTab === 'skills' && (
            <SkillEditor
              skills={config.skills}
              onChange={(skills) => handleConfigChange({ ...config, skills })}
            />
          )}

          {activeTab === 'json' && (
            <JSONEditor
              config={config}
              onChange={handleConfigChange}
            />
          )}
        </Card>
      </PageContainer>
    </Layout>
  )
}
