import { createClient, createServiceClient } from '@/lib/supabase/server'
import { InterviewsClient } from '@/components/interviews/interviews-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InterviewsPage() {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Fetch all interviews with relations using service client
  const { data: interviews, error } = await serviceClient
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(id, title, department:departments(name))
      )
    `)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('[v0] Interviews fetch error:', error)
  }

  // Fetch interviewer profiles separately
  const interviewerIds = [...new Set((interviews || []).map(i => i.interviewer_id).filter(Boolean))]
  const { data: interviewers } = interviewerIds.length > 0
    ? await serviceClient.from('profiles').select('id, full_name, email').in('id', interviewerIds)
    : { data: [] }

  const interviewerMap = (interviewers || []).reduce((acc, p) => {
    acc[p.id] = { full_name: p.full_name, email: p.email }
    return acc
  }, {} as Record<string, { full_name: string; email: string }>)

  // Add interviewer data to interviews
  const interviewsWithInterviewer = (interviews || []).map(interview => ({
    ...interview,
    interviewer: interview.interviewer_id ? interviewerMap[interview.interviewer_id] || null : null
  }))

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <InterviewsClient 
      interviews={interviewsWithInterviewer} 
      currentUserId={user?.id || ''}
    />
  )
}
