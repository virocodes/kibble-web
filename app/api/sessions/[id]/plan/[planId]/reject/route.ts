import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://claude-agent-alb-1954565240.us-east-1.elb.amazonaws.com'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  const { id, planId } = await params
  const githubToken = request.nextUrl.searchParams.get('github_token')

  try {
    const body = await request.json()
    let url = `${API_BASE_URL}/sessions/${id}/plan/${planId}/reject`
    if (githubToken) {
      url += `?github_token=${encodeURIComponent(githubToken)}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to reject plan' }, { status: 500 })
  }
}
