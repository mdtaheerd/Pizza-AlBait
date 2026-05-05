import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CandidateForm } from '@/components/candidates/candidate-form'

interface EditCandidatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCandidatePage({ params }: EditCandidatePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Edit Candidate</h1>
        <p className="text-muted-foreground">
          Update candidate information
        </p>
      </div>

      <CandidateForm candidate={candidate} />
    </div>
  )
}
