'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { githubClient } from '@/lib/github'

export function TokenEntry() {
  const router = useRouter()
  const { setGitHubToken, setGitHubUser } = useAppStore()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate token with GitHub
      const user = await githubClient.validateToken(token.trim())

      // Save to store
      setGitHubToken(token.trim())
      setGitHubUser(user)

      // Redirect to projects
      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kibble-background p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-kibble-primary mb-2">
            Welcome to Kibble
          </h1>
          <p className="text-kibble-text-secondary">
            AI-powered coding assistant for your GitHub repositories
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="GitHub Personal Access Token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={error || undefined}
            helperText="Create a token with 'repo' and 'workflow' scopes at GitHub Settings → Developer settings → Personal access tokens"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!token.trim()}
          >
            Connect GitHub
          </Button>
        </form>

        <div className="mt-6 p-4 bg-kibble-background rounded-lg">
          <h3 className="text-sm font-medium text-kibble-text-primary mb-2">
            Required Token Scopes
          </h3>
          <ul className="text-xs text-kibble-text-secondary space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-kibble-success rounded-full" />
              <code className="bg-gray-100 px-1 rounded">repo</code> - Full control of repositories
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-kibble-success rounded-full" />
              <code className="bg-gray-100 px-1 rounded">workflow</code> - Update GitHub Actions
            </li>
          </ul>
        </div>

        <p className="mt-6 text-xs text-center text-kibble-text-tertiary">
          Your token is stored locally in your browser and is only sent to GitHub and our API.
        </p>
      </Card>
    </div>
  )
}
