import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, addDays } from 'date-fns'
import { format } from 'date-fns'
import { InterviewsClient } from '@/components/interviews/interviews-client'
import type { Interview } from '@/lib/types'

interface InterviewWithRelations extends Interview {
  application?: {
    id: string
    candidate?: {
      id: string
      full_name: string
      email: string
    }
    job?: {
      title: string
    }
  }
  interviewer?: {
    full_name: string
    email: string
  }
}

export default async function InterviewsPage() {
  const supabase = await createClient()
  const today = startOfDay(new Date())
  const nextWeek = endOfDay(addDays(today, 7))

  // Fetch upcoming interviews with candidate email for notifications
  const { data: upcomingInterviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(title)
      ),
      interviewer:profiles(full_name, email)
    `)
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .order('scheduled_at', { ascending: true })

  // Fetch past interviews (last 30 days)
  const { data: pastInterviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(title)
      ),
      interviewer:profiles(full_name, email)
    `)
    .lt('scheduled_at', today.toISOString())
    .order('scheduled_at', { ascending: false })
    .limit(20)

  // Group upcoming interviews by date
  const groupedInterviews = (upcomingInterviews || []).reduce((acc, interview) => {
    const dateKey = format(new Date(interview.scheduled_at), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(interview as InterviewWithRelations)
    return acc
  }, {} as Record<string, InterviewWithRelations[]>)

  return (
    <InterviewsClient 
      groupedInterviews={groupedInterviews} 
      pastInterviews={(pastInterviews || []) as InterviewWithRelations[]} 
    />
  )
}
