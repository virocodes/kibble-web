import type { GitHubUser, GitHubRepo, PullRequest, PRComment, CheckRun } from '@/types'

const GITHUB_API_URL = 'https://api.github.com'

class GitHubClient {
  private getHeaders(token: string): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }
  }

  private async request<T>(
    path: string,
    token: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${GITHUB_API_URL}${path}`, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid GitHub token')
      }
      if (response.status === 403) {
        throw new Error('Rate limited or insufficient permissions')
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  // User
  async validateToken(token: string): Promise<GitHubUser> {
    return this.request('/user', token)
  }

  async getCurrentUser(token: string): Promise<GitHubUser> {
    return this.request('/user', token)
  }

  // Repositories
  async listUserRepos(
    token: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<GitHubRepo[]> {
    return this.request(
      `/user/repos?page=${page}&per_page=${perPage}&sort=updated&affiliation=owner,collaborator,organization_member`,
      token
    )
  }

  async fetchAllUserRepos(token: string): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const repos = await this.listUserRepos(token, page, perPage)
      allRepos.push(...repos)

      if (repos.length < perPage) break
      page++
    }

    return allRepos
  }

  // Pull Requests
  async listPullRequests(
    token: string,
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'all'
  ): Promise<PullRequest[]> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}`, token)
  }

  async getPullRequest(
    token: string,
    owner: string,
    repo: string,
    number: number
  ): Promise<PullRequest> {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}`, token)
  }

  async getPRComments(
    token: string,
    owner: string,
    repo: string,
    number: number
  ): Promise<PRComment[]> {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}/comments`, token)
  }

  async getCheckRuns(
    token: string,
    owner: string,
    repo: string,
    ref: string
  ): Promise<{ total_count: number; check_runs: CheckRun[] }> {
    return this.request(`/repos/${owner}/${repo}/commits/${ref}/check-runs`, token)
  }

  async mergePullRequest(
    token: string,
    owner: string,
    repo: string,
    number: number,
    commitTitle?: string,
    commitMessage?: string,
    mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge'
  ): Promise<{ sha: string; merged: boolean; message: string }> {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}/merge`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commit_title: commitTitle,
        commit_message: commitMessage,
        merge_method: mergeMethod,
      }),
    })
  }

  async closePullRequest(
    token: string,
    owner: string,
    repo: string,
    number: number
  ): Promise<PullRequest> {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'closed' }),
    })
  }

  async deleteBranch(
    token: string,
    owner: string,
    repo: string,
    branch: string
  ): Promise<void> {
    await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    })
  }
}

export const githubClient = new GitHubClient()
