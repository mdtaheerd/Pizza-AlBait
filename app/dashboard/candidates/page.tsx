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

  // Get application counts and recruiter info for each candidate
  const { data: applications } = await supabase
    .from('applications')
    .select('candidate_id, stage, assigned_to, assignee:profiles!applications_assigned_to_fkey(id, full_name)')

  const applicationsByCandidate = (applications || []).reduce((acc, app) => {
    if (!acc[app.candidate_id]) {
      acc[app.candidate_id] = { total: 0, active: 0, recruiterName: null as string | null }
    }
    acc[app.candidate_id].total++
    if (!['hired', 'rejected'].includes(app.stage)) {
      acc[app.candidate_id].active++
    }
    // Get recruiter name from the most recent assigned application
    if (app.assignee && !acc[app.candidate_id].recruiterName) {
      acc[app.candidate_id].recruiterName = (app.assignee as { full_name: string }).full_name
    }
    return acc
  }, {} as Record<string, { total: number; active: number; recruiterName: string | null }>)

  const candidatesWithStats = (candidates || []).map((candidate) => ({
    ...candidate,
    _stats: applicationsByCandidate[candidate.id] || { total: 0, active: 0, recruiterName: null },
  }))

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

      <CandidatesTable candidates={candidatesWithStats} />
    </div>
  )
}
