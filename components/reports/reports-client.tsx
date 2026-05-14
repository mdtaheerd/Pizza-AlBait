'use client'

import { useState, useMemo } from 'react'
import type { Application, Department, Profile, SalaryCurrency } from '@/lib/types'
import { STAGE_LABELS, STAGE_COLORS, CURRENCY_SYMBOLS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Download, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Users,
  ClipboardList,
  Calendar,
  Gift,
  CheckCircle,
  XCircle,
  Briefcase,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

interface ExtendedApplication {
  id: string
  candidate_id: string
  job_id: string
  stage: string
  rating: number | null
  notes: string | null
  applied_at: string
  updated_at: string
  interview_date?: string | null
  interview_location?: string | null
  recruiter_comments?: string | null
  hiring_manager_comments?: string | null
  offer_sent_at?: string | null
  hired_at?: string | null
  rejection_comments?: string | null
  rejection_reason?: string | null
  candidate?: {
    id: string
    full_name: string
    email: string
    phone?: string | null
    country_code?: string | null
    home_country_code?: string | null
    home_country_phone?: string | null
    alternate_country_code?: string | null
    alternate_phone?: string | null
    nationality?: string | null
    gender?: string | null
    date_of_birth?: string | null
    qualification?: string | null
    current_salary?: number | null
    current_salary_currency?: string | null
    expected_salary?: number | null
    expected_salary_currency?: string | null
    notice_period_days?: number | null
  }
    years_of_experience?: number | null
    current_company?: string | null
    current_job_title?: string | null
    current_location?: string | null
  job?: {
    id: string
    title: string
    salary_min?: number | null
    salary_max?: number | null
    salary_currency?: string
    published_at?: string | null
    closing_date?: string | null
    department?: { id: string; name: string } | null
    creator?: { id: string; full_name: string; email: string } | null
  }
}

interface ExtendedJob {
  id: string
  title: string
  status: string
  created_at: string
  closing_date?: string | null
  department?: { id: string; name: string }[] | { id: string; name: string } | null
  creator?: { id: string; full_name: string; email: string }[] | { id: string; full_name: string; email: string } | null
}

interface ReportsClientProps {
  applications: ExtendedApplication[]
  departments?: Department[]
  jobs: ExtendedJob[]
  currentUser?: Profile
}

type ReportType = 'all' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected' | 'jobs' | 'analytics'

// Helper to get department name from array or object
function getDepartmentName(dept: { id: string; name: string }[] | { id: string; name: string } | null | undefined): string | null {
  if (!dept) return null
  if (Array.isArray(dept)) return dept[0]?.name || null
  return dept.name
}

// Helper to get creator info from array or object
function getCreator(creator: { id: string; full_name: string; email: string }[] | { id: string; full_name: string; email: string } | null | undefined): { full_name: string; email: string } | null {
  if (!creator) return null
  if (Array.isArray(creator)) return creator[0] || null
  return creator
}

export function ReportsClient({ applications, jobs, currentUser }: ReportsClientProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Format salary with currency (for display)
  const formatSalary = (amount: number | null | undefined, currency: SalaryCurrency = 'AED') => {
    if (!amount) return 'N/A'
    const symbol = CURRENCY_SYMBOLS[currency] || 'AED '
    return `${symbol}${amount.toLocaleString()}`
  }

  // Format job salary range with currency (for display)
  const formatJobSalary = (min: number | null, max: number | null, currency: SalaryCurrency = 'USD') => {
    if (!min && !max) return 'N/A'
    const symbol = CURRENCY_SYMBOLS[currency] || '$'
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`
    if (min) return `From ${symbol}${min.toLocaleString()}`
    if (max) return `Up to ${symbol}${max.toLocaleString()}`
    return 'N/A'
  }

  // Format salary for CSV export (uses text currency codes instead of Unicode symbols)
  const formatSalaryForCSV = (amount: number | null | undefined, currency: SalaryCurrency = 'AED') => {
    if (!amount) return 'N/A'
    return `${currency} ${amount.toLocaleString()}`
  }

  // Format job salary range for CSV export (uses text currency codes)
  const formatJobSalaryForCSV = (min: number | null, max: number | null, currency: SalaryCurrency = 'AED') => {
    if (!min && !max) return 'N/A'
    const code = currency || 'AED'
    if (min && max) return `${code} ${min.toLocaleString()} - ${code} ${max.toLocaleString()}`
    if (min) return `From ${code} ${min.toLocaleString()}`
    if (max) return `Up to ${code} ${max.toLocaleString()}`
    return 'N/A'
  }

  // Filter applications based on report type
  const filteredApplications = useMemo(() => {
    let filtered = [...applications]

    // Filter by report type (stage)
    switch (activeReport) {
      case 'screening':
        filtered = filtered.filter(app => ['applied', 'new', 'screening'].includes(app.stage))
        break
      case 'interview':
        filtered = filtered.filter(app => ['shortlisted', 'interview_scheduled', 'interviewed'].includes(app.stage))
        break
      case 'offered':
        filtered = filtered.filter(app => app.stage === 'offered')
        break
      case 'hired':
        filtered = filtered.filter(app => app.stage === 'hired')
        break
      case 'rejected':
        filtered = filtered.filter(app => app.stage === 'rejected')
        break
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app => 
        app.candidate?.full_name?.toLowerCase().includes(query) ||
        app.candidate?.email?.toLowerCase().includes(query) ||
        app.job?.title?.toLowerCase().includes(query) ||
        getDepartmentName(app.job?.department)?.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(app => new Date(app.applied_at) >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(app => new Date(app.applied_at) <= toDate)
    }

    return filtered
  }, [applications, activeReport, searchQuery, dateFrom, dateTo])

  // Stats
  const stats = useMemo(() => ({
    total: applications.length,
    screening: applications.filter(a => ['applied', 'new', 'screening'].includes(a.stage)).length,
    interview: applications.filter(a => ['shortlisted', 'interview_scheduled', 'interviewed'].includes(a.stage)).length,
    offered: applications.filter(a => a.stage === 'offered').length,
    hired: applications.filter(a => a.stage === 'hired').length,
    rejected: applications.filter(a => a.stage === 'rejected').length,
}), [applications])

  // Analytics calculations
  const analytics = useMemo(() => {
    // Positions per department
    const positionsByDept: Record<string, number> = {}
    jobs.forEach(job => {
      const deptName = getDepartmentName(job.department) || 'Unassigned'
      positionsByDept[deptName] = (positionsByDept[deptName] || 0) + 1
    })

    // Gender distribution
    const genderDist: Record<string, number> = {}
    applications.forEach(app => {
      const gender = app.candidate?.gender || 'Not Specified'
      genderDist[gender] = (genderDist[gender] || 0) + 1
    })

    // Nationality distribution
    const nationalityDist: Record<string, number> = {}
    applications.forEach(app => {
      const nationality = app.candidate?.nationality || 'Not Specified'
      nationalityDist[nationality] = (nationalityDist[nationality] || 0) + 1
    })

    // Age distribution (calculate age from date_of_birth)
    const ageDist: Record<string, number> = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
      'Not Specified': 0,
    }
    applications.forEach(app => {
      const dob = app.candidate?.date_of_birth
      if (dob) {
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 25) ageDist['Under 25']++
        else if (age < 35) ageDist['25-34']++
        else if (age < 45) ageDist['35-44']++
        else if (age < 55) ageDist['45-54']++
        else ageDist['55+']++
      } else {
        ageDist['Not Specified']++
      }
    })

    // Qualification distribution
    const qualificationDist: Record<string, number> = {}
    applications.forEach(app => {
      const qualification = app.candidate?.qualification || 'Not Specified'
      qualificationDist[qualification] = (qualificationDist[qualification] || 0) + 1
    })

    // Department-wise open vs closed positions
    const deptOpenClosed: Record<string, { open: number; closed: number }> = {}
    jobs.forEach(job => {
      const deptName = getDepartmentName(job.department) || 'Unassigned'
      if (!deptOpenClosed[deptName]) {
        deptOpenClosed[deptName] = { open: 0, closed: 0 }
      }
      // Consider 'published' and 'draft' as open, 'closed' and 'filled' as closed
      if (job.status === 'closed' || job.status === 'filled') {
        deptOpenClosed[deptName].closed++
      } else {
        deptOpenClosed[deptName].open++
      }
    })

    return {
      positionsByDept,
      genderDist,
      nationalityDist,
      ageDist,
      qualificationDist,
      deptOpenClosed,
    }
  }, [applications, jobs])
  
  // Calculate days to fill position
  const calculateDaysToFill = (openDate: string | null | undefined, hiredAt: string | null | undefined) => {
    if (!openDate) return ''
    const endDate = hiredAt ? new Date(hiredAt) : new Date()
    const start = new Date(openDate)
    const diffTime = Math.abs(endDate.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays.toString()
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Department',
      'Position Applied',
      'Job Open Date',
      'Job Closing Date',
      'No of Days to Fill Position',
      'Candidate Name',
      'Email',
      'Phone',
      'Home Country Phone',
      'Nationality',
      'Years of Experience',
      'Current Company',
      'Current Position',
      'Current Location',
      'Current Salary',
      'Expected Salary',
      'Position Salary Range',
      'Notice Period (Days)',
      'Applied Date',
      'Stage',
      'Interview Date',
      'Rejection Reason',
      'Rejection Comments',
      'Recruiter Name'
    ]

    const rows = filteredApplications.map(app => [
      getDepartmentName(app.job?.department) || '',
      app.job?.title || '',
      app.job?.published_at ? format(new Date(app.job.published_at), 'yyyy-MM-dd') : '',
      app.job?.closing_date ? format(new Date(app.job.closing_date), 'yyyy-MM-dd') : '',
      calculateDaysToFill(app.job?.published_at, app.hired_at),
      app.candidate?.full_name || '',
      app.candidate?.email || '',
      app.candidate?.phone ? `${app.candidate.country_code || ''} ${app.candidate.phone}` : '',
      app.candidate?.home_country_phone ? `${app.candidate.home_country_code || ''} ${app.candidate.home_country_phone}` : '',
      app.candidate?.nationality || '',
      app.candidate?.years_of_experience?.toString() || '',
      app.candidate?.current_company || '',
      app.candidate?.current_job_title || '',
      app.candidate?.current_location || '',
      formatSalaryForCSV(app.candidate?.current_salary, (app.candidate?.current_salary_currency as SalaryCurrency) || 'AED'),
      formatSalaryForCSV(app.candidate?.expected_salary, (app.candidate?.expected_salary_currency as SalaryCurrency) || 'AED'),
      formatJobSalaryForCSV(app.job?.salary_min ?? null, app.job?.salary_max ?? null, (app.job?.salary_currency as SalaryCurrency) || 'AED'),
      app.candidate?.notice_period_days?.toString() || '',
      format(new Date(app.applied_at), 'yyyy-MM-dd'),
      STAGE_LABELS[app.stage as keyof typeof STAGE_LABELS] || app.stage,
      app.interview_date ? format(new Date(app.interview_date), 'yyyy-MM-dd HH:mm') : '',
      app.rejection_reason || '',
      app.rejection_comments || '',
      getCreator(app.job?.creator)?.full_name || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${activeReport}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }
  // Export Jobs Report to CSV
  const exportJobsToCSV = () => {
    const headers = ['Job Title', 'Department', 'Status', 'Recruiter Name', 'Recruiter Email', 'Created Date', 'Closing Date', 'Applications Count']
    
    const rows = jobs.map(job => {
      const appCount = applications.filter(a => a.job_id === job.id).length
      const creator = getCreator(job.creator)
      return [
        job.title,
        getDepartmentName(job.department) || '',
        job.status,
        creator?.full_name || '',
        creator?.email || '',
        format(new Date(job.created_at), 'yyyy-MM-dd'),
        job.closing_date ? format(new Date(job.closing_date), 'yyyy-MM-dd') : '',
        appCount.toString()
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `jobs_report_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const reportTabs = [
    { id: 'all', label: 'All Applications', icon: ClipboardList, count: stats.total },
    { id: 'screening', label: 'Screening', icon: Search, count: stats.screening },
    { id: 'interview', label: 'Interview', icon: Calendar, count: stats.interview },
    { id: 'offered', label: 'Offer', icon: Gift, count: stats.offered },
    { id: 'hired', label: 'Hired', icon: CheckCircle, count: stats.hired },
{ id: 'rejected', label: 'Rejected', icon: XCircle, count: stats.rejected },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, count: jobs.length },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('screening')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Screening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.screening}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('interview')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.interview}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('offered')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.offered}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('hired')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('rejected')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('jobs')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveReport('analytics')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              <BarChart3 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as ReportType)}>
        <TabsList className="grid w-full grid-cols-8">
          {reportTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Reports Content (except Jobs) */}
        {['all', 'screening', 'interview', 'offered', 'hired', 'rejected'].map(reportType => (
          <TabsContent key={reportType} value={reportType} className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="sr-only">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, job..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="w-[150px]">
                    <Label className="sr-only">From Date</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="From"
                    />
                  </div>
                  <div className="w-[150px]">
                    <Label className="sr-only">To Date</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="To"
                    />
                  </div>
                  <Button onClick={exportToCSV} variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base capitalize">{reportType === 'all' ? 'All Applications' : `${reportType} Report`}</CardTitle>
                <CardDescription>{filteredApplications.length} applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="min-w-[150px]">Position Applied</TableHead>
                        <TableHead>Job Open Date</TableHead>
                        <TableHead>Job Closing Date</TableHead>
                        <TableHead>Days to Fill</TableHead>
                        <TableHead className="min-w-[150px]">Candidate Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Home Country Phone</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Current Salary</TableHead>
                        <TableHead>Expected Salary</TableHead>
                        <TableHead>Position Salary Range</TableHead>
                        <TableHead>Notice Period (Days)</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Interview Date</TableHead>
                        {reportType === 'rejected' && <TableHead>Rejection Reason</TableHead>}
                        {reportType === 'rejected' && <TableHead>Rejection Comments</TableHead>}
                        <TableHead>Recruiter Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map(app => (
                        <TableRow key={app.id}>
                          <TableCell>{getDepartmentName(app.job?.department) || '-'}</TableCell>
                          <TableCell className="font-medium">{app.job?.title || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {app.job?.published_at 
                              ? format(new Date(app.job.published_at), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {app.job?.closing_date 
                              ? format(new Date(app.job.closing_date), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {calculateDaysToFill(app.job?.published_at, app.hired_at) || '-'}
                          </TableCell>
                          <TableCell className="font-medium">{app.candidate?.full_name || '-'}</TableCell>
                          <TableCell className="text-sm">{app.candidate?.email || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {app.candidate?.phone ? `${app.candidate.country_code || ''} ${app.candidate.phone}` : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {app.candidate?.home_country_phone 
                              ? `${app.candidate.home_country_code || ''} ${app.candidate.home_country_phone}` 
                              : '-'}
                          </TableCell>
                          <TableCell>{app.candidate?.nationality || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {formatSalary(app.candidate?.current_salary)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatSalary(app.candidate?.expected_salary)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatJobSalary(app.job?.salary_min ?? null, app.job?.salary_max ?? null, app.job?.salary_currency as SalaryCurrency | undefined)}
                          </TableCell>
                          <TableCell>
                            {app.candidate?.notice_period_days !== null && app.candidate?.notice_period_days !== undefined
                              ? app.candidate.notice_period_days
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(app.applied_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={STAGE_COLORS[app.stage as keyof typeof STAGE_COLORS]}>
                              {STAGE_LABELS[app.stage as keyof typeof STAGE_LABELS] || app.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {app.interview_date 
                              ? format(new Date(app.interview_date), 'MMM d, yyyy HH:mm')
                              : '-'}
                          </TableCell>
                          {reportType === 'rejected' && (
                            <TableCell className="text-sm text-red-600 font-medium">
                              {app.rejection_reason || '-'}
                            </TableCell>
                          )}
                          {reportType === 'rejected' && (
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={app.rejection_comments || ''}>
                              {app.rejection_comments || '-'}
                            </TableCell>
                          )}
                          <TableCell className="text-sm">{getCreator(app.job?.creator)?.full_name || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {filteredApplications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={reportType === 'rejected' ? 21 : 19} className="text-center text-muted-foreground py-8">
                            No applications found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Jobs Report */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Jobs Report</CardTitle>
                  <CardDescription>All job positions with recruiter information</CardDescription>
                </div>
                <Button onClick={exportJobsToCSV} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recruiter Name</TableHead>
                      <TableHead>Recruiter Email</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Closing Date</TableHead>
                      <TableHead>Applications</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map(job => {
                      const appCount = applications.filter(a => a.job_id === job.id).length
                      const creator = getCreator(job.creator)
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{getDepartmentName(job.department) || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{creator?.full_name || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {creator?.email || '-'}
                          </TableCell>
                          <TableCell>{format(new Date(job.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {job.closing_date 
                              ? format(new Date(job.closing_date), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{appCount}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No jobs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Positions by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Positions by Department
                </CardTitle>
                <CardDescription>Number of job positions per department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.positionsByDept)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(count / jobs.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  {Object.keys(analytics.positionsByDept).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Department-wise Open vs Closed Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dept-wise Open vs Closed Positions
                </CardTitle>
                <CardDescription>Position status breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.deptOpenClosed)
                    .sort((a, b) => (b[1].open + b[1].closed) - (a[1].open + a[1].closed))
                    .map(([dept, data]) => {
                      const total = data.open + data.closed
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{dept}</span>
                            <span className="text-xs text-muted-foreground">Total: {total}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${(data.open / total) * 100}%` }}
                                title={`Open: ${data.open}`}
                              />
                              <div 
                                className="h-full bg-red-500"
                                style={{ width: `${(data.closed / total) * 100}%` }}
                                title={`Closed: ${data.closed}`}
                              />
                            </div>
                            <div className="flex gap-1 text-xs">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {data.open} Open
                              </Badge>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {data.closed} Closed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  {Object.keys(analytics.deptOpenClosed).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gender Distribution
                </CardTitle>
                <CardDescription>Candidate distribution by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.genderDist)
                    .sort((a, b) => b[1] - a[1])
                    .map(([gender, count]) => (
                      <div key={gender} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{gender}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${(count / applications.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Nationality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Nationality Distribution
                </CardTitle>
                <CardDescription>Top nationalities of candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(analytics.nationalityDist)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 15)
                    .map(([nationality, count]) => (
                      <div key={nationality} className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[150px]">{nationality}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(count / applications.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  {Object.keys(analytics.nationalityDist).length > 15 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{Object.keys(analytics.nationalityDist).length - 15} more nationalities
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Age Distribution
                </CardTitle>
                <CardDescription>Candidate distribution by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.ageDist)
                    .filter(([_, count]) => count > 0)
                    .map(([ageGroup, count]) => (
                      <div key={ageGroup} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{ageGroup}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(count / applications.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Qualification Distribution */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Qualification Distribution
                </CardTitle>
                <CardDescription>Candidate distribution by qualification level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(analytics.qualificationDist)
                    .sort((a, b) => b[1] - a[1])
                    .map(([qualification, count]) => (
                      <div key={qualification} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium truncate max-w-[150px]">{qualification}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(count / applications.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
