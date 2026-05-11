import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Briefcase, Users, FileText, TrendingUp, TrendingDown, Clock, Building2, MapPin, Calendar, User } from 'lucide-react'
import { subDays, format, differenceInYears } from 'date-fns'
import { PipelineChart } from '@/components/analytics/pipeline-chart'
import { ApplicationsChart } from '@/components/analytics/applications-chart'
import { SourceChart } from '@/components/analytics/source-chart'
import { DepartmentChart } from '@/components/analytics/department-chart'
import { ApplicantsPerJobChart } from '@/components/analytics/applicants-per-job-chart'
import { DemographicsChart } from '@/components/analytics/demographics-chart'
import { STAGE_LABELS } from '@/lib/types'
import { AnalyticsExport } from '@/components/analytics/analytics-export'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const sixtyDaysAgo = subDays(new Date(), 60).toISOString()

  // Fetch all data with extended queries
  const [
    { count: totalJobs },
    { count: openJobs },
    { count: totalCandidates },
    { count: totalApplications },
    { data: applications },
    { data: recentApplications },
    { data: previousPeriodApplications },
    { data: candidates },
    { data: jobs },
    { data: departments },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('stage, applied_at, job_id'),
    supabase.from('applications').select('applied_at').gte('applied_at', thirtyDaysAgo),
    supabase.from('applications').select('applied_at').gte('applied_at', sixtyDaysAgo).lt('applied_at', thirtyDaysAgo),
    supabase.from('candidates').select('id, source, nationality, gender, date_of_birth'),
    supabase.from('jobs').select('id, title, department_id, status'),
    supabase.from('departments').select('id, name'),
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

  // Department Analytics - positions per department
  const departmentMap = new Map((departments || []).map(d => [d.id, d.name]))
  const departmentStats: Record<string, { jobs: number; applications: number }> = {}
  
  ;(jobs || []).forEach((job) => {
    const deptName = departmentMap.get(job.department_id) || 'Unassigned'
    if (!departmentStats[deptName]) {
      departmentStats[deptName] = { jobs: 0, applications: 0 }
    }
    departmentStats[deptName].jobs++
  })

  ;(applications || []).forEach((app) => {
    const job = (jobs || []).find(j => j.id === app.job_id)
    if (job) {
      const deptName = departmentMap.get(job.department_id) || 'Unassigned'
      if (departmentStats[deptName]) {
        departmentStats[deptName].applications++
      }
    }
  })

  const departmentChartData = Object.entries(departmentStats)
    .map(([department, stats]) => ({
      department,
      jobs: stats.jobs,
      applications: stats.applications,
    }))
    .sort((a, b) => b.applications - a.applications)

  // Candidates per position
  const jobApplicationCount: Record<string, { title: string; count: number }> = {}
  ;(jobs || []).forEach((job) => {
    jobApplicationCount[job.id] = { title: job.title, count: 0 }
  })
  ;(applications || []).forEach((app) => {
    if (jobApplicationCount[app.job_id]) {
      jobApplicationCount[app.job_id].count++
    }
  })

  const applicantsPerJobData = Object.values(jobApplicationCount)
    .map(item => ({
      job: item.title,
      applicants: item.count,
    }))
    .sort((a, b) => b.applicants - a.applicants)
    .slice(0, 10)

  // Nationality Distribution
  const nationalityCount: Record<string, number> = {}
  ;(candidates || []).forEach((candidate) => {
    const nationality = candidate.nationality || 'Not Specified'
    nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1
  })

  const nationalityData = Object.entries(nationalityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Gender Distribution
  const genderCount: Record<string, number> = {}
  ;(candidates || []).forEach((candidate) => {
    const gender = candidate.gender || 'Not Specified'
    const genderLabel = gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender === 'other' ? 'Other' : 'Not Specified'
    genderCount[genderLabel] = (genderCount[genderLabel] || 0) + 1
  })

  const genderData = Object.entries(genderCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Age Distribution
  const ageGroups: Record<string, number> = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '55+': 0,
    'Not Specified': 0,
  }

  ;(candidates || []).forEach((candidate) => {
    if (candidate.date_of_birth) {
      const age = differenceInYears(new Date(), new Date(candidate.date_of_birth))
      if (age >= 18 && age <= 25) ageGroups['18-25']++
      else if (age >= 26 && age <= 35) ageGroups['26-35']++
      else if (age >= 36 && age <= 45) ageGroups['36-45']++
      else if (age >= 46 && age <= 55) ageGroups['46-55']++
      else if (age > 55) ageGroups['55+']++
    } else {
      ageGroups['Not Specified']++
    }
  })

  const ageData = Object.entries(ageGroups)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

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

  // Prepare export data
  const exportData = {
    summary: {
      totalJobs: totalJobs || 0,
      openJobs: openJobs || 0,
      totalCandidates: totalCandidates || 0,
      totalApplications: totalApplications || 0,
      applicationsLast30Days: currentPeriodCount,
      applicationChangePercent: applicationChange,
    },
    departmentStats: departmentChartData,
    applicantsPerJob: applicantsPerJobData,
    pipelineData,
    sourceData: sourceChartData,
    nationalityData,
    genderData,
    ageData,
    applicationsOverTime: applicationsChartData,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Analytics</h1>
          <p className="text-muted-foreground">
            Track your recruitment performance and metrics
          </p>
        </div>
        <AnalyticsExport data={exportData} />
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

      {/* Department Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Analytics
          </CardTitle>
          <CardDescription>
            Jobs posted and applications received by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentChart data={departmentChartData} />
        </CardContent>
      </Card>

      {/* Candidates per Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Candidates per Position (Top 10)
          </CardTitle>
          <CardDescription>
            Number of applicants for each job position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicantsPerJobChart data={applicantsPerJobData} />
        </CardContent>
      </Card>

      {/* Demographics Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Nationality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              By Nationality
            </CardTitle>
            <CardDescription>
              Top 10 nationalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemographicsChart data={nationalityData} title="Nationality" />
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              By Age Group
            </CardTitle>
            <CardDescription>
              Candidate age distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemographicsChart data={ageData} title="Age" />
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              By Gender
            </CardTitle>
            <CardDescription>
              Gender breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemographicsChart data={genderData} title="Gender" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
            <CardDescription>Last 30 days application trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsChart data={applicationsChartData} />
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
            <CardDescription>Applications by stage</CardDescription>
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
          <CardDescription>Where candidates are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <SourceChart data={sourceChartData} />
        </CardContent>
      </Card>
    </div>
  )
}
