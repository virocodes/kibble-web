import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://claude-agent-alb-1954565240.us-east-1.elb.amazonaws.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const githubToken = request.nextUrl.searchParams.get('github_token')
  const since = request.nextUrl.searchParams.get('since')

  if (!githubToken) {
    return NextResponse.json({ error: 'Missing github_token' }, { status: 400 })
  }

  try {
    let url = `${API_BASE_URL}/sessions/${id}/messages?github_token=${encodeURIComponent(githubToken)}`
    if (since) {
      url += `&since=${encodeURIComponent(since)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
