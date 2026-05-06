'use client'

import { useState, useMemo } from 'react'
import type { Application, Department, Profile } from '@/lib/types'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/types'
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
  Briefcase
} from 'lucide-react'
import { format } from 'date-fns'

interface ExtendedApplication extends Application {
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
    current_salary?: number | null
    current_salary_currency?: string | null
    expected_salary?: number | null
    expected_salary_currency?: string | null
    notice_period_days?: number | null
  }
  job?: {
    id: string
    title: string
    salary_min?: number | null
    salary_max?: number | null
    salary_currency?: string
    department?: { id: string; name: string } | null
    creator?: { id: string; full_name: string; email: string } | null
  }
}

interface ExtendedJob {
  id: string
  title: string
  status: string
  created_at: string
  department?: { id: string; name: string } | null
  creator?: { id: string; full_name: string; email: string } | null
}

interface ReportsClientProps {
  applications: ExtendedApplication[]
  departments?: Department[]
  jobs: ExtendedJob[]
  currentUser?: Profile
}

type ReportType = 'all' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected' | 'jobs'

export function ReportsClient({ applications, jobs, currentUser }: ReportsClientProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Format salary with currency - always use AED
  const formatSalary = (amount: number | null | undefined) => {
    if (!amount) return 'N/A'
    return `AED ${amount.toLocaleString()}`
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
        app.job?.department?.name?.toLowerCase().includes(query)
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

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Candidate Name',
      'Email',
      'Phone',
      'Home Country Phone',
      'Alternate Phone',
      'Nationality',
      'Position Applied',
      'Department',
      'Current Salary',
      'Expected Salary',
      'Position Salary Range',
      'Notice Period (Days)',
      'Stage',
      'Applied Date',
      'Recruiter Name',
      'Interview Date',
      'Rejection Reason'
    ]

    const rows = filteredApplications.map(app => [
      app.candidate?.full_name || '',
      app.candidate?.email || '',
      app.candidate?.phone ? `${app.candidate.country_code || ''} ${app.candidate.phone}` : '',
      app.candidate?.home_country_phone ? `${app.candidate.home_country_code || ''} ${app.candidate.home_country_phone}` : '',
      app.candidate?.alternate_phone ? `${app.candidate.alternate_country_code || ''} ${app.candidate.alternate_phone}` : '',
      app.candidate?.nationality || '',
      app.job?.title || '',
      app.job?.department?.name || '',
      formatSalary(app.candidate?.current_salary),
      formatSalary(app.candidate?.expected_salary),
      app.job?.salary_min && app.job?.salary_max 
        ? `${formatSalary(app.job.salary_min)} - ${formatSalary(app.job.salary_max)}`
        : 'N/A',
      app.candidate?.notice_period_days?.toString() || '',
      STAGE_LABELS[app.stage as keyof typeof STAGE_LABELS] || app.stage,
      format(new Date(app.applied_at), 'yyyy-MM-dd'),
      app.job?.creator?.full_name || '',
      app.interview_date ? format(new Date(app.interview_date), 'yyyy-MM-dd HH:mm') : '',
      app.rejection_comments || ''
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
    const headers = ['Job Title', 'Department', 'Status', 'Recruiter Name', 'Recruiter Email', 'Created Date', 'Applications Count']
    
    const rows = jobs.map(job => {
      const appCount = applications.filter(a => a.job_id === job.id).length
      return [
        job.title,
        job.department?.name || '',
        job.status,
        job.creator?.full_name || '',
        job.creator?.email || '',
        format(new Date(job.created_at), 'yyyy-MM-dd'),
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
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
      </div>

      {/* Tabs */}
      <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as ReportType)}>
        <TabsList className="grid w-full grid-cols-7">
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
                        <TableHead className="min-w-[150px]">Candidate</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead className="min-w-[150px]">Position Applied</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Current Salary</TableHead>
                        <TableHead>Expected Salary</TableHead>
                        <TableHead>Position Salary</TableHead>
                        <TableHead>Notice Period</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Alternate Contact</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Applied Date</TableHead>
                        {reportType === 'interview' && <TableHead>Interview Date</TableHead>}
                        {reportType === 'rejected' && <TableHead>Reason</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map(app => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.candidate?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{app.candidate?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{app.candidate?.nationality || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.job?.title}</p>
                              <p className="text-xs text-muted-foreground">
                                By: {app.job?.creator?.full_name || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{app.job?.department?.name || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {formatSalary(app.candidate?.current_salary)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatSalary(app.candidate?.expected_salary)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {app.job?.salary_min && app.job?.salary_max ? (
                              <span>
                                {formatSalary(app.job.salary_min)} - {formatSalary(app.job.salary_max)}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {app.candidate?.notice_period_days !== null && app.candidate?.notice_period_days !== undefined
                              ? `${app.candidate.notice_period_days} days`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {app.candidate?.phone ? (
                              <span>{app.candidate.country_code} {app.candidate.phone}</span>
                            ) : '-'}
                            {app.candidate?.home_country_phone && (
                              <div className="text-muted-foreground">
                                Home: {app.candidate.home_country_code} {app.candidate.home_country_phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {app.candidate?.alternate_phone ? (
                              <span>{app.candidate.alternate_country_code} {app.candidate.alternate_phone}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={STAGE_COLORS[app.stage as keyof typeof STAGE_COLORS]}>
                              {STAGE_LABELS[app.stage as keyof typeof STAGE_LABELS] || app.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(app.applied_at), 'MMM d, yyyy')}
                          </TableCell>
                          {reportType === 'interview' && (
                            <TableCell className="text-sm">
                              {app.interview_date 
                                ? format(new Date(app.interview_date), 'MMM d, yyyy HH:mm')
                                : '-'}
                            </TableCell>
                          )}
                          {reportType === 'rejected' && (
                            <TableCell className="text-sm text-red-600">
                              {app.rejection_comments || '-'}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {filteredApplications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
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
                      <TableHead>Applications</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map(job => {
                      const appCount = applications.filter(a => a.job_id === job.id).length
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.department?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.creator?.full_name || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {job.creator?.email || '-'}
                          </TableCell>
                          <TableCell>{format(new Date(job.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{appCount}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
      </Tabs>
    </div>
  )
}
