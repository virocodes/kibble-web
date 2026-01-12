'use client'

import { type ReactNode } from 'react'
import { Header } from './header'

interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-kibble-background">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  )
}

// Page container with max width
export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {children}
    </div>
  )
}

// Page header with title and actions
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-kibble-text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-kibble-text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
