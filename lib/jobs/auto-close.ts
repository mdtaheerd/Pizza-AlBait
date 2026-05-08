import { createClient } from '@/lib/supabase/server'

/**
 * Auto-close jobs where the closing_date has passed
 * Updates status to 'closed' and sets auto_closed to true
 * Returns the number of jobs that were auto-closed
 */
export async function autoCloseExpiredJobs(): Promise<{ closedCount: number; error: string | null }> {
  const supabase = await createClient()
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Find all open jobs where closing_date has passed
  const { data: expiredJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('id, title, closing_date')
    .eq('status', 'open')
    .not('closing_date', 'is', null)
    .lt('closing_date', today)
  
  if (fetchError) {
    console.error('[Auto-close] Error fetching expired jobs:', fetchError)
    return { closedCount: 0, error: fetchError.message }
  }
  
  if (!expiredJobs || expiredJobs.length === 0) {
    return { closedCount: 0, error: null }
  }
  
  // Update all expired jobs to closed status
  const jobIds = expiredJobs.map(job => job.id)
  
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ 
      status: 'closed',
      auto_closed: true,
      updated_at: new Date().toISOString()
    })
    .in('id', jobIds)
  
  if (updateError) {
    console.error('[Auto-close] Error updating jobs:', updateError)
    return { closedCount: 0, error: updateError.message }
  }
  
  console.log(`[Auto-close] Closed ${expiredJobs.length} expired job(s):`, expiredJobs.map(j => j.title).join(', '))
  
  return { closedCount: expiredJobs.length, error: null }
}
