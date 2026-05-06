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
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, Linkedin, Globe, Lock, LockOpen } from 'lucide-react'
import { format } from 'date-fns'
import type { Candidate } from '@/lib/types'
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
import { Input } from '@/components/ui/input'

interface CandidateWithStats extends Candidate {
  _stats: {
    total: number
    active: number
    rejected: number
    recruiterName: string | null
    isLocked: boolean
    currentStage: string | null
    isAvailableForNewApplication: boolean
  }
}

interface CandidatesTableProps {
  candidates: CandidateWithStats[]
}

const SOURCE_LABELS: Record<string, string> = {
  career_page: 'Career Page',
  linkedin: 'LinkedIn',
  referral: 'Referral',
  agency: 'Agency',
  other: 'Other',
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    await supabase.from('candidates').delete().eq('id', deleteId)
    setDeleteId(null)
    setIsDeleting(false)
    router.refresh()
  }

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center text-muted-foreground">
            No candidates in your database yet. Add your first candidate or share your career page.
          </p>
          <Button asChild>
            <Link href="/dashboard/candidates/new">Add Your First Candidate</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Recruiter</TableHead>
              <TableHead className="hidden lg:table-cell">Links</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/candidates/${candidate.id}`}
                    className="font-medium hover:underline"
                  >
                    {candidate.full_name}
                  </Link>
                  <p className="text-sm text-muted-foreground md:hidden">
                    {candidate.email}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {candidate.email}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {candidate.source ? (
                    <Badge variant="outline">
                      {SOURCE_LABELS[candidate.source] || candidate.source}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{candidate._stats.active}</span>
                    <span className="text-muted-foreground">active</span>
                    {candidate._stats.total > candidate._stats.active && (
                      <span className="text-xs text-muted-foreground">
                        ({candidate._stats.total} total)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {candidate._stats.isLocked ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Lock className="mr-1 h-3 w-3" />
                      {candidate._stats.currentStage === 'screening' && 'Screening'}
                      {candidate._stats.currentStage === 'interview_scheduled' && 'Interview'}
                      {candidate._stats.currentStage === 'interviewed' && 'Interviewed'}
                      {candidate._stats.currentStage === 'offered' && 'Offer'}
                      {!['screening', 'interview_scheduled', 'interviewed', 'offered'].includes(candidate._stats.currentStage || '') && 'Processing'}
                    </Badge>
                  ) : candidate._stats.active > 0 ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <LockOpen className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  ) : candidate._stats.rejected > 0 || candidate._stats.total === 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <LockOpen className="mr-1 h-3 w-3" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Completed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {candidate._stats.recruiterName ? (
                    <span className="text-sm font-medium">{candidate._stats.recruiterName}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-2">
                    {candidate.resume_url && (
                      <a
                        href={`/api/download-cv?candidateId=${candidate.id}`}
                        download
                        className="text-muted-foreground hover:text-foreground"
                        title="Download CV"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    )}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {candidate.portfolio_url && (
                      <a
                        href={candidate.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {format(new Date(candidate.created_at), 'MMM d, yyyy')}
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
                        <Link href={`/dashboard/candidates/${candidate.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(candidate.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this candidate? This will also delete all their applications. This action cannot be undone.
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
