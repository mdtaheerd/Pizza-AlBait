import { CandidateForm } from '@/components/candidates/candidate-form'

export default function NewCandidatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Add New Candidate</h1>
        <p className="text-muted-foreground">
          Add a new candidate to your talent pool
        </p>
      </div>

      <CandidateForm />
    </div>
  )
}
