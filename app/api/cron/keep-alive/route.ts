import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This cron job runs daily to keep Supabase from pausing due to inactivity
// Supabase free tier pauses projects after 7 days of no activity

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth for initial setup, but log it
    console.log('[v0] Keep-alive cron triggered (no auth)')
  }

  try {
    const supabase = await createClient()
    
    // Simple query to keep the database active
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('[v0] Keep-alive error:', error.message)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log('[v0] Keep-alive successful - profiles count:', count)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database pinged successfully',
      timestamp: new Date().toISOString(),
      profilesCount: count
    })
  } catch (error) {
    console.error('[v0] Keep-alive exception:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to ping database' 
    }, { status: 500 })
  }
}
