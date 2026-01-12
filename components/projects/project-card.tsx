'use client'

import Link from 'next/link'
import { Card, Badge, StatusBadge } from '@/components/ui'
import { formatDate, getLanguageColor } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.project_id}`}>
      <Card interactive className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {project.is_private ? (
              <svg className="w-4 h-4 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 4a4 4 0 018 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.784 2.784 6 3.75 6H4V4zm8.25 3.5h-8.5a.25.25 0 00-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25zM10.5 6V4a2.5 2.5 0 10-5 0v2h5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
              </svg>
            )}
            <h3 className="font-semibold text-kibble-text-primary truncate">
              {project.repo_full_name}
            </h3>
          </div>
          {project.active_session_count > 0 && (
            <StatusBadge status="active" />
          )}
        </div>

        {project.description && (
          <p className="text-sm text-kibble-text-secondary line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-kibble-text-tertiary">
          {project.language && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getLanguageColor(project.language) }}
              />
              <span>{project.language}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{project.session_count} sessions</span>
          </div>

          {project.env_file_configured && (
            <Badge variant="success" size="sm">
              Env
            </Badge>
          )}

          <span className="ml-auto">
            {formatDate(project.last_activity_at || project.created_at)}
          </span>
        </div>
      </Card>
    </Link>
  )
}
