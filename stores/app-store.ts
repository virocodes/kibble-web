'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GitHubUser,
  Project,
  Session,
  ChatMessage,
  QueuedMessage,
  WorkState
} from '@/types'

interface AppState {
  // Auth
  githubToken: string | null
  githubUser: GitHubUser | null
  setGitHubToken: (token: string | null) => void
  setGitHubUser: (user: GitHubUser | null) => void
  logout: () => void

  // Projects
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void

  // Sessions
  sessions: Session[]
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (session: Session) => void
  removeSession: (sessionId: string) => void

  // Active Session
  activeSessionId: string | null
  setActiveSessionId: (id: string | null) => void

  // Messages (per session)
  messagesBySession: Record<string, ChatMessage[]>
  setMessages: (sessionId: string, messages: ChatMessage[]) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
  appendToMessage: (sessionId: string, messageId: string, content: string) => void

  // Streaming
  streamingMessageId: string | null
  setStreamingMessageId: (id: string | null) => void

  // WebSocket
  wsConnected: boolean
  wsReconnecting: boolean
  setWsConnected: (connected: boolean) => void
  setWsReconnecting: (reconnecting: boolean) => void

  // Work State
  workState: WorkState
  setWorkState: (state: WorkState) => void

  // Message Queue
  messageQueue: QueuedMessage[]
  enqueueMessage: (content: string) => QueuedMessage
  dequeueMessage: () => QueuedMessage | undefined
  clearQueue: () => void

  // Polling
  isPolling: boolean
  setIsPolling: (polling: boolean) => void

  // Loading States
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Error
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      githubToken: null,
      githubUser: null,
      setGitHubToken: (token) => set({ githubToken: token }),
      setGitHubUser: (user) => set({ githubUser: user }),
      logout: () => set({
        githubToken: null,
        githubUser: null,
        projects: [],
        sessions: [],
        messagesBySession: {},
        activeSessionId: null
      }),

      // Projects
      projects: [],
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      updateProject: (project) => set((state) => ({
        projects: state.projects.map((p) =>
          p.project_id === project.project_id ? project : p
        )
      })),
      removeProject: (projectId) => set((state) => ({
        projects: state.projects.filter((p) => p.project_id !== projectId)
      })),

      // Sessions
      sessions: [],
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((state) => ({
        sessions: [...state.sessions, session]
      })),
      updateSession: (session) => set((state) => ({
        sessions: state.sessions.map((s) =>
          s.session_id === session.session_id ? session : s
        )
      })),
      removeSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter((s) => s.session_id !== sessionId)
      })),

      // Active Session
      activeSessionId: null,
      setActiveSessionId: (id) => set({ activeSessionId: id }),

      // Messages
      messagesBySession: {},
      setMessages: (sessionId, messages) => set((state) => ({
        messagesBySession: { ...state.messagesBySession, [sessionId]: messages }
      })),
      addMessage: (sessionId, message) => set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: [...(state.messagesBySession[sessionId] || []), message]
        }
      })),
      updateMessage: (sessionId, messageId, updates) => set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: (state.messagesBySession[sessionId] || []).map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          )
        }
      })),
      appendToMessage: (sessionId, messageId, content) => set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: (state.messagesBySession[sessionId] || []).map((m) => {
            if (m.id !== messageId) return m
            const textBlocks = m.content_blocks.filter((b) => b.type === 'text')
            if (textBlocks.length > 0) {
              const lastTextBlock = textBlocks[textBlocks.length - 1]
              if (lastTextBlock.type === 'text') {
                lastTextBlock.content += content
              }
            }
            return { ...m }
          })
        }
      })),

      // Streaming
      streamingMessageId: null,
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      // WebSocket
      wsConnected: false,
      wsReconnecting: false,
      setWsConnected: (connected) => set({ wsConnected: connected }),
      setWsReconnecting: (reconnecting) => set({ wsReconnecting: reconnecting }),

      // Work State
      workState: 'ready',
      setWorkState: (state) => set({ workState: state }),

      // Message Queue
      messageQueue: [],
      enqueueMessage: (content) => {
        const message: QueuedMessage = {
          id: crypto.randomUUID(),
          content,
          queued_at: new Date().toISOString()
        }
        set((state) => ({ messageQueue: [...state.messageQueue, message] }))
        return message
      },
      dequeueMessage: () => {
        const state = get()
        if (state.messageQueue.length === 0) return undefined
        const [first, ...rest] = state.messageQueue
        set({ messageQueue: rest })
        return first
      },
      clearQueue: () => set({ messageQueue: [] }),

      // Polling
      isPolling: false,
      setIsPolling: (polling) => set({ isPolling: polling }),

      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'kibble-storage',
      partialize: (state) => ({
        githubToken: state.githubToken,
        githubUser: state.githubUser,
      }),
    }
  )
)
