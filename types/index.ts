// Session Types
export type SessionStatus =
  | 'starting'
  | 'active'
  | 'stopping'
  | 'stopped'
  | 'connected'
  | 'waiting'
  | 'ready'
  | 'disconnected'
  | 'timeout'
  | 'warning'

export type WorkState = 'ready' | 'working'

export interface Session {
  session_id: string
  repo_url: string
  status: SessionStatus
  created_at: string
  last_activity?: string
  messages_count: number
  pr_url?: string
  title?: string
  branch_name?: string
  project_id?: string
}

// Project Types
export interface Project {
  project_id: string
  repo_url: string
  repo_owner: string
  repo_name: string
  repo_full_name: string
  is_private: boolean
  language?: string
  description?: string
  created_at: string
  last_activity_at?: string
  session_count: number
  active_session_count: number
  env_file_configured: boolean
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system'

export interface ToolUse {
  id: string
  tool: string
  input?: string
}

export interface QuestionOption {
  id: string
  label: string
  description: string
}

export interface AgentQuestion {
  id: string
  question: string
  header: string
  options: QuestionOption[]
  multi_select: boolean
  selected_answers?: string[]
  custom_answer?: string
  question_index?: number
  total_questions?: number
}

export type PlanStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed'
export type PlanStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface PlanStep {
  id: string
  description: string
  files?: string[]
  status: PlanStepStatus
}

export interface AgentPlan {
  id: string
  title: string
  summary?: string
  steps: PlanStep[]
  status: PlanStatus
  rejection_feedback?: string
}

export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'tool_use'; tool_use: ToolUse }
  | { type: 'question'; question: AgentQuestion }
  | { type: 'plan'; plan: AgentPlan }

export interface ChatMessage {
  id: string
  server_message_id?: string
  role: MessageRole
  content_blocks: ContentBlock[]
  timestamp: string
  is_streaming: boolean
}

// API Response Types
export interface CreateSessionResponse {
  session_id: string
  status: string
  websocket_url: string
  message: string
}

export interface ProjectDetailResponse {
  project: Project
  sessions: Session[]
  env_file?: string
}

// GitHub Types
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name?: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description?: string
  html_url: string
  clone_url: string
  private: boolean
  updated_at: string
  language?: string
  stargazers_count: number
}

// Pull Request Types
export type PRState = 'open' | 'closed'

export interface PRUser {
  login: string
  id: number
  avatar_url: string
}

export interface PRBranch {
  ref: string
  sha: string
}

export interface PullRequest {
  id: number
  number: number
  title: string
  body?: string
  state: PRState
  html_url: string
  created_at: string
  updated_at: string
  closed_at?: string
  merged_at?: string
  draft: boolean
  mergeable?: boolean
  mergeable_state?: string
  user: PRUser
  head: PRBranch
  base: PRBranch
}

export interface PRComment {
  id: number
  body: string
  user: PRUser
  created_at: string
  updated_at: string
}

export type CheckStatus = 'queued' | 'in_progress' | 'completed'
export type CheckConclusion = 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out' | 'action_required' | 'skipped' | 'stale'

export interface CheckRun {
  id: number
  name: string
  status: CheckStatus
  conclusion?: CheckConclusion
  html_url: string
}

// WebSocket Types
export type WSMessageType =
  | 'status'
  | 'chunk'
  | 'tool_use'
  | 'message_complete'
  | 'content_updated'
  | 'tool_started'
  | 'status_changed'
  | 'question'
  | 'plan'
  | 'plan_step_updated'
  | 'error'
  | 'session_end'
  | 'pr_created'

export interface WSIncomingMessage {
  type: WSMessageType
  status?: string
  message?: string
  content?: string
  chunk_type?: string
  tool?: string
  input?: string
  session_id?: string
  message_id?: string
  question?: AgentQuestion
  plan?: AgentPlan
  plan_id?: string
  step_id?: string
  step_status?: PlanStepStatus
  pr_url?: string
}

// Project Configuration Types
export type MCPServerType = 'stdio' | 'http' | 'sse'

export interface MCPServerConfig {
  id: string
  name: string
  type: MCPServerType
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  enabled: boolean
}

export type SubagentModel = 'sonnet' | 'opus' | 'haiku'

export interface SubagentConfig {
  id: string
  name: string
  description: string
  prompt: string
  allowed_tools?: string[]
  model?: SubagentModel
  enabled: boolean
}

export interface SkillConfig {
  id: string
  name: string
  description: string
  content: string
  enabled: boolean
}

export interface ProjectConfiguration {
  mcp_servers: MCPServerConfig[]
  subagents: SubagentConfig[]
  skills: SkillConfig[]
}

// Queued Message
export interface QueuedMessage {
  id: string
  content: string
  queued_at: string
}
