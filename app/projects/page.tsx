'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, PageContainer, PageHeader } from '@/components/layout'
import { Button, LoadingScreen } from '@/components/ui'
import { ProjectList, NewProjectModal } from '@/components/projects'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const router = useRouter()
  const { githubToken, projects, setProjects, addProject } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }

    loadProjects()
  }, [githubToken])

  const loadProjects = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const fetchedProjects = await apiClient.listProjects(githubToken)
      setProjects(fetchedProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (project: Project) => {
    addProject(project)
    router.push(`/projects/${project.project_id}`)
  }

  if (!githubToken) {
    return null
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Projects"
          description={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          actions={
            <Button onClick={() => setShowNewModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Button>
          }
        />

        {loading ? (
          <LoadingScreen message="Loading projects..." />
        ) : (
          <ProjectList projects={projects} />
        )}
      </PageContainer>

      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleProjectCreated}
      />
    </Layout>
  )
}
