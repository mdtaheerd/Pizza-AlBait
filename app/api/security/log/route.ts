import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Store security events in memory (in production, use a database table)
const securityLogs: Array<{
  timestamp: string
  event: string
  ip: string
  userAgent: string
  path: string
  userId?: string
  message?: string
}> = []

const MAX_LOGS = 1000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, ip, userAgent, path, userId, message } = body

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      path: path || 'unknown',
      userId,
      message,
    }

    // Add to log, keep only last MAX_LOGS entries
    securityLogs.unshift(logEntry)
    if (securityLogs.length > MAX_LOGS) {
      securityLogs.pop()
    }

    console.warn(`[SECURITY LOG] ${JSON.stringify(logEntry)}`)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to log security event' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Only allow admins to view security logs
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get optional limit from query params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')

    return NextResponse.json({ 
      logs: securityLogs.slice(0, Math.min(limit, MAX_LOGS)),
      total: securityLogs.length
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
