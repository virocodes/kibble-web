'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TokenEntry } from '@/components/auth'
import { useAppStore } from '@/stores/app-store'

export default function LoginPage() {
  const router = useRouter()
  const { githubToken } = useAppStore()

  useEffect(() => {
    if (githubToken) {
      router.replace('/projects')
    }
  }, [githubToken, router])

  return <TokenEntry />
}
