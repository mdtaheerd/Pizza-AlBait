import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { JobsTable } from '@/components/jobs/jobs-table'
import { autoCloseExpiredJobs } from '@/lib/jobs/auto-close'

export default async function JobsPage() {
  const supabase = await createClient()

  // Auto-close any expired jobs before fetching the list
  await autoCloseExpiredJobs()

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      department:departments(name),
      creator:profiles(full_name)
    `)
    .order('created_at', { ascending: false })

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
