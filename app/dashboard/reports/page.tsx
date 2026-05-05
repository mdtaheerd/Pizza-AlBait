import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from '@/components/reports/reports-client'

export default async function ReportsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  // Check if user is admin, recruiter, or hiring_manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approval_status')
    .eq('id', user.id)
    .single()
  
  if (!profile || (profile.role !== 'admin' && profile.approval_status !== 'approved')) {
    redirect('/dashboard')
  }
  
  // Fetch applications with candidate and job info for reports
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(*),
      job:jobs(*, department:departments(*)),
      assignee:profiles!applications_assigned_to_fkey(full_name, email)
    `)
    .order('applied_at', { ascending: false })
  
  // Fetch departments for filtering
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')
  
  // Fetch jobs for filtering
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, department_id')
    .order('title')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports of applications and candidates
        </p>
      </div>
      
      <ReportsClient 
        applications={applications || []} 
        departments={departments || []}
        jobs={jobs || []}
      />
    </div>
  )
}
