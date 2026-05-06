import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CandidateDashboardClient } from '@/components/candidate/candidate-dashboard-client'

export default async function CandidateDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/candidate/login')
  }

  // Get candidate profile
  const { data: candidate } = await supabase
    .from('candidates')
    .select(`
      *,
      applications (
        id,
        stage,
        applied_at,
        job:jobs (
          id,
          title,
          location,
          employment_type,
          closing_date,
          status,
          department:departments (
            name
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .single()

  // Get open jobs for applying
  const { data: openJobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      location,
      employment_type,
      closing_date,
      department:departments (
        id,
        name
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <CandidateDashboardClient 
      candidate={candidate} 
      openJobs={openJobs || []} 
      userEmail={user.email || ''} 
    />
  )
}
