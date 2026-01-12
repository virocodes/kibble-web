'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match && !className

          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-kibble-text-primary"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <SyntaxHighlighter
              style={oneDark}
              language={match?.[1] || 'text'}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          )
        },
        pre({ children }) {
          return <div className="my-3">{children}</div>
        },
        p({ children }) {
          return <p className="my-2 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="my-2 ml-4 list-disc">{children}</ul>
        },
        ol({ children }) {
          return <ol className="my-2 ml-4 list-decimal">{children}</ol>
        },
        li({ children }) {
          return <li className="my-1">{children}</li>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kibble-primary hover:underline"
            >
              {children}
            </a>
          )
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-2 text-kibble-text-secondary italic">
              {children}
            </blockquote>
          )
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold my-3">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold my-2">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-bold my-2">{children}</h3>
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full divide-y divide-gray-200">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-kibble-text-secondary uppercase tracking-wider">
              {children}
            </th>
          )
        },
        td({ children }) {
          return (
            <td className="px-3 py-2 text-sm">{children}</td>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
