'use client'

import { cn } from '@/lib/utils'

const TOOL_COLORS: Record<string, { bg: string; text: string }> = {
  Read: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Write: { bg: 'bg-green-100', text: 'text-green-700' },
  Edit: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Bash: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Glob: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  Grep: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Task: { bg: 'bg-pink-100', text: 'text-pink-700' },
  WebFetch: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  WebSearch: { bg: 'bg-teal-100', text: 'text-teal-700' },
}

interface ToolBadgeProps {
  tool: string
  file?: string
  className?: string
}

export function ToolBadge({ tool, file, className }: ToolBadgeProps) {
  const colors = TOOL_COLORS[tool] || { bg: 'bg-gray-100', text: 'text-gray-700' }

  const getIcon = () => {
    switch (tool) {
      case 'Read':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      case 'Write':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'Edit':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )
      case 'Bash':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {getIcon()}
      {tool}
      {file && (
        <span className="opacity-70 truncate max-w-[150px]">
          : {file.split('/').pop()}
        </span>
      )}
    </span>
  )
}
