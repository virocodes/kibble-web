'use client'

import { useEffect, useRef } from 'react'
import { MessageRow } from './message-row'
import type { ChatMessage } from '@/types'

interface MessageListProps {
  messages: ChatMessage[]
  streamingMessageId?: string | null
}

export function MessageList({ messages, streamingMessageId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  // Track if user is near bottom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const threshold = 100
      const { scrollTop, scrollHeight, clientHeight } = container
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < threshold
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll when new messages arrive (if near bottom)
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingMessageId])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-kibble-text-tertiary">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-kibble-text-tertiary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Send a message to start the conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      {messages.map((message) => (
        <MessageRow
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
