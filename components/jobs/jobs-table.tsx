'use client'

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
import { MoreHorizontal, Eye, Pencil, Trash2, Users, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import type { Job } from '@/lib/types'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, EMPLOYMENT_TYPE_LABELS } from '@/lib/types'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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

interface JobsTableProps {
  jobs: Job[]
}

export function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter()
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {job.job_number ? `#${job.job_number}` : '-'}
                </TableCell>
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
