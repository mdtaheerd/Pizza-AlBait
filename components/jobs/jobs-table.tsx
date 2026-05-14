'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2, Users, ExternalLink, Search, X, Filter } from 'lucide-react'
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import type { Job } from '@/lib/types'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, EMPLOYMENT_TYPE_LABELS } from '@/lib/types'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'

interface Department {
  id: string
  name: string
}

interface Recruiter {
  id: string
  full_name: string
}

interface JobsTableProps {
  jobs: Job[]
  departments: Department[]
  recruiters: Recruiter[]
}

export function JobsTable({ jobs, departments, recruiters }: JobsTableProps) {
  const router = useRouter()
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleDelete = async () => {
    if (!deleteJobId) return
    setIsDeleting(true)

    const supabase = createClient()
    await supabase.from('jobs').delete().eq('id', deleteJobId)
    setDeleteJobId(null)
    setIsDeleting(false)
    router.refresh()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('all')
    setSelectedRecruiter('all')
    setSelectedStatus('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = searchQuery || selectedDepartment !== 'all' || selectedRecruiter !== 'all' || selectedStatus !== 'all' || dateFrom || dateTo

  // Filter jobs based on all criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search by position name/title or project name
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = job.title?.toLowerCase().includes(query)
        const matchesProject = job.project_name?.toLowerCase().includes(query)
        const matchesLocation = job.location?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesProject && !matchesLocation) return false
      }

      // Filter by department
      if (selectedDepartment !== 'all' && job.department_id !== selectedDepartment) {
        return false
      }

      // Filter by recruiter
      if (selectedRecruiter !== 'all' && job.recruiter_id !== selectedRecruiter) {
        return false
      }

      // Filter by status
      if (selectedStatus !== 'all' && job.status !== selectedStatus) {
        return false
      }

      // Filter by date range
      if (dateFrom) {
        const jobDate = new Date(job.created_at)
        const fromDate = startOfDay(parseISO(dateFrom))
        if (isBefore(jobDate, fromDate)) return false
      }

      if (dateTo) {
        const jobDate = new Date(job.created_at)
        const toDate = endOfDay(parseISO(dateTo))
        if (isAfter(jobDate, toDate)) return false
      }

      return true
    })
  }, [jobs, searchQuery, selectedDepartment, selectedRecruiter, selectedStatus, dateFrom, dateTo])

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center text-muted-foreground">
            No jobs created yet. Create your first job listing to start hiring.
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs/new">Create Your First Job</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Filters Section */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Search by Position/Project Name */}
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search position or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Department Filter */}
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

            {/* Recruiter Filter */}
            <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
              <SelectTrigger>
                <SelectValue placeholder="All Recruiters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {recruiters.map(rec => (
                  <SelectItem key={rec.id} value={rec.id}>{rec.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range - From */}
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          {/* Second row for Date To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-3">
            <div className="xl:col-start-6">
              <Input
                type="date"
                placeholder="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Job ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden lg:table-cell">Recruiter</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Applications</TableHead>
              <TableHead className="hidden xl:table-cell">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No jobs match your filters. Try adjusting your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {job.job_number ? `#${job.job_number}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="font-medium hover:underline"
                          >
                            {job.title}
                          </Link>
                          {(job as any).num_positions && (job as any).num_positions > 0 && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {(job as any).num_positions} {(job as any).num_positions === 1 ? 'position' : 'positions'}
                            </Badge>
                          )}
                        </div>
                        {(job as any).num_positions && (job as any).num_positions > 0 && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {(job as any).num_positions} {(job as any).num_positions === 1 ? 'position' : 'positions'}
                          </Badge>
                        )}
                      </div>
                      {job.location && (
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {job.department?.name || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {job.recruiter?.full_name || '-'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {job.employment_type ? EMPLOYMENT_TYPE_LABELS[job.employment_type] : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={JOB_STATUS_COLORS[job.status]}>
                      {JOB_STATUS_LABELS[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {job._count?.applications || 0}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground">
                    {format(new Date(job.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/jobs/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/jobs/${job.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {job.status === 'open' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/careers/${job.id}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteJobId(job.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This will also delete all associated applications and interviews. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
