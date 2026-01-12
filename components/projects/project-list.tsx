'use client'

import { useState, useMemo } from 'react'
import { Input, EmptyState } from '@/components/ui'
import { ProjectCard } from './project-card'
import type { Project } from '@/types'

interface ProjectListProps {
  projects: Project[]
  loading?: boolean
}

export function ProjectList({ projects, loading }: ProjectListProps) {
  const [search, setSearch] = useState('')

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects
    const query = search.toLowerCase()
    return projects.filter(
      (p) =>
        p.repo_full_name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    )
  }, [projects, search])

  const activeProjects = useMemo(
    () => filteredProjects.filter((p) => p.active_session_count > 0),
    [filteredProjects]
  )

  const inactiveProjects = useMemo(
    () => filteredProjects.filter((p) => p.active_session_count === 0),
    [filteredProjects]
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-kibble-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try a different search term' : 'Create your first project to get started'}
        />
      ) : (
        <>
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                Active ({activeProjects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.project_id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Inactive Projects */}
          {inactiveProjects.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-kibble-text-secondary uppercase tracking-wider mb-3">
                {activeProjects.length > 0 ? 'Recent' : 'Projects'} ({inactiveProjects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveProjects.map((project) => (
                  <ProjectCard key={project.project_id} project={project} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
