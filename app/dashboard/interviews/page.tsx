import { createClient } from '@/lib/supabase/server'
import { InterviewsClient } from '@/components/interviews/interviews-client'

export default async function InterviewsPage() {
  const supabase = await createClient()

  // Fetch all interviews with relations
  const { data: interviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(title, hiring_manager:profiles(email, full_name))
      ),
      interviewer:profiles(full_name, email)
    `)
    .order('scheduled_at', { ascending: false })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <InterviewsClient 
      interviews={interviews || []} 
      currentUserId={user?.id || ''}
    />
  )
}
