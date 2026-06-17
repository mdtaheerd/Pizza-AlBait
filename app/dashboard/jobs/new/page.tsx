import { createClient } from '@/lib/supabase/server'
import { JobForm } from '@/components/jobs/job-form'

export default async function NewJobPage() {
  const supabase = await createClient()

  const [{ data: departments }, { data: recruiters }] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('profiles').select('*').eq('approval_status', 'approved').in('role', ['recruiter', 'hiring_manager']).order('full_name'),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Create New Job</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new job listing
        </p>
      </div>

      <JobForm departments={departments || []} recruiters={recruiters || []} />
    </div>
  )
}
