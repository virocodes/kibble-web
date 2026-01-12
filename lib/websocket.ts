import type { WSIncomingMessage, AgentQuestion, AgentPlan, PlanStepStatus, SessionStatus } from '@/types'

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://claude-agent-alb-1954565240.us-east-1.elb.amazonaws.com'

export interface WebSocketCallbacks {
  onConnect?: () => void
  onDisconnect?: (error?: Error) => void
  onContentUpdated?: (messageId?: string) => void
  onToolStarted?: (tool: string, file?: string) => void
  onMessageComplete?: (messageId?: string) => void
  onStatusChanged?: (status: SessionStatus, message?: string) => void
  onQuestion?: (question: AgentQuestion) => void
  onPlan?: (plan: AgentPlan) => void
  onPlanStepUpdated?: (planId: string, stepId: string, status: PlanStepStatus) => void
  onChunk?: (content: string, chunkType?: string) => void
  onError?: (message: string) => void
  onSessionEnd?: (prUrl?: string) => void
  onPRCreated?: (url: string) => void
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private sessionId: string | null = null
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private shouldReconnect = false
  private lastDisconnectTime: Date | null = null
  private reconnectThrottle = 5000
  private pingInterval: NodeJS.Timeout | null = null
  private _forcePolling = false

  // Check if we're on HTTPS - WebSocket to ws:// won't work from HTTPS
  private get shouldUsePolling(): boolean {
    if (this._forcePolling) return true
    if (typeof window === 'undefined') return false

    // If page is HTTPS and WebSocket URL is ws://, we must use polling
    const isHttps = window.location.protocol === 'https:'
    const isInsecureWs = WS_BASE_URL.startsWith('ws://') && !WS_BASE_URL.startsWith('wss://')

    return isHttps && isInsecureWs
  }

  connect(sessionId: string, callbacks: WebSocketCallbacks): void {
    this.sessionId = sessionId
    this.callbacks = callbacks
    this.shouldReconnect = true

    // If we need to use polling (HTTPS -> ws://), immediately trigger disconnect
    if (this.shouldUsePolling) {
      console.log('[WebSocket] Skipping WebSocket (HTTPS page with insecure ws:// endpoint), using polling')
      this._forcePolling = true
      // Immediately call onDisconnect to trigger polling fallback
      setTimeout(() => {
        this.callbacks.onDisconnect?.(new Error('WebSocket unavailable on HTTPS'))
      }, 0)
      return
    }

    this.establishConnection()
  }

  private establishConnection(): void {
    if (!this.sessionId) return
    if (this.shouldUsePolling) return

    // Throttle reconnections
    if (this.lastDisconnectTime) {
      const timeSinceDisconnect = Date.now() - this.lastDisconnectTime.getTime()
      if (timeSinceDisconnect < this.reconnectThrottle) {
        console.log('[WebSocket] Throttling reconnection')
        return
      }
    }

    const url = `${WS_BASE_URL}/sessions/${this.sessionId}/ws`
    console.log('[WebSocket] Connecting to:', url)

    try {
      this.ws = new WebSocket(url)
      this.setupEventHandlers()
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      this.handleDisconnect(error as Error)
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected')
      this.reconnectAttempts = 0
      this.startPingTimer()
      this.callbacks.onConnect?.()
    }

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Closed:', event.code, event.reason)
      this.handleDisconnect()
    }

    this.ws.onerror = (event) => {
      console.error('[WebSocket] Error:', event)
      this.handleDisconnect(new Error('WebSocket error'))
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WSIncomingMessage = JSON.parse(event.data)
        this.processMessage(message)
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error)
      }
    }
  }

  private processMessage(message: WSIncomingMessage): void {
    console.log('[WebSocket] Received:', message.type)

    switch (message.type) {
      case 'content_updated':
        this.callbacks.onContentUpdated?.(message.message_id)
        break

      case 'tool_started':
        this.callbacks.onToolStarted?.(message.tool!, message.content)
        break

      case 'message_complete':
        this.callbacks.onMessageComplete?.(message.message_id)
        break

      case 'status_changed':
        this.callbacks.onStatusChanged?.(
          message.status as SessionStatus,
          message.message
        )
        break

      case 'question':
        if (message.question) {
          this.callbacks.onQuestion?.(message.question)
        }
        break

      case 'plan':
        if (message.plan) {
          this.callbacks.onPlan?.(message.plan)
        }
        break

      case 'plan_step_updated':
        if (message.plan_id && message.step_id && message.step_status) {
          this.callbacks.onPlanStepUpdated?.(
            message.plan_id,
            message.step_id,
            message.step_status
          )
        }
        break

      case 'chunk':
        this.callbacks.onChunk?.(message.content!, message.chunk_type)
        break

      case 'error':
        this.callbacks.onError?.(message.message || 'Unknown error')
        break

      case 'session_end':
        this.callbacks.onSessionEnd?.(message.pr_url)
        break

      case 'pr_created':
        this.callbacks.onPRCreated?.(message.pr_url!)
        break

      case 'status':
        // Legacy status message
        break

      default:
        console.log('[WebSocket] Unknown message type:', message.type)
    }
  }

  private handleDisconnect(error?: Error): void {
    this.stopPingTimer()
    this.lastDisconnectTime = new Date()
    this.callbacks.onDisconnect?.(error)

    // Don't try to reconnect if we're in forced polling mode
    if (this._forcePolling) return

    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts})...`)
      setTimeout(() => this.establishConnection(), this.reconnectDelay)
    }
  }

  private startPingTimer(): void {
    this.stopPingTimer()
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // WebSocket ping is handled by the browser
      }
    }, 30000)
  }

  private stopPingTimer(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  disconnect(): void {
    this.shouldReconnect = false
    this._forcePolling = false
    this.stopPingTimer()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.sessionId = null
  }

  send(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send - not connected')
    }
  }

  sendMessage(content: string): void {
    this.send({ type: 'message', content })
  }

  sendCommand(action: 'commit' | 'create_pr' | 'stop', options?: Record<string, string>): void {
    this.send({ type: 'command', action, ...options })
  }

  sendAnswer(questionId: string, answers: string[], customAnswer?: string): void {
    this.send({
      type: 'answer',
      question_id: questionId,
      answers,
      custom_answer: customAnswer,
    })
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING
  }

  get isPollingMode(): boolean {
    return this._forcePolling
  }
}

export const wsManager = new WebSocketManager()
