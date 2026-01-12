'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Input, Card, Spinner } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { githubClient } from '@/lib/github'
import { apiClient } from '@/lib/api'
import { getLanguageColor } from '@/lib/utils'
import type { GitHubRepo, Project } from '@/types'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (project: Project) => void
}

export function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const { githubToken } = useAppStore()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && githubToken && repos.length === 0) {
      loadRepos()
    }
  }, [isOpen, githubToken])

  const loadRepos = async () => {
    if (!githubToken) return
    setLoading(true)
    try {
      const fetchedRepos = await githubClient.fetchAllUserRepos(githubToken)
      setRepos(fetchedRepos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!selectedRepo || !githubToken) return

    setCreating(true)
    setError(null)

    try {
      const result = await apiClient.createProject(selectedRepo.clone_url, githubToken)
      onCreated(result.project)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setSelectedRepo(null)
    setSearch('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Project" size="lg">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-kibble-error">
          {error}
        </div>
      )}

      {selectedRepo ? (
        <div className="space-y-4">
          <Card className="bg-kibble-background">
            <div className="flex items-center gap-3">
              {selectedRepo.private ? (
                <svg className="w-5 h-5 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 4a4 4 0 018 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.784 2.784 6 3.75 6H4V4zm8.25 3.5h-8.5a.25.25 0 00-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25zM10.5 6V4a2.5 2.5 0 10-5 0v2h5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-kibble-text-tertiary" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                </svg>
              )}
              <div>
                <p className="font-medium text-kibble-text-primary">{selectedRepo.full_name}</p>
                {selectedRepo.description && (
                  <p className="text-sm text-kibble-text-secondary">{selectedRepo.description}</p>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedRepo(null)}>
              Back
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-8 text-kibble-text-secondary">
                {search ? 'No repositories found' : 'No repositories available'}
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-kibble-background border-b border-gray-100 last:border-0 text-left transition-colors"
                >
                  {repo.private ? (
                    <svg className="w-4 h-4 text-kibble-text-tertiary shrink-0" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4 4a4 4 0 018 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.784 2.784 6 3.75 6H4V4zm8.25 3.5h-8.5a.25.25 0 00-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25zM10.5 6V4a2.5 2.5 0 10-5 0v2h5z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-kibble-text-tertiary shrink-0" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                    </svg>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-kibble-text-primary truncate">
                      {repo.full_name}
                    </p>
                    {repo.description && (
                      <p className="text-sm text-kibble-text-secondary truncate">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.language && (
                    <div className="flex items-center gap-1.5 text-xs text-kibble-text-tertiary shrink-0">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                      />
                      {repo.language}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
