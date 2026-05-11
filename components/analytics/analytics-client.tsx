'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Briefcase, Users, FileText, TrendingUp, TrendingDown, Clock, 
  Building2, MapPin, Calendar, User, Download, FolderOpen, Filter
} from 'lucide-react'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { PipelineChart } from '@/components/analytics/pipeline-chart'
import { ApplicationsChart } from '@/components/analytics/applications-chart'
import { SourceChart } from '@/components/analytics/source-chart'
import { DepartmentChart } from '@/components/analytics/department-chart'
import { ApplicantsPerJobChart } from '@/components/analytics/applicants-per-job-chart'
import { DemographicsChart } from '@/components/analytics/demographics-chart'
import { STAGE_LABELS, type ApplicationStage } from '@/lib/types'

interface Application {
  id: string
  stage: ApplicationStage
  applied_at: string
  job_id: string
  candidate_id: string
}

interface Job {
  id: string
  title: string
  department_id: string | null
  status: string
  project_name: string | null
  created_at: string
}

interface Candidate {
  id: string
  source: string | null
  nationality: string | null
  gender: string | null
  date_of_birth: string | null
}

interface Interview {
  id: string
  application_id: string
  status: string
  scheduled_at: string
}

interface AnalyticsClientProps {
  applications: Application[]
  jobs: Job[]
  candidates: Candidate[]
  interviews: Interview[]
  departments: { id: string; name: string }[]
  stats: {
    totalJobs: number
    openJobs: number
    totalCandidates: number
    totalApplications: number
  }
}

export function AnalyticsClient({
  applications,
  jobs,
  candidates,
  interviews,
  departments,
  stats: initialStats,
}: AnalyticsClientProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter data based on date range
  const filteredApplications = useMemo(() => {
    if (!startDate && !endDate) return applications
    return applications.filter(app => {
      const appDate = parseISO(app.applied_at)
      const start = startDate ? parseISO(startDate) : new Date(0)
      const end = endDate ? parseISO(endDate) : new Date()
      return isWithinInterval(appDate, { start, end })
    })
  }, [applications, startDate, endDate])

  const filteredInterviews = useMemo(() => {
    if (!startDate && !endDate) return interviews
    return interviews.filter(interview => {
      const intDate = parseISO(interview.scheduled_at)
      const start = startDate ? parseISO(startDate) : new Date(0)
      const end = endDate ? parseISO(endDate) : new Date()
      return isWithinInterval(intDate, { start, end })
    })
  }, [interviews, startDate, endDate])

  // Project-wise hiring matrix
  const projectMatrix = useMemo(() => {
    const projects = new Map<string, {
      project: string
      jobs: number
      applicants: number
      interviews: number
      offers: number
      rejections: number
      offerDeclines: number
      hires: number
    }>()

    // Group jobs by project
    jobs.forEach(job => {
      const projectName = job.project_name || 'Unassigned'
      if (!projects.has(projectName)) {
        projects.set(projectName, {
          project: projectName,
          jobs: 0,
          applicants: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          offerDeclines: 0,
          hires: 0,
        })
      }
      projects.get(projectName)!.jobs++
    })

    // Count applications per project
    filteredApplications.forEach(app => {
      const job = jobs.find(j => j.id === app.job_id)
      const projectName = job?.project_name || 'Unassigned'
      if (!projects.has(projectName)) {
        projects.set(projectName, {
          project: projectName,
          jobs: 0,
          applicants: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          offerDeclines: 0,
          hires: 0,
        })
      }
      const projectData = projects.get(projectName)!
      projectData.applicants++
      
      if (app.stage === 'interview_scheduled') {
        projectData.interviews++
      } else if (app.stage === 'offered') {
        projectData.offers++
      } else if (app.stage === 'rejected') {
        projectData.rejections++
      } else if (app.stage === 'hired') {
        projectData.hires++
      }
    })

    // Count actual interviews
    filteredInterviews.forEach(interview => {
      const app = applications.find(a => a.id === interview.application_id)
      if (app) {
        const job = jobs.find(j => j.id === app.job_id)
        const projectName = job?.project_name || 'Unassigned'
        if (projects.has(projectName)) {
          // Already counted in applications
        }
      }
    })

    return Array.from(projects.values()).sort((a, b) => b.applicants - a.applicants)
  }, [jobs, filteredApplications, filteredInterviews, applications])

  // Calculate pipeline data
  const pipelineData = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
    stage: label,
    count: filteredApplications.filter((app) => app.stage === stage).length,
  }))

  // Department map
  const departmentMap = new Map(departments.map(d => [d.id, d.name]))

  // Department stats
  const departmentStats: Record<string, { jobs: number; applications: number }> = {}
  jobs.forEach((job) => {
    const deptName = departmentMap.get(job.department_id || '') || 'Unassigned'
    if (!departmentStats[deptName]) {
      departmentStats[deptName] = { jobs: 0, applications: 0 }
    }
    departmentStats[deptName].jobs++
  })

  filteredApplications.forEach((app) => {
    const job = jobs.find(j => j.id === app.job_id)
    if (job) {
      const deptName = departmentMap.get(job.department_id || '') || 'Unassigned'
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

  // Export to Excel
  const exportToExcel = () => {
    const csvContent = [
      // Project Matrix Header
      ['Project-wise Hiring Matrix'],
      ['Project', 'Jobs', 'Applicants', 'Interviews', 'Offers', 'Rejections', 'Offer Declines', 'Hires'],
      ...projectMatrix.map(p => [
        p.project,
        p.jobs,
        p.applicants,
        p.interviews,
        p.offers,
        p.rejections,
        p.offerDeclines,
        p.hires,
      ]),
      [],
      ['Pipeline Distribution'],
      ['Stage', 'Count'],
      ...pipelineData.map(p => [p.stage, p.count]),
      [],
      ['Department Analytics'],
      ['Department', 'Jobs', 'Applications'],
      ...departmentChartData.map(d => [d.department, d.jobs, d.applications]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Analytics</h1>
          <p className="text-muted-foreground">
            Track your recruitment performance and metrics
          </p>
        </div>
        <Button onClick={exportToExcel} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-sm">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-sm">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Clear
            </Button>
            {(startDate || endDate) && (
              <p className="text-sm text-muted-foreground">
                Showing data {startDate ? `from ${format(parseISO(startDate), 'MMM d, yyyy')}` : ''} 
                {endDate ? ` to ${format(parseISO(endDate), 'MMM d, yyyy')}` : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">{initialStats.openJobs} currently open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">In your talent pool</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredApplications.length}</div>
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'In selected period' : 'Total applications'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInterviews.length}</div>
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'In selected period' : 'Total interviews'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project-wise Hiring Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project-wise Hiring Matrix
          </CardTitle>
          <CardDescription>
            Recruitment metrics breakdown by project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-center">Jobs</TableHead>
                  <TableHead className="text-center">Applicants</TableHead>
                  <TableHead className="text-center">Interviews</TableHead>
                  <TableHead className="text-center">Offers</TableHead>
                  <TableHead className="text-center">Rejections</TableHead>
                  <TableHead className="text-center">Offer Declines</TableHead>
                  <TableHead className="text-center">Hires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectMatrix.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {projectMatrix.map((row) => (
                      <TableRow key={row.project}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell className="text-center">{row.jobs}</TableCell>
                        <TableCell className="text-center">{row.applicants}</TableCell>
                        <TableCell className="text-center">{row.interviews}</TableCell>
                        <TableCell className="text-center">{row.offers}</TableCell>
                        <TableCell className="text-center">{row.rejections}</TableCell>
                        <TableCell className="text-center">{row.offerDeclines}</TableCell>
                        <TableCell className="text-center">{row.hires}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.jobs, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.applicants, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.interviews, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.offers, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.rejections, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.offerDeclines, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {projectMatrix.reduce((sum, r) => sum + r.hires, 0)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
  )
}
