'use client'

import { useParams } from 'next/navigation'
import { ChatView } from '@/components/chat'

export default function SessionChatPage() {
  const params = useParams()
  const sessionId = params.id as string

  return (
    <div className="h-screen flex flex-col bg-white">
      <ChatView sessionId={sessionId} />
    </div>
  )
}
