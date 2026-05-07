import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from '@/components/reports/reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  // Check if user is admin, recruiter, or hiring_manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, department:departments(*)')
    .eq('id', user.id)
    .single()
  
  if (!profile || (profile.role !== 'admin' && profile.approval_status !== 'approved')) {
    redirect('/dashboard')
  }
  
  // Fetch applications with comprehensive candidate and job info
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(
        id,
        full_name,
        email,
        phone,
        country_code,
        home_country_code,
        home_country_phone,
        alternate_country_code,
        alternate_phone,
        nationality,
        current_salary,
        current_salary_currency,
        expected_salary,
        expected_salary_currency,
        notice_period_days
      ),
      job:jobs(
        id,
        title,
        salary_min,
        salary_max,
        salary_currency,
        published_at,
        closing_date,
        department:departments(id, name),
        creator:profiles(id, full_name, email)
      )
    `)
    .order('applied_at', { ascending: false })
  
  // Fetch jobs with creator/recruiter info
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      status,
      created_at,
      closing_date,
      department:departments(id, name),
      creator:profiles(id, full_name, email)
    `)
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View screening, interview, offer, hired, and rejected reports with comprehensive candidate details
        </p>
      </div>
      
      <ReportsClient 
        applications={applications || []} 
        jobs={jobs || []}
        currentUser={profile}
      />
    </div>
  )
}
