'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
  queueCount?: number
}

export function ChatInput({ onSend, disabled, placeholder, queueCount = 0 }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isPlanMode = value.trim().startsWith('/plan')

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {queueCount > 0 && (
        <div className="mb-2 text-xs text-kibble-text-tertiary text-center">
          {queueCount} message{queueCount > 1 ? 's' : ''} queued
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Type a message...'}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-12',
              'text-kibble-text-primary placeholder:text-kibble-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-kibble-primary/50 focus:border-kibble-primary',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              isPlanMode && 'border-kibble-warning ring-1 ring-kibble-warning/50'
            )}
          />
          {isPlanMode && (
            <span className="absolute left-4 top-0 -translate-y-1/2 text-xs bg-kibble-warning text-white px-2 py-0.5 rounded">
              Plan Mode
            </span>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </div>

      <div className="mt-2 text-xs text-kibble-text-tertiary text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}
