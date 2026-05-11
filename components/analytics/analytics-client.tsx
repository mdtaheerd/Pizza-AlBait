'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Briefcase, Users, FileText, TrendingUp, Calendar, Download, 
  FolderOpen, Filter, Building2, User, Globe, UserCircle
} from 'lucide-react'
import { format, parseISO, differenceInYears } from 'date-fns'
import { PipelineChart } from '@/components/analytics/pipeline-chart'
import { DepartmentChart } from '@/components/analytics/department-chart'
import { DemographicsChart } from '@/components/analytics/demographics-chart'
import { NationalityChart } from '@/components/analytics/nationality-chart'
import { ProjectMatrixChart } from '@/components/analytics/project-matrix-chart'
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
  recruiter_id?: string | null
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

type ReportType = 
  | 'all'
  | 'gender'
  | 'nationality'
  | 'department'
  | 'job'
  | 'project'
  | 'status'

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
  const [reportType, setReportType] = useState<ReportType>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedNationality, setSelectedNationality] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Get unique values for filters
  const uniqueProjects = useMemo(() => 
    [...new Set(jobs.map(j => j.project_name).filter(Boolean))] as string[]
  , [jobs])

  const uniqueNationalities = useMemo(() => 
    [...new Set(candidates.map(c => c.nationality).filter(Boolean))] as string[]
  , [candidates])

  const uniqueGenders = useMemo(() => 
    [...new Set(candidates.map(c => c.gender).filter(Boolean))] as string[]
  , [candidates])

  // Filter data based on date range
  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Date filter - compare dates properly
    if (startDate || endDate) {
      filtered = filtered.filter(app => {
        const appDate = parseISO(app.applied_at)
        const start = startDate ? parseISO(startDate) : new Date(0)
        // Set end date to end of day to include all applications on that date
        const end = endDate ? new Date(parseISO(endDate).setHours(23, 59, 59, 999)) : new Date()
        
        // Simple date comparison
        return appDate >= start && appDate <= end
      })
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      const deptJobs = jobs.filter(j => j.department_id === selectedDepartment)
      filtered = filtered.filter(app => deptJobs.some(j => j.id === app.job_id))
    }

    // Job filter
    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.job_id === selectedJob)
    }

    // Project filter
    if (selectedProject !== 'all') {
      const projectJobs = jobs.filter(j => j.project_name === selectedProject)
      filtered = filtered.filter(app => projectJobs.some(j => j.id === app.job_id))
    }

    // Gender filter
    if (selectedGender !== 'all') {
      const genderCandidates = candidates.filter(c => c.gender === selectedGender)
      filtered = filtered.filter(app => genderCandidates.some(c => c.id === app.candidate_id))
    }

    // Nationality filter
    if (selectedNationality !== 'all') {
      const natCandidates = candidates.filter(c => c.nationality === selectedNationality)
      filtered = filtered.filter(app => natCandidates.some(c => c.id === app.candidate_id))
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.stage === selectedStatus)
    }

    return filtered
  }, [applications, startDate, endDate, selectedDepartment, selectedJob, selectedProject, selectedGender, selectedNationality, selectedStatus, jobs, candidates])

  const filteredInterviews = useMemo(() => {
    let filtered = interviews
    if (startDate || endDate) {
      filtered = filtered.filter(interview => {
        const intDate = parseISO(interview.scheduled_at)
        const start = startDate ? parseISO(startDate) : new Date(0)
        const end = endDate ? new Date(parseISO(endDate).setHours(23, 59, 59, 999)) : new Date()
        return intDate >= start && intDate <= end
      })
    }
    return filtered
  }, [interviews, startDate, endDate])

  // Filter jobs by date range (based on created_at)
  const filteredJobs = useMemo(() => {
    let filtered = jobs
    if (startDate || endDate) {
      filtered = filtered.filter(job => {
        const jobDate = parseISO(job.created_at)
        const start = startDate ? parseISO(startDate) : new Date(0)
        const end = endDate ? new Date(parseISO(endDate).setHours(23, 59, 59, 999)) : new Date()
        return jobDate >= start && jobDate <= end
      })
    }
    // Apply department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(j => j.department_id === selectedDepartment)
    }
    // Apply project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(j => j.project_name === selectedProject)
    }
    return filtered
  }, [jobs, startDate, endDate, selectedDepartment, selectedProject])

  // Get relevant candidates for filtered applications
  const filteredCandidateIds = useMemo(() => 
    new Set(filteredApplications.map(a => a.candidate_id))
  , [filteredApplications])

  const filteredCandidates = useMemo(() => 
    candidates.filter(c => filteredCandidateIds.has(c.id))
  , [candidates, filteredCandidateIds])

  // Demographics data
  const genderData = useMemo(() => {
    const genderCounts: Record<string, number> = {}
    filteredCandidates.forEach(c => {
      const gender = c.gender || 'Not Specified'
      genderCounts[gender] = (genderCounts[gender] || 0) + 1
    })
    return Object.entries(genderCounts).map(([name, value]) => ({ name, value }))
  }, [filteredCandidates])

  const nationalityData = useMemo(() => {
    const natCounts: Record<string, number> = {}
    filteredCandidates.forEach(c => {
      const nationality = c.nationality || 'Not Specified'
      natCounts[nationality] = (natCounts[nationality] || 0) + 1
    })
    return Object.entries(natCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 nationalities
  }, [filteredCandidates])

  const ageData = useMemo(() => {
    const ageBrackets: Record<string, number> = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0,
      'Not Specified': 0,
    }
    filteredCandidates.forEach(c => {
      if (!c.date_of_birth) {
        ageBrackets['Not Specified']++
        return
      }
      const age = differenceInYears(new Date(), parseISO(c.date_of_birth))
      if (age >= 18 && age <= 25) ageBrackets['18-25']++
      else if (age >= 26 && age <= 35) ageBrackets['26-35']++
      else if (age >= 36 && age <= 45) ageBrackets['36-45']++
      else if (age >= 46 && age <= 55) ageBrackets['46-55']++
      else if (age > 55) ageBrackets['55+']++
      else ageBrackets['Not Specified']++
    })
    return Object.entries(ageBrackets)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [filteredCandidates])

  // Project-wise hiring matrix (using filtered jobs and applications)
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

    // Use filtered jobs instead of all jobs
    filteredJobs.forEach(job => {
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

    filteredApplications.forEach(app => {
      const job = filteredJobs.find(j => j.id === app.job_id)
      if (!job) return // Skip if job is not in filtered jobs
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
      const projectData = projects.get(projectName)!
      projectData.applicants++
      
      if (app.stage === 'interview_scheduled') projectData.interviews++
      else if (app.stage === 'offered') projectData.offers++
      else if (app.stage === 'rejected') projectData.rejections++
      else if (app.stage === 'offer_declined') projectData.offerDeclines++
      else if (app.stage === 'hired') projectData.hires++
    })

    return Array.from(projects.values()).sort((a, b) => b.applicants - a.applicants)
  }, [filteredJobs, filteredApplications])

  // Job-wise applicant breakdown (using filtered jobs)
  const jobMatrix = useMemo(() => {
    return filteredJobs.map(job => {
      const jobApps = filteredApplications.filter(a => a.job_id === job.id)
      const dept = departments.find(d => d.id === job.department_id)
      return {
        id: job.id,
        title: job.title,
        department: dept?.name || 'Unassigned',
        project: job.project_name || 'Unassigned',
        status: job.status,
        applicants: jobApps.length,
        screening: jobApps.filter(a => a.stage === 'screening').length,
        interviews: jobApps.filter(a => a.stage === 'interview_scheduled').length,
        offered: jobApps.filter(a => a.stage === 'offered').length,
        hired: jobApps.filter(a => a.stage === 'hired').length,
        rejected: jobApps.filter(a => a.stage === 'rejected').length,
      }
    }).filter(j => j.applicants > 0).sort((a, b) => b.applicants - a.applicants)
  }, [filteredJobs, filteredApplications, departments])

  // Pipeline data
  const pipelineData = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
    stage: label,
    count: filteredApplications.filter((app) => app.stage === stage).length,
  }))

  // Department map
  const departmentMap = new Map(departments.map(d => [d.id, d.name]))

  // Department stats (using filtered data)
  const departmentChartData = useMemo(() => {
    const departmentStats: Record<string, { jobs: number; applications: number }> = {}
    
    filteredJobs.forEach((job) => {
      const deptName = departmentMap.get(job.department_id || '') || 'Unassigned'
      if (!departmentStats[deptName]) {
        departmentStats[deptName] = { jobs: 0, applications: 0 }
      }
      departmentStats[deptName].jobs++
    })

    filteredApplications.forEach((app) => {
      const job = filteredJobs.find(j => j.id === app.job_id)
      if (job) {
        const deptName = departmentMap.get(job.department_id || '') || 'Unassigned'
        if (departmentStats[deptName]) {
          departmentStats[deptName].applications++
        }
      }
    })

    return Object.entries(departmentStats)
      .map(([department, stats]) => ({
        department,
        jobs: stats.jobs,
        applications: stats.applications,
      }))
      .sort((a, b) => b.applications - a.applications)
  }, [filteredJobs, filteredApplications, departmentMap])

  // Export to Excel with filters
  const exportToExcel = () => {
    const dateRange = startDate || endDate 
      ? `Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`
      : 'Date Range: All Time'

    const filters = [
      dateRange,
      selectedDepartment !== 'all' ? `Department: ${departments.find(d => d.id === selectedDepartment)?.name}` : '',
      selectedJob !== 'all' ? `Job: ${jobs.find(j => j.id === selectedJob)?.title}` : '',
      selectedProject !== 'all' ? `Project: ${selectedProject}` : '',
      selectedGender !== 'all' ? `Gender: ${selectedGender}` : '',
      selectedNationality !== 'all' ? `Nationality: ${selectedNationality}` : '',
      selectedStatus !== 'all' ? `Status: ${STAGE_LABELS[selectedStatus as ApplicationStage]}` : '',
    ].filter(Boolean).join(' | ')

    const csvContent = [
      ['CPECC Careers Analytics Report'],
      [`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`],
      [filters || 'No filters applied'],
      [],
      ['=== SUMMARY STATISTICS ==='],
      ['Metric', 'Value'],
      ['Total Jobs', initialStats.totalJobs],
      ['Open Jobs', initialStats.openJobs],
      ['Total Candidates', initialStats.totalCandidates],
      ['Filtered Applications', filteredApplications.length],
      ['Filtered Interviews', filteredInterviews.length],
      [],
      ['=== PROJECT-WISE HIRING MATRIX ==='],
      ['Project', 'Jobs', 'Applicants', 'Interviews', 'Offers', 'Rejections', 'Offer Declines', 'Hires'],
      ...projectMatrix.map(p => [
        p.project, p.jobs, p.applicants, p.interviews, p.offers, p.rejections, p.offerDeclines, p.hires,
      ]),
      ['TOTAL', 
        projectMatrix.reduce((s, r) => s + r.jobs, 0),
        projectMatrix.reduce((s, r) => s + r.applicants, 0),
        projectMatrix.reduce((s, r) => s + r.interviews, 0),
        projectMatrix.reduce((s, r) => s + r.offers, 0),
        projectMatrix.reduce((s, r) => s + r.rejections, 0),
        projectMatrix.reduce((s, r) => s + r.offerDeclines, 0),
        projectMatrix.reduce((s, r) => s + r.hires, 0),
      ],
      [],
      ['=== JOB-WISE APPLICANT BREAKDOWN ==='],
      ['Job Title', 'Department', 'Project', 'Status', 'Applicants', 'Screening', 'Interviews', 'Offered', 'Hired', 'Rejected'],
      ...jobMatrix.map(j => [
        j.title, j.department, j.project, j.status, j.applicants, j.screening, j.interviews, j.offered, j.hired, j.rejected,
      ]),
      [],
      ['=== DEPARTMENT ANALYTICS ==='],
      ['Department', 'Jobs', 'Applications'],
      ...departmentChartData.map(d => [d.department, d.jobs, d.applications]),
      [],
      ['=== PIPELINE DISTRIBUTION ==='],
      ['Stage', 'Count'],
      ...pipelineData.map(p => [p.stage, p.count]),
      [],
      ['=== GENDER DISTRIBUTION ==='],
      ['Gender', 'Count'],
      ...genderData.map(g => [g.name, g.value]),
      [],
      ['=== NATIONALITY DISTRIBUTION (Top 10) ==='],
      ['Nationality', 'Count'],
      ...nationalityData.map(n => [n.name, n.value]),
      [],
      ['=== AGE DISTRIBUTION ==='],
      ['Age Group', 'Count'],
      ...ageData.map(a => [a.name, a.value]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cpecc_analytics_report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedDepartment('all')
    setSelectedJob('all')
    setSelectedProject('all')
    setSelectedGender('all')
    setSelectedNationality('all')
    setSelectedStatus('all')
  }

  const hasActiveFilters = startDate || endDate || selectedDepartment !== 'all' || 
    selectedJob !== 'all' || selectedProject !== 'all' || selectedGender !== 'all' || 
    selectedNationality !== 'all' || selectedStatus !== 'all'

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
          Export Report
        </Button>
      </div>

      {/* Comprehensive Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Filter data by date range, department, job, project, demographics, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-sm">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-sm">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Job</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  {uniqueGenders.filter(g => g !== 'Male' && g !== 'Female').map(gender => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nationality Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Nationality</Label>
              <Select value={selectedNationality} onValueChange={setSelectedNationality}>
                <SelectTrigger>
                  <SelectValue placeholder="All Nationalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  {uniqueNationalities.map(nat => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <Label className="text-sm">Application Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STAGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredApplications.length} of {applications.length} applications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - All filtered by date range */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredJobs.filter(j => j.status === 'open').length} currently open
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCandidates.length}</div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? 'In selected period' : 'In your talent pool'}
            </p>
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
              {hasActiveFilters ? 'Matching filters' : 'Total applications'}
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
              {hasActiveFilters ? 'In selected period' : 'Total interviews'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-5 w-5" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DemographicsChart data={genderData} title="Gender" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5" />
              Top Nationalities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NationalityChart data={nationalityData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DemographicsChart data={ageData} title="Age" />
          </CardContent>
        </Card>
      </div>

      {/* Project-wise Hiring Matrix - Horizontal Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project-wise Hiring Matrix
          </CardTitle>
          <CardDescription>
            Recruitment metrics breakdown by project (filtered by selected date range)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectMatrixChart data={projectMatrix} />
          
          {/* Summary Table */}
          <div className="mt-6 overflow-x-auto">
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
                      No data available for selected period
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
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.jobs, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.applicants, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.interviews, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.offers, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.rejections, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.offerDeclines, 0)}</TableCell>
                      <TableCell className="text-center">{projectMatrix.reduce((sum, r) => sum + r.hires, 0)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Job-wise Applicant Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job-wise Applicant Breakdown
          </CardTitle>
          <CardDescription>
            Detailed applicant statistics per job position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-center">Applicants</TableHead>
                  <TableHead className="text-center">Screening</TableHead>
                  <TableHead className="text-center">Interviews</TableHead>
                  <TableHead className="text-center">Offered</TableHead>
                  <TableHead className="text-center">Hired</TableHead>
                  <TableHead className="text-center">Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobMatrix.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobMatrix.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.project}</TableCell>
                      <TableCell className="text-center">{row.applicants}</TableCell>
                      <TableCell className="text-center">{row.screening}</TableCell>
                      <TableCell className="text-center">{row.interviews}</TableCell>
                      <TableCell className="text-center">{row.offered}</TableCell>
                      <TableCell className="text-center">{row.hired}</TableCell>
                      <TableCell className="text-center">{row.rejected}</TableCell>
                    </TableRow>
                  ))
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
