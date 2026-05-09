import { createClient } from '@/lib/supabase/server'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { PipelineFilters } from '@/components/pipeline/pipeline-filters'
import { redirect } from 'next/navigation'

interface PipelinePageProps {
  searchParams: Promise<{ job?: string }>
}

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const { job: jobFilter } = await searchParams
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all jobs for the filter dropdown
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .order('title')

  // Build query for applications with locker info and hiring manager
  let applicationsQuery = supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(*),
      job:jobs(id, title, department:departments(name), created_by, hiring_manager:profiles!jobs_created_by_fkey(email, full_name)),
      locker:profiles!applications_locked_by_fkey(id, full_name, email)
    `)
    .order('updated_at', { ascending: false })

  if (jobFilter) {
    applicationsQuery = applicationsQuery.eq('job_id', jobFilter)
  }

  const { data: applications, error: applicationsError } = await applicationsQuery

  console.log('[v0] Pipeline - User:', user?.email)
  console.log('[v0] Pipeline - Profile role:', profile?.role)
  console.log('[v0] Pipeline - Job filter:', jobFilter)
  console.log('[v0] Pipeline - Applications count:', applications?.length)
  console.log('[v0] Pipeline - Applications error:', applicationsError)
  if (applications?.length) {
    console.log('[v0] Pipeline - Sample stages:', applications.slice(0, 3).map(a => a.stage))
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage candidates through your hiring process
          </p>
        </div>
        <PipelineFilters jobs={jobs || []} currentJobId={jobFilter} />
      </div>

      <div className="flex-1 overflow-hidden">
        <PipelineBoard applications={applications || []} currentUser={profile} />
      </div>
    </div>
  )
}
