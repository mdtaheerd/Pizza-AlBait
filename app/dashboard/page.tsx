import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Linkedin,
  Sparkles
} from 'lucide-react'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/types'
import type { Application, Interview } from '@/lib/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { autoCloseExpiredJobs } from '@/lib/jobs/auto-close'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Auto-close any expired jobs when dashboard loads
  await autoCloseExpiredJobs()

  const [
    { count: totalJobs },
    { count: openJobs },
    { count: totalCandidates },
    { count: totalApplications },
    { data: recentApplications },
    { data: upcomingInterviews },
    { data: applicationsByStage },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase
      .from('applications')
      .select('*, candidate:candidates(*), job:jobs(title)')
      .order('applied_at', { ascending: false })
      .limit(5),
    supabase
      .from('interviews')
      .select('*, application:applications(*, candidate:candidates(*), job:jobs(title)), interviewer:profiles(full_name)')
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5),
    supabase.from('applications').select('stage'),
  ])

  const stageCounts = (applicationsByStage || []).reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    {
      title: 'Total Jobs',
      value: totalJobs || 0,
      icon: FileText,
      description: `${openJobs || 0} currently open`,
      href: '/dashboard/jobs',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      title: 'Total Candidates',
      value: totalCandidates || 0,
      icon: Users,
      description: 'In the talent pool',
      href: '/dashboard/candidates',
      gradient: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      title: 'Applications',
      value: totalApplications || 0,
      icon: Briefcase,
      description: 'Across all jobs',
      href: '/dashboard/pipeline',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      title: 'Interviews',
      value: (upcomingInterviews || []).length,
      icon: Calendar,
      description: 'Scheduled upcoming',
      href: '/dashboard/interviews',
      gradient: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-balance">
            <Sparkles className="h-6 w-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your recruitment pipeline
          </p>
        </div>
        <Button asChild className="gap-2 bg-linkedin hover:bg-linkedin/90">
          <Link href="/dashboard/linkedin">
            <Linkedin className="h-4 w-4" />
            Import from LinkedIn
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm ${stat.iconColor}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pipeline Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pipeline Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {Object.entries(STAGE_LABELS).map(([stage, label]) => (
              <Link
                key={stage}
                href={`/dashboard/pipeline?stage=${stage}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/30"
              >
                <Badge variant="secondary" className={`${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]} transition-transform group-hover:scale-105`}>
                  {label}
                </Badge>
                <span className="mt-3 text-3xl font-bold">
                  {stageCounts[stage] || 0}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Applications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/pipeline">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(recentApplications || []).length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No applications yet. Share your job listings to start receiving applications.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/careers">View Career Portal</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(recentApplications as Application[]).map((application) => (
                  <Link
                    key={application.id}
                    href={`/dashboard/candidates/${application.candidate_id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-medium text-primary">
                        {application.candidate?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{application.candidate?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.job?.title}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={STAGE_COLORS[application.stage]}>
                      {STAGE_LABELS[application.stage]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Upcoming Interviews
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/interviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(upcomingInterviews || []).length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No upcoming interviews scheduled.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/dashboard/pipeline">View Pipeline</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(upcomingInterviews as Interview[]).map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/20 text-sm font-medium text-accent">
                        {interview.application?.candidate?.full_name?.charAt(0) || '?'}
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
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(interview.scheduled_at), 'MMM d, h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {interview.interview_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
