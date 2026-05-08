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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2, Users, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react'
import { format } from 'date-fns'
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

interface JobWithCreator extends Job {
  creator?: {
    full_name: string
  }
}

interface JobsTableProps {
  jobs: JobWithCreator[]
}

type SortField = 'title' | 'department' | 'type' | 'status' | 'applications' | 'created' | 'recruiter'
type SortDirection = 'asc' | 'desc'

export function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter()
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'department':
          comparison = (a.department?.name || '').localeCompare(b.department?.name || '')
          break
        case 'type':
          comparison = (a.employment_type || '').localeCompare(b.employment_type || '')
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'applications':
          comparison = (a._count?.applications || 0) - (b._count?.applications || 0)
          break
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'recruiter':
          comparison = (a.creator?.full_name || '').localeCompare(b.creator?.full_name || '')
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [jobs, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3" /> 
      : <ArrowDown className="ml-1 h-3 w-3" />
  }

  const handleDelete = async () => {
    if (!deleteJobId) return
    setIsDeleting(true)

    const supabase = createClient()
    await supabase.from('jobs').delete().eq('id', deleteJobId)
    setDeleteJobId(null)
    setIsDeleting(false)
    router.refresh()
  }

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
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button 
                  onClick={() => handleSort('title')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Title
                  <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button 
                  onClick={() => handleSort('department')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Department
                  <SortIcon field="department" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button 
                  onClick={() => handleSort('type')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Type
                  <SortIcon field="type" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <button 
                  onClick={() => handleSort('applications')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Applications
                  <SortIcon field="applications" />
                </button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <button 
                  onClick={() => handleSort('recruiter')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Posted By
                  <SortIcon field="recruiter" />
                </button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <button 
                  onClick={() => handleSort('created')}
                  className="flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Created
                  <SortIcon field="created" />
                </button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                    {job.location && (
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.department?.name || '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {job.employment_type ? EMPLOYMENT_TYPE_LABELS[job.employment_type] : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className={JOB_STATUS_COLORS[job.status]}>
                      {JOB_STATUS_LABELS[job.status]}
                    </Badge>
                    {job.auto_closed && (
                      <span className="text-xs text-muted-foreground">Auto-closed</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {job._count?.applications || 0}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {job.creator?.full_name || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
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
            ))}
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
