import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function extractRepoName(url: string): string {
  const cleanUrl = url.replace(/\.git$/, '')
  const parts = cleanUrl.split('/')
  return parts.slice(-2).join('/')
}

export function extractRepoOwner(url: string): string {
  const cleanUrl = url.replace(/\.git$/, '')
  const parts = cleanUrl.split('/')
  return parts[parts.length - 2] || ''
}

export function getLanguageColor(language: string | undefined): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    PHP: '#4F5D95',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Dart: '#00B4AB',
  }
  return colors[language || ''] || '#6e6e73'
}

export function getToolIcon(tool: string): string {
  const icons: Record<string, string> = {
    Read: '📖',
    Write: '✍️',
    Edit: '✏️',
    Bash: '💻',
    Glob: '🔍',
    Grep: '🔎',
    WebFetch: '🌐',
    WebSearch: '🔍',
    Task: '📋',
    TodoWrite: '✅',
  }
  return icons[tool] || '🔧'
}

export function getToolDisplayName(tool: string): string {
  const names: Record<string, string> = {
    Read: 'Read File',
    Write: 'Write File',
    Edit: 'Edit File',
    Bash: 'Run Command',
    Glob: 'Find Files',
    Grep: 'Search Code',
    WebFetch: 'Fetch URL',
    WebSearch: 'Web Search',
    Task: 'Run Task',
    TodoWrite: 'Update Todos',
  }
  return names[tool] || tool
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}
