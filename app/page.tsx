'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/app-store'

export default function Home() {
  const router = useRouter()
  const { githubToken } = useAppStore()

  useEffect(() => {
    if (githubToken) {
      router.replace('/projects')
    } else {
      router.replace('/login')
    }
  }, [githubToken, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-kibble-background">
      <div className="animate-pulse text-kibble-text-secondary">Loading...</div>
    </div>
  )
}
