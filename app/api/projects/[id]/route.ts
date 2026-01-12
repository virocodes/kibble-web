import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://claude-agent-alb-1954565240.us-east-1.elb.amazonaws.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const githubToken = request.nextUrl.searchParams.get('github_token')

  if (!githubToken) {
    return NextResponse.json({ error: 'Missing github_token' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/projects/${id}?github_token=${encodeURIComponent(githubToken)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const githubToken = request.nextUrl.searchParams.get('github_token')

  if (!githubToken) {
    return NextResponse.json({ error: 'Missing github_token' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const response = await fetch(
      `${API_BASE_URL}/projects/${id}?github_token=${encodeURIComponent(githubToken)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const githubToken = request.nextUrl.searchParams.get('github_token')

  if (!githubToken) {
    return NextResponse.json({ error: 'Missing github_token' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/projects/${id}?github_token=${encodeURIComponent(githubToken)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
