import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { JobsTable } from '@/components/jobs/jobs-table'

export default async function JobsPage() {
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      department:departments(name)
    `)
    .order('created_at', { ascending: false })

  // Log any errors for debugging
  if (error) {
    console.error('[v0] Jobs fetch error:', error)
  }

  // Fetch creator and recruiter names separately to avoid foreign key issues
  const creatorIds = [...new Set((jobs || []).map(j => j.created_by).filter(Boolean))]
  const recruiterIds = [...new Set((jobs || []).map(j => j.recruiter_id).filter(Boolean))]
  const allProfileIds = [...new Set([...creatorIds, ...recruiterIds])]
  
  const { data: profiles } = allProfileIds.length > 0 
    ? await supabase.from('profiles').select('id, full_name').in('id', allProfileIds)
    : { data: [] }
  
  const profileMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p.full_name
    return acc
  }, {} as Record<string, string>)

  // Get application counts for each job
  const { data: applicationCounts } = await supabase
    .from('applications')
    .select('job_id')

  const countsByJob = (applicationCounts || []).reduce((acc, app) => {
    acc[app.job_id] = (acc[app.job_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jobsWithCounts = (jobs || []).map((job) => ({
    ...job,
    creator: job.created_by ? { full_name: profileMap[job.created_by] || null } : null,
    recruiter: job.recruiter_id ? { full_name: profileMap[job.recruiter_id] || null } : null,
    _count: {
      applications: countsByJob[job.id] || 0,
    },
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job listings and postings
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Link>
        </Button>
      </div>

      <JobsTable jobs={jobsWithCounts} />
    </div>
  )
}
