import { createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
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

  // Fetch open jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, department:departments(id, name), location')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Fetch existing applications to filter out already applied jobs
  const { data: existingApplications } = await supabase
    .from('applications')
    .select('job_id')
    .eq('candidate_id', id)

  const appliedJobIds = existingApplications?.map(a => a.job_id) || []
  const availableJobs = jobs?.filter(job => !appliedJobIds.includes(job.id)) || []

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Add {candidate.name} to a Job</h1>
      <AddCandidateToJobForm 
        candidateId={id} 
        candidateName={candidate.name}
        availableJobs={availableJobs} 
      />
    </div>
  )
}
