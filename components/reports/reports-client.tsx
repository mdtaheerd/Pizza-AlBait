'use client'

import { useState, useMemo } from 'react'
import type { Application, Department, Job } from '@/lib/types'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Download, FileSpreadsheet, FileText, Search, Filter, Users } from 'lucide-react'
import { format } from 'date-fns'

interface ReportsClientProps {
  applications: Application[]
  departments: Department[]
  jobs: { id: string; title: string; department_id: string | null }[]
}

export function ReportsClient({ applications, departments, jobs }: ReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          app.candidate?.full_name?.toLowerCase().includes(query) ||
          app.candidate?.email?.toLowerCase().includes(query) ||
          app.job?.title?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Department filter
      if (selectedDepartment !== 'all' && app.job?.department_id !== selectedDepartment) {
        return false
      }

      // Job filter
      if (selectedJob !== 'all' && app.job_id !== selectedJob) {
        return false
      }

      // Stage filter
      if (selectedStage !== 'all' && app.stage !== selectedStage) {
        return false
      }

      // Date range filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        const appDate = new Date(app.applied_at)
        if (appDate < fromDate) return false
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        const appDate = new Date(app.applied_at)
        if (appDate > toDate) return false
      }

      return true
    })
  }, [applications, searchQuery, selectedDepartment, selectedJob, selectedStage, dateFrom, dateTo])

  // Group applications by candidate for the multi-position view
  const groupedByCandidate = useMemo(() => {
    const groups: Record<string, Application[]> = {}
    filteredApplications.forEach(app => {
      const candidateId = app.candidate_id
      if (!groups[candidateId]) {
        groups[candidateId] = []
      }
      groups[candidateId].push(app)
    })
    return groups
  }, [filteredApplications])

  // Export to CSV (Excel compatible)
  const exportToCSV = () => {
    const headers = [
      'Candidate Name',
      'Email',
      'Phone',
      'Country Code',
      'Job Title',
      'Department',
      'Stage',
      'Applied Date',
      'Assigned To',
      'CV URL'
    ]

    const rows: string[][] = []
    
    // Sort by candidate name, then by job title
    const sortedApps = [...filteredApplications].sort((a, b) => {
      const nameCompare = (a.candidate?.full_name || '').localeCompare(b.candidate?.full_name || '')
      if (nameCompare !== 0) return nameCompare
      return (a.job?.title || '').localeCompare(b.job?.title || '')
    })

    sortedApps.forEach(app => {
      rows.push([
        app.candidate?.full_name || '',
        app.candidate?.email || '',
        app.candidate?.phone || '',
        app.candidate?.country_code || '',
        app.job?.title || '',
        app.job?.department?.name || '',
        STAGE_LABELS[app.stage] || app.stage,
        format(new Date(app.applied_at), 'yyyy-MM-dd'),
        app.assignee?.full_name || '',
        app.candidate?.resume_url || ''
      ])
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `applications_report_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF (simplified - opens print dialog)
  const exportToPDF = () => {
    const printContent = document.getElementById('report-table')
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Applications Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; font-size: 18px; margin-bottom: 10px; }
            h2 { color: #666; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; }
            .logo { text-align: center; margin-bottom: 20px; }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <h1>CPECC Recruitment Portal</h1>
            <h2>Applications Report - Generated on ${format(new Date(), 'MMMM d, yyyy')}</h2>
          </div>
          ${printContent.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Get unique candidates count
  const uniqueCandidates = Object.keys(groupedByCandidate).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredApplications.length}</div>
            <p className="text-xs text-muted-foreground">In current filter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCandidates}</div>
            <p className="text-xs text-muted-foreground">Applied to positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Position Applicants</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(groupedByCandidate).filter(apps => apps.length > 1).length}
            </div>
            <p className="text-xs text-muted-foreground">Applied to 2+ jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email, or job..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
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

            <div className="space-y-2">
              <Label>Job Position</Label>
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

            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.entries(STAGE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <Button onClick={exportToCSV} variant="outline">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel (CSV)
        </Button>
        <Button onClick={exportToPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to PDF
        </Button>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="report-table" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedByCandidate).map(([candidateId, candidateApps]) => {
                  // Sort applications by job title
                  const sortedApps = [...candidateApps].sort((a, b) => 
                    (a.job?.title || '').localeCompare(b.job?.title || '')
                  )
                  
                  return sortedApps.map((app, index) => (
                    <TableRow 
                      key={app.id}
                      className={index === 0 && candidateApps.length > 1 ? 'bg-blue-50/50' : ''}
                    >
                      <TableCell className="font-medium">
                        {index === 0 ? (
                          <div className="flex items-center gap-2">
                            {app.candidate?.full_name}
                            {candidateApps.length > 1 && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                                {candidateApps.length} jobs
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground pl-4">↳ same candidate</span>
                        )}
                      </TableCell>
                      <TableCell>{index === 0 ? app.candidate?.email : ''}</TableCell>
                      <TableCell>
                        {index === 0 && app.candidate?.phone ? (
                          <span>{app.candidate?.country_code} {app.candidate?.phone}</span>
                        ) : ''}
                      </TableCell>
                      <TableCell>{app.job?.title}</TableCell>
                      <TableCell>{app.job?.department?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={STAGE_COLORS[app.stage]}>
                          {STAGE_LABELS[app.stage]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(app.applied_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{app.assignee?.full_name || '-'}</TableCell>
                    </TableRow>
                  ))
                })}
                {filteredApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No applications found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
