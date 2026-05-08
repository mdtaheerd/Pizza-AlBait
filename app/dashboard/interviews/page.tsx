import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'
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
      hiring_manager?: {
        email: string
        full_name: string
      }
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
  const lastWeek = startOfDay(subDays(today, 7))

  // Fetch upcoming interviews (next 7 days)
  const { data: upcomingInterviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(title, hiring_manager:profiles!jobs_created_by_fkey(email, full_name))
      ),
      interviewer:profiles(full_name, email)
    `)
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })

  // Fetch past interviews (last 7 days)
  const { data: pastInterviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(id, full_name, email),
        job:jobs(title, hiring_manager:profiles!jobs_created_by_fkey(email, full_name))
      ),
      interviewer:profiles(full_name, email)
    `)
    .gte('scheduled_at', lastWeek.toISOString())
    .lt('scheduled_at', today.toISOString())
    .order('scheduled_at', { ascending: false })

  return (
    <InterviewsClient 
      upcomingInterviews={(upcomingInterviews || []) as InterviewWithRelations[]} 
      pastInterviews={(pastInterviews || []) as InterviewWithRelations[]} 
    />
  )
}
