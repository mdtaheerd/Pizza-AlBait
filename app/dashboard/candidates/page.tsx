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

  // Get applications with job details including project_name
  const { data: applications } = await supabase
    .from('applications')
    .select('candidate_id, stage, job_id, job:jobs(id, title, project_name)')

  const applicationsByCandidate = (applications || []).reduce((acc, app) => {
    if (!acc[app.candidate_id]) {
      acc[app.candidate_id] = { total: 0, active: 0, positions: [] }
    }
    acc[app.candidate_id].total++
    if (!['hired', 'rejected'].includes(app.stage)) {
      acc[app.candidate_id].active++
    }
    if (app.job?.title) {
      const positionInfo = {
        title: app.job.title,
        projectName: app.job.project_name || null
      }
      // Avoid duplicates
      if (!acc[app.candidate_id].positions.find((p: any) => p.title === app.job.title)) {
        acc[app.candidate_id].positions.push(positionInfo)
      }
    }
    return acc
  }, {} as Record<string, { total: number; active: number; positions: { title: string; projectName: string | null }[] }>)

  // Get unique values for filter dropdowns
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .order('title')

  const candidatesWithStats = (candidates || []).map((candidate) => ({
    ...candidate,
    _stats: applicationsByCandidate[candidate.id] || { total: 0, active: 0, positions: [] },
  }))

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
      />
    </div>
  )
}
