import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CandidateProfileEditForm } from '@/components/candidate/candidate-profile-edit-form'

export default async function CandidateProfileEditPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/candidate/login')
  }

  // Get the candidate record
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!candidate) {
    redirect('/candidate/register')
  }

  return (
    <div className="min-h-screen bg-background">
      <CandidateProfileEditForm candidate={candidate} />
    </div>
  )
}
