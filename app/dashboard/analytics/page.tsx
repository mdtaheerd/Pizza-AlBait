import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from '@/components/analytics/analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch all data
  const [
    { count: totalJobs },
    { count: openJobs },
    { count: totalCandidates },
    { count: totalApplications },
    { data: applications },
    { data: jobs },
    { data: candidates },
    { data: interviews },
    { data: departments },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('id, stage, applied_at, job_id, candidate_id'),
    supabase.from('jobs').select('id, title, department_id, status, project_name, created_at'),
    supabase.from('candidates').select('id, source, nationality, gender, date_of_birth'),
    supabase.from('interviews').select('id, application_id, status, scheduled_at'),
    supabase.from('departments').select('id, name'),
  ])

  return (
    <AnalyticsClient
      applications={applications || []}
      jobs={jobs || []}
      candidates={candidates || []}
      interviews={interviews || []}
      departments={departments || []}
      stats={{
        totalJobs: totalJobs || 0,
        openJobs: openJobs || 0,
        totalCandidates: totalCandidates || 0,
        totalApplications: totalApplications || 0,
      }}
    />
  )
}
