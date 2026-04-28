import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, FileText, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { subDays, format, startOfDay } from 'date-fns'
import { PipelineChart } from '@/components/analytics/pipeline-chart'
import { ApplicationsChart } from '@/components/analytics/applications-chart'
import { SourceChart } from '@/components/analytics/source-chart'
import { STAGE_LABELS } from '@/lib/types'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const sixtyDaysAgo = subDays(new Date(), 60).toISOString()

  // Fetch all data
  const [
    { count: totalJobs },
    { count: openJobs },
    { count: totalCandidates },
    { count: totalApplications },
    { data: applications },
    { data: recentApplications },
    { data: previousPeriodApplications },
    { data: candidates },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('stage, applied_at'),
    supabase.from('applications').select('applied_at').gte('applied_at', thirtyDaysAgo),
    supabase.from('applications').select('applied_at').gte('applied_at', sixtyDaysAgo).lt('applied_at', thirtyDaysAgo),
    supabase.from('candidates').select('source'),
  ])

  // Calculate pipeline data
  const pipelineData = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
    stage: label,
    count: (applications || []).filter((app) => app.stage === stage).length,
  }))

  // Calculate applications over time (last 30 days)
  const applicationsOverTime: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'MMM d')
    applicationsOverTime[date] = 0
  }
  
  (recentApplications || []).forEach((app) => {
    const date = format(new Date(app.applied_at), 'MMM d')
    if (applicationsOverTime[date] !== undefined) {
      applicationsOverTime[date]++
    }
  })

  const applicationsChartData = Object.entries(applicationsOverTime).map(([date, count]) => ({
    date,
    applications: count,
  }))

  // Calculate source distribution
  const sourceCount: Record<string, number> = {}
  ;(candidates || []).forEach((candidate) => {
    const source = candidate.source || 'unknown'
    sourceCount[source] = (sourceCount[source] || 0) + 1
  })

  const sourceLabels: Record<string, string> = {
    career_page: 'Career Page',
    linkedin: 'LinkedIn',
    referral: 'Referral',
    agency: 'Agency',
    other: 'Other',
    unknown: 'Unknown',
  }

  const sourceChartData = Object.entries(sourceCount).map(([source, count]) => ({
    source: sourceLabels[source] || source,
    count,
  }))

  // Calculate change percentages
  const currentPeriodCount = (recentApplications || []).length
  const previousPeriodCount = (previousPeriodApplications || []).length
  const applicationChange = previousPeriodCount > 0 
    ? Math.round(((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100)
    : currentPeriodCount > 0 ? 100 : 0

  // Calculate average time to hire (simplified - just using hired applications)
  const hiredApplications = (applications || []).filter((app) => app.stage === 'hired')
  const avgTimeToHire = hiredApplications.length > 0 ? 14 : 0 // Placeholder - would need more data

  const stats = [
    {
      title: 'Total Jobs',
      value: totalJobs || 0,
      description: `${openJobs || 0} currently open`,
      icon: FileText,
    },
    {
      title: 'Total Candidates',
      value: totalCandidates || 0,
      description: 'In your talent pool',
      icon: Users,
    },
    {
      title: 'Applications (30d)',
      value: currentPeriodCount,
      description: applicationChange >= 0 
        ? `+${applicationChange}% from last period`
        : `${applicationChange}% from last period`,
      icon: applicationChange >= 0 ? TrendingUp : TrendingDown,
      trend: applicationChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Avg. Time to Hire',
      value: avgTimeToHire > 0 ? `${avgTimeToHire}d` : 'N/A',
      description: 'From application to offer',
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Analytics</h1>
        <p className="text-muted-foreground">
          Track your recruitment performance and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsChart data={applicationsChartData} />
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineChart data={pipelineData} />
          </CardContent>
        </Card>
      </div>

      {/* Source Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <SourceChart data={sourceChartData} />
        </CardContent>
      </Card>
    </div>
  )
}
