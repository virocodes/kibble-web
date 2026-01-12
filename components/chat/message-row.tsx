'use client'

import { cn } from '@/lib/utils'
import { ToolBadge } from './tool-badge'
import { MarkdownRenderer } from './markdown-renderer'
import type { ChatMessage, ContentBlock } from '@/types'

interface MessageRowProps {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageRow({ message, isStreaming }: MessageRowProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-kibble-text-tertiary bg-kibble-background px-3 py-1 rounded-full">
          {getTextContent(message.content_blocks)}
        </span>
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-kibble-primary text-white rounded-2xl rounded-br-sm px-4 py-2">
          <p className="whitespace-pre-wrap">{getTextContent(message.content_blocks)}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="mb-4">
      <div className="text-kibble-text-primary">
        {message.content_blocks.map((block, index) => (
          <ContentBlockRenderer
            key={index}
            block={block}
            isLast={index === message.content_blocks.length - 1}
            isStreaming={isStreaming}
          />
        ))}
        {isStreaming && (
          <span className="inline-flex items-center gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-kibble-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-kibble-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-kibble-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}

function ContentBlockRenderer({
  block,
  isLast,
  isStreaming,
}: {
  block: ContentBlock
  isLast: boolean
  isStreaming?: boolean
}) {
  switch (block.type) {
    case 'text':
      return (
        <div className={cn(isLast && isStreaming && 'inline')}>
          <MarkdownRenderer content={block.content} />
        </div>
      )

    case 'tool_use':
      return (
        <div className="my-2">
          <ToolBadge tool={block.tool_use.tool} file={block.tool_use.input} />
        </div>
      )

    case 'question':
      // Questions are handled separately in the chat view
      return null

    case 'plan':
      // Plans are handled separately in the chat view
      return null

    default:
      return null
  }
}

function getTextContent(blocks: ContentBlock[]): string {
  return blocks
    .filter((b) => b.type === 'text')
    .map((b) => (b.type === 'text' ? b.content : ''))
    .join('\n')
}
