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

  // Get application counts for each candidate
  const { data: applications } = await supabase
    .from('applications')
    .select('candidate_id, stage')

  const applicationsByCandidate = (applications || []).reduce((acc, app) => {
    if (!acc[app.candidate_id]) {
      acc[app.candidate_id] = { total: 0, active: 0 }
    }
    acc[app.candidate_id].total++
    if (!['hired', 'rejected'].includes(app.stage)) {
      acc[app.candidate_id].active++
    }
    return acc
  }, {} as Record<string, { total: number; active: number }>)

  const candidatesWithStats = (candidates || []).map((candidate) => ({
    ...candidate,
    _stats: applicationsByCandidate[candidate.id] || { total: 0, active: 0 },
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
