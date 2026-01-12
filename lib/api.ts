import type {
  Session,
  Project,
  CreateSessionResponse,
  ProjectDetailResponse,
  ChatMessage,
  ProjectConfiguration,
} from '@/types'

// Use local API routes to proxy requests (avoids mixed content issues)
const API_BASE_URL = '/api'

class APIClient {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })
    }
    return url.toString()
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown
      params?: Record<string, string>
    }
  ): Promise<T> {
    const url = this.buildUrl(`${API_BASE_URL}${path}`, options?.params)

    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `API Error: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Sessions
  async createSession(
    repoUrl: string,
    githubToken: string,
    envFile?: string
  ): Promise<CreateSessionResponse> {
    return this.request('POST', '/sessions', {
      body: {
        repo_url: repoUrl,
        github_token: githubToken,
        env_file: envFile,
      },
    })
  }

  async listSessions(githubToken: string): Promise<Session[]> {
    const response = await this.request<{ sessions: Session[] }>('GET', '/sessions', {
      params: { github_token: githubToken },
    })
    return response.sessions
  }

  async getSession(sessionId: string, githubToken: string): Promise<Session> {
    return this.request('GET', `/sessions/${sessionId}`, {
      params: { github_token: githubToken },
    })
  }

  async updateSession(
    sessionId: string,
    updates: { title?: string },
    githubToken: string
  ): Promise<void> {
    await this.request('PATCH', `/sessions/${sessionId}`, {
      body: updates,
      params: { github_token: githubToken },
    })
  }

  async endSession(sessionId: string, githubToken: string): Promise<void> {
    await this.request('DELETE', `/sessions/${sessionId}`, {
      params: { github_token: githubToken },
    })
  }

  async deleteSession(sessionId: string, githubToken: string): Promise<void> {
    await this.request('DELETE', `/sessions/${sessionId}`, {
      params: { github_token: githubToken, delete: 'true' },
    })
  }

  async continueSession(
    sessionId: string,
    githubToken: string,
    envFile?: string
  ): Promise<CreateSessionResponse> {
    return this.request('POST', `/sessions/${sessionId}/continue`, {
      body: {
        github_token: githubToken,
        env_file: envFile,
      },
    })
  }

  async getMessages(
    sessionId: string,
    githubToken: string,
    since?: string
  ): Promise<ChatMessage[]> {
    const params: Record<string, string> = { github_token: githubToken }
    if (since) params.since = since

    const response = await this.request<{ messages: ChatMessage[] }>(
      'GET',
      `/sessions/${sessionId}/messages`,
      { params }
    )
    return response.messages
  }

  // Projects
  async createProject(
    repoUrl: string,
    githubToken: string,
    envFile?: string
  ): Promise<{ project: Project; message: string }> {
    return this.request('POST', '/projects', {
      body: {
        repo_url: repoUrl,
        github_token: githubToken,
        env_file: envFile,
      },
    })
  }

  async createRepoAndProject(
    name: string,
    description: string,
    isPrivate: boolean,
    includeReadme: boolean,
    githubToken: string,
    envFile?: string
  ): Promise<{ project: Project; message: string }> {
    return this.request('POST', '/projects/create-repo', {
      body: {
        name,
        description,
        is_private: isPrivate,
        include_readme: includeReadme,
        github_token: githubToken,
        env_file: envFile,
      },
    })
  }

  async listProjects(githubToken: string): Promise<Project[]> {
    const response = await this.request<{ projects: Project[] }>('GET', '/projects', {
      params: { github_token: githubToken },
    })
    return response.projects
  }

  async getProject(projectId: string, githubToken: string): Promise<ProjectDetailResponse> {
    return this.request('GET', `/projects/${projectId}`, {
      params: { github_token: githubToken },
    })
  }

  async updateProject(
    projectId: string,
    envFile: string,
    githubToken: string
  ): Promise<void> {
    await this.request('PATCH', `/projects/${projectId}`, {
      body: { env_file: envFile },
      params: { github_token: githubToken },
    })
  }

  async deleteProject(projectId: string, githubToken: string): Promise<void> {
    await this.request('DELETE', `/projects/${projectId}`, {
      params: { github_token: githubToken },
    })
  }

  async createSessionInProject(
    projectId: string,
    githubToken: string,
    taskDescription?: string
  ): Promise<CreateSessionResponse> {
    return this.request('POST', `/projects/${projectId}/sessions`, {
      body: {
        github_token: githubToken,
        task_description: taskDescription,
      },
    })
  }

  // Project Configuration
  async getProjectConfiguration(
    projectId: string,
    githubToken: string
  ): Promise<ProjectConfiguration> {
    return this.request('GET', `/projects/${projectId}/configuration`, {
      params: { github_token: githubToken },
    })
  }

  async updateProjectConfiguration(
    projectId: string,
    config: ProjectConfiguration,
    githubToken: string
  ): Promise<void> {
    await this.request('PUT', `/projects/${projectId}/configuration`, {
      body: config,
      params: { github_token: githubToken },
    })
  }

  // Plan Mode
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answers: string[],
    customAnswer?: string,
    githubToken?: string
  ): Promise<void> {
    await this.request('POST', `/sessions/${sessionId}/answer`, {
      body: {
        question_id: questionId,
        answers,
        custom_answer: customAnswer,
      },
      params: githubToken ? { github_token: githubToken } : undefined,
    })
  }

  async approvePlan(
    sessionId: string,
    planId: string,
    githubToken?: string
  ): Promise<void> {
    await this.request('POST', `/sessions/${sessionId}/plan/${planId}/approve`, {
      params: githubToken ? { github_token: githubToken } : undefined,
    })
  }

  async rejectPlan(
    sessionId: string,
    planId: string,
    feedback: string,
    githubToken?: string
  ): Promise<void> {
    await this.request('POST', `/sessions/${sessionId}/plan/${planId}/reject`, {
      body: { feedback },
      params: githubToken ? { github_token: githubToken } : undefined,
    })
  }

  // Health
  async healthCheck(): Promise<{ status: string; active_sessions: number }> {
    return this.request('GET', '/health')
  }

  // Send message via REST (for polling mode)
  async sendMessage(
    sessionId: string,
    message: string,
    githubToken: string
  ): Promise<void> {
    await this.request('POST', `/sessions/${sessionId}/message`, {
      body: {
        message,
        github_token: githubToken,
      },
    })
  }
}

export const apiClient = new APIClient()
