import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, Phone, MapPin, Users, Monitor } from 'lucide-react'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'
import type { Interview } from '@/lib/types'

const INTERVIEW_TYPE_ICONS = {
  phone: Phone,
  video: Video,
  onsite: MapPin,
  technical: Monitor,
  panel: Users,
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
}

export default async function InterviewsPage() {
  const supabase = await createClient()
  const today = startOfDay(new Date())
  const nextWeek = endOfDay(addDays(today, 7))

  // Fetch upcoming interviews
  const { data: upcomingInterviews } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        *,
        candidate:candidates(*),
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
        *,
        candidate:candidates(*),
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
    acc[dateKey].push(interview)
    return acc
  }, {} as Record<string, Interview[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Interviews</h1>
        <p className="text-muted-foreground">
          Manage scheduled interviews and track feedback
        </p>
      </div>

      {/* Upcoming Interviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Upcoming Interviews</h2>
        {Object.keys(groupedInterviews).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No interviews scheduled for the next 7 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedInterviews).map(([dateKey, interviews]) => (
              <div key={dateKey}>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {format(new Date(dateKey), 'EEEE, MMMM d')}
                </h3>
                <div className="space-y-3">
                  {(interviews as Interview[]).map((interview) => {
                    const TypeIcon = INTERVIEW_TYPE_ICONS[interview.interview_type as keyof typeof INTERVIEW_TYPE_ICONS] || Video
                    return (
                      <Card key={interview.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <TypeIcon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {interview.application?.candidate?.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.application?.job?.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary" className={STATUS_COLORS[interview.status]}>
                                {interview.status.replace('_', ' ')}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {format(new Date(interview.scheduled_at), 'h:mm a')}
                                <span className="mx-1">·</span>
                                {interview.duration_minutes} min
                              </div>
                              {interview.interviewer && (
                                <span className="text-sm text-muted-foreground">
                                  with {interview.interviewer.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                          {(interview.location || interview.meeting_link) && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                              {interview.meeting_link ? (
                                <a
                                  href={interview.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Join Meeting
                                </a>
                              ) : interview.location ? (
                                <span>{interview.location}</span>
                              ) : null}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {(pastInterviews || []).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Recent Past Interviews</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {(pastInterviews as Interview[]).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">
                        {interview.application?.candidate?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interview.application?.job?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={STATUS_COLORS[interview.status]}>
                        {interview.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(interview.scheduled_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
