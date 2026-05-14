import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { CandidatesTable } from '@/components/candidates/candidates-table'

export default async function CandidatesPage() {
  const supabase = await createClient()

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })

  // Get applications with job details including project_name and recruiter
  const { data: applications } = await supabase
    .from('applications')
    .select('candidate_id, stage, job_id, job:jobs(id, title, project_name, recruiter_id)')

  // Get recruiter profiles
  const recruiterIds = [...new Set((applications || []).map(a => a.job?.recruiter_id).filter(Boolean))]
  const { data: recruiters } = recruiterIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', recruiterIds)
    : { data: [] }
  
  const recruiterMap = (recruiters || []).reduce((acc, r) => {
    acc[r.id] = r.full_name
    return acc
  }, {} as Record<string, string>)

  const applicationsByCandidate = (applications || []).reduce((acc, app) => {
    if (!acc[app.candidate_id]) {
      acc[app.candidate_id] = { 
        total: 0, 
        active: 0, 
        hired: 0,
        rejected: 0,
        positions: [],
        recruiters: new Set<string>(),
        stages: new Set<string>()
      }
    }
    acc[app.candidate_id].total++
    // Track all stages including hired/rejected
    acc[app.candidate_id].stages.add(app.stage)
    
    if (app.stage === 'hired') {
      acc[app.candidate_id].hired++
    } else if (app.stage === 'rejected') {
      acc[app.candidate_id].rejected++
    } else {
      // Active applications (not hired or rejected)
      acc[app.candidate_id].active++
    }
    const isActive = !['hired', 'rejected'].includes(app.stage)
    if (app.job?.title) {
      const positionInfo = {
        title: app.job.title,
        projectName: app.job.project_name || null,
        recruiterName: app.job.recruiter_id ? recruiterMap[app.job.recruiter_id] : null,
        stage: app.stage
      }
      // Avoid duplicates
      if (!acc[app.candidate_id].positions.find((p: any) => p.title === app.job.title)) {
        acc[app.candidate_id].positions.push(positionInfo)
      }
      // Track recruiters handling this candidate
      if (app.job.recruiter_id && recruiterMap[app.job.recruiter_id] && isActive) {
        acc[app.candidate_id].recruiters.add(recruiterMap[app.job.recruiter_id])
      }
    }
    return acc
  }, {} as Record<string, { 
    total: number
    active: number
    hired: number
    rejected: number
    positions: { title: string; projectName: string | null; recruiterName: string | null; stage: string }[]
    recruiters: Set<string>
    stages: Set<string>
  }>)

  // Get unique values for filter dropdowns
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .order('title')

  // Get all recruiters for filter
  const { data: allRecruiters } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['recruiter', 'admin'])
    .order('full_name')

  const candidatesWithStats = (candidates || []).map((candidate) => {
    const stats = applicationsByCandidate[candidate.id]
    return {
      ...candidate,
      _stats: stats ? {
        total: stats.total,
        active: stats.active,
        hired: stats.hired,
        rejected: stats.rejected,
        positions: stats.positions,
        recruiters: Array.from(stats.recruiters),
        stages: Array.from(stats.stages)
      } : { total: 0, active: 0, hired: 0, rejected: 0, positions: [], recruiters: [], stages: [] },
    }
  })

  // Extract unique nationalities from candidates
  const nationalities = [...new Set((candidates || []).map(c => c.nationality).filter(Boolean))].sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Candidates</h1>
          <p className="text-muted-foreground">
            Manage your talent pool and candidate database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-linkedin/30 text-linkedin hover:bg-linkedin hover:text-white">
            <Link href="/dashboard/linkedin">
              <Linkedin className="mr-2 h-4 w-4" />
              Import from LinkedIn
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/candidates/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      </div>

      <CandidatesTable 
        candidates={candidatesWithStats} 
        nationalities={nationalities}
        jobs={jobs || []}
        recruiters={allRecruiters || []}
      />
    </div>
  )
}
