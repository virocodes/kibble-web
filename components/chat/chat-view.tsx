'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { StatusBanner } from './status-banner'
import { SessionMenu } from './session-menu'
import { QuestionCard, PlanApproval } from '@/components/plan-mode'
import { Badge, Spinner } from '@/components/ui'
import { useAppStore } from '@/stores/app-store'
import { apiClient } from '@/lib/api'
import { wsManager, WebSocketCallbacks } from '@/lib/websocket'
import type { Session, ChatMessage, AgentQuestion, AgentPlan, SessionStatus } from '@/types'

interface ChatViewProps {
  sessionId: string
  initialSession?: Session
}

export function ChatView({ sessionId, initialSession }: ChatViewProps) {
  const router = useRouter()
  const {
    githubToken,
    messagesBySession,
    setMessages,
    addMessage,
    updateMessage,
    streamingMessageId,
    setStreamingMessageId,
    wsConnected,
    setWsConnected,
    wsReconnecting,
    setWsReconnecting,
    workState,
    setWorkState,
    messageQueue,
    enqueueMessage,
    isPolling,
    setIsPolling,
  } = useAppStore()

  const [session, setSession] = useState<Session | null>(initialSession || null)
  const [loading, setLoading] = useState(!initialSession)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<AgentQuestion | null>(null)
  const [currentPlan, setCurrentPlan] = useState<AgentPlan | null>(null)

  const messages = messagesBySession[sessionId] || []
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  // Load session and messages
  useEffect(() => {
    if (!githubToken) {
      router.replace('/login')
      return
    }

    loadSession()
    loadMessages()

    return () => {
      wsManager.disconnect()
      stopPolling()
    }
  }, [sessionId, githubToken])

  // Connect WebSocket after session loads
  useEffect(() => {
    if (session && githubToken) {
      connectWebSocket()
    }
  }, [session?.session_id])

  const loadSession = async () => {
    if (!githubToken) return
    try {
      const data = await apiClient.getSession(sessionId, githubToken)
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!githubToken) return
    try {
      const msgs = await apiClient.getMessages(sessionId, githubToken)
      setMessages(sessionId, msgs)
      if (msgs.length > 0) {
        lastMessageIdRef.current = msgs[msgs.length - 1].id
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const fetchNewMessages = useCallback(async () => {
    if (!githubToken) return
    try {
      const msgs = await apiClient.getMessages(
        sessionId,
        githubToken,
        lastMessageIdRef.current || undefined
      )
      if (msgs && msgs.length > 0) {
        // Merge new messages, avoiding duplicates
        const currentMessages = messages || []
        const existingIds = new Set(currentMessages.map((m) => m.id))
        const newMsgs = msgs.filter((m) => !existingIds.has(m.id))
        if (newMsgs.length > 0) {
          setMessages(sessionId, [...currentMessages, ...newMsgs])
          lastMessageIdRef.current = msgs[msgs.length - 1].id
        }
      }
    } catch (err) {
      console.error('Failed to fetch new messages:', err)
    }
  }, [sessionId, githubToken, messages, setMessages])

  const connectWebSocket = () => {
    const callbacks: WebSocketCallbacks = {
      onConnect: () => {
        setWsConnected(true)
        setWsReconnecting(false)
        stopPolling()
      },
      onDisconnect: () => {
        setWsConnected(false)
        setWsReconnecting(true)
        // Start polling as fallback
        startPolling()
      },
      onContentUpdated: () => {
        fetchNewMessages()
      },
      onToolStarted: (tool, file) => {
        setWorkState('working')
        // Could add a tool indicator here
      },
      onMessageComplete: () => {
        setStreamingMessageId(null)
        setWorkState('ready')
        fetchNewMessages()
      },
      onStatusChanged: (status: SessionStatus, message?: string) => {
        setSession((prev) => (prev ? { ...prev, status } : null))
        if (status === 'stopped' || status === 'disconnected') {
          setWorkState('ready')
        }
      },
      onQuestion: (question) => {
        setCurrentQuestion(question)
        setWorkState('ready')
      },
      onPlan: (plan) => {
        setCurrentPlan(plan)
        setWorkState('ready')
      },
      onPlanStepUpdated: (planId, stepId, status) => {
        setCurrentPlan((prev) => {
          if (!prev || prev.id !== planId) return prev
          return {
            ...prev,
            steps: prev.steps.map((s) =>
              s.id === stepId ? { ...s, status } : s
            ),
          }
        })
      },
      onChunk: (content) => {
        // Handle streaming chunks (legacy)
        if (streamingMessageId) {
          // Append to existing streaming message
        }
      },
      onError: (message) => {
        setError(message)
        setWorkState('ready')
      },
      onSessionEnd: (prUrl) => {
        setSession((prev) => (prev ? { ...prev, status: 'stopped', pr_url: prUrl } : null))
        setWorkState('ready')
      },
      onPRCreated: (url) => {
        setSession((prev) => (prev ? { ...prev, pr_url: url } : null))
      },
    }

    wsManager.connect(sessionId, callbacks)
  }

  const startPolling = () => {
    if (pollingRef.current) return
    setIsPolling(true)
    pollingRef.current = setInterval(() => {
      fetchNewMessages()
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsPolling(false)
  }

  const handleSendMessage = async (content: string) => {
    if (!githubToken) return

    // Create optimistic user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content_blocks: [{ type: 'text', content }],
      timestamp: new Date().toISOString(),
      is_streaming: false,
    }

    addMessage(sessionId, userMessage)
    setWorkState('working')

    // Send via WebSocket if connected, otherwise use REST API
    if (wsManager.isConnected) {
      wsManager.sendMessage(content)
    } else {
      // Use REST API in polling mode
      try {
        await apiClient.sendMessage(sessionId, content, githubToken)
        // Start polling for the response
        startPolling()
      } catch (err) {
        console.error('Failed to send message:', err)
        setError(err instanceof Error ? err.message : 'Failed to send message')
        setWorkState('ready')
        return
      }
    }

    // Create placeholder for assistant response
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content_blocks: [],
      timestamp: new Date().toISOString(),
      is_streaming: true,
    }
    addMessage(sessionId, assistantMessage)
    setStreamingMessageId(assistantMessage.id)
  }

  const handleCommit = () => {
    if (wsManager.isConnected) {
      wsManager.sendCommand('commit')
      setWorkState('working')
    }
  }

  const handleCreatePR = () => {
    if (wsManager.isConnected) {
      wsManager.sendCommand('create_pr')
      setWorkState('working')
    }
  }

  const handleViewPR = () => {
    if (session?.pr_url) {
      window.open(session.pr_url, '_blank')
    }
  }

  const handleEndSession = async () => {
    if (!githubToken) return
    try {
      await apiClient.endSession(sessionId, githubToken)
      router.push('/sessions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session')
    }
  }

  const handleRetryConnection = () => {
    setWsReconnecting(true)
    wsManager.disconnect()
    connectWebSocket()
  }

  const handleAnswerQuestion = async (answers: string[], customAnswer?: string) => {
    if (!currentQuestion || !githubToken) return

    try {
      await apiClient.submitAnswer(
        sessionId,
        currentQuestion.id,
        answers,
        customAnswer,
        githubToken
      )
      setCurrentQuestion(null)
      setWorkState('working')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    }
  }

  const handleApprovePlan = async () => {
    if (!currentPlan || !githubToken) return

    try {
      await apiClient.approvePlan(sessionId, currentPlan.id, githubToken)
      setCurrentPlan((prev) => prev ? { ...prev, status: 'approved' } : null)
      setWorkState('working')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve plan')
    }
  }

  const handleRejectPlan = async (feedback: string) => {
    if (!currentPlan || !githubToken) return

    try {
      await apiClient.rejectPlan(sessionId, currentPlan.id, feedback, githubToken)
      setCurrentPlan(null)
      setWorkState('working')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject plan')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-kibble-text-secondary mb-4">Session not found</p>
          <Link href="/sessions" className="text-kibble-primary hover:underline">
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  const isActive = ['active', 'ready', 'connected', 'waiting'].includes(session.status)
  const isWorking = workState === 'working'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link
            href={session.project_id ? `/projects/${session.project_id}` : '/sessions'}
            className="text-kibble-text-secondary hover:text-kibble-text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-semibold text-kibble-text-primary">
              {session.title || 'Chat Session'}
            </h1>
            <p className="text-xs text-kibble-text-tertiary">
              {session.repo_url.split('/').slice(-2).join('/')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isActive ? 'success' : 'outline'}
            size="sm"
          >
            {session.status}
          </Badge>
          {isWorking && (
            <Badge variant="warning" size="sm">
              Working...
            </Badge>
          )}
          <SessionMenu
            onCommit={handleCommit}
            onCreatePR={handleCreatePR}
            onViewPR={session.pr_url ? handleViewPR : undefined}
            onEndSession={handleEndSession}
            prUrl={session.pr_url}
            disabled={isWorking}
          />
        </div>
      </div>

      {/* Connection Status */}
      {!wsConnected && wsReconnecting && (
        <StatusBanner type="reconnecting" />
      )}
      {!wsConnected && !wsReconnecting && isPolling && (
        <StatusBanner type="polling" />
      )}
      {!wsConnected && !wsReconnecting && !isPolling && (
        <StatusBanner type="disconnected" onRetry={handleRetryConnection} />
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-kibble-error/10 text-kibble-error px-4 py-2 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        streamingMessageId={streamingMessageId}
      />

      {/* Question Card */}
      {currentQuestion && (
        <div className="px-4 py-3 border-t border-gray-200">
          <QuestionCard
            question={currentQuestion}
            onSubmit={handleAnswerQuestion}
            disabled={isWorking}
          />
        </div>
      )}

      {/* Plan Approval */}
      {currentPlan && (
        <div className="px-4 py-3 border-t border-gray-200">
          <PlanApproval
            plan={currentPlan}
            onApprove={handleApprovePlan}
            onReject={handleRejectPlan}
            disabled={isWorking}
          />
        </div>
      )}

      {/* Input */}
      {isActive && (
        <ChatInput
          onSend={handleSendMessage}
          disabled={isWorking}
          queueCount={messageQueue.length}
          placeholder={isWorking ? 'Waiting for response...' : undefined}
        />
      )}

      {/* Session Ended */}
      {!isActive && (
        <div className="border-t border-gray-200 bg-kibble-background p-4 text-center">
          <p className="text-kibble-text-secondary text-sm mb-2">
            This session has ended
          </p>
          {session.pr_url && (
            <a
              href={session.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kibble-primary hover:underline text-sm"
            >
              View Pull Request
            </a>
          )}
        </div>
      )}
    </div>
  )
}
