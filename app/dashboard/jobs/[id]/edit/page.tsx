import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JobForm } from '@/components/jobs/job-form'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: job, error }, { data: departments }, { data: recruiters }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', id).single(),
    supabase.from('departments').select('*').order('name'),
    supabase.from('profiles').select('*').eq('approval_status', 'approved').in('role', ['recruiter', 'hiring_manager']).order('full_name'),
  ])

  if (error || !job) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Edit Job</h1>
        <p className="text-muted-foreground">
          Update the job listing details
        </p>
      </div>

      <JobForm job={job} departments={departments || []} recruiters={recruiters || []} />
    </div>
  )
}
