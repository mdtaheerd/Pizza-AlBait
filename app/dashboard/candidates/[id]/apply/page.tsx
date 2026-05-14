import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddCandidateToJobForm } from '@/components/candidates/add-candidate-to-job-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplyToJobPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch candidate
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (candidateError || !candidate) {
    notFound()
  }

  // Fetch open jobs with recruiter info
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id, 
      title, 
      department:departments(id, name), 
      location,
      recruiter_id,
      recruiter:profiles!jobs_recruiter_id_fkey(id, full_name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Fetch existing ACTIVE applications (not rejected) to filter out
  // Rejected candidates can be re-added to the same or different jobs
  const { data: existingApplications } = await supabase
    .from('applications')
    .select('job_id, stage')
    .eq('candidate_id', id)
    .neq('stage', 'rejected')

  const appliedJobIds = existingApplications?.map(a => a.job_id) || []
  const availableJobs = jobs?.filter(job => !appliedJobIds.includes(job.id)) || []

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Add {candidate.full_name} to a Job</h1>
      <AddCandidateToJobForm 
        candidateId={id} 
        candidateName={candidate.full_name}
        availableJobs={availableJobs} 
      />
    </div>
  )
}
