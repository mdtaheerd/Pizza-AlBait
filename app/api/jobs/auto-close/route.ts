import { NextResponse } from 'next/server'
import { autoCloseExpiredJobs } from '@/lib/jobs/auto-close'

// This endpoint can be called by a cron job to auto-close expired jobs
// Example cron: every day at midnight
export async function POST() {
  try {
    const { closedCount, error } = await autoCloseExpiredJobs()
    
    if (error) {
      return NextResponse.json(
        { success: false, error, closedCount: 0 },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      closedCount,
      message: closedCount > 0 
        ? `Auto-closed ${closedCount} expired job(s)` 
        : 'No expired jobs to close'
    })
  } catch (error) {
    console.error('[Auto-close API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing
export async function GET() {
  return POST()
}
