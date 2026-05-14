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
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, Linkedin, Globe, Search, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import type { Candidate } from '@/lib/types'
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

interface CandidateWithStats extends Candidate {
  _stats: {
    total: number
    active: number
    positions: string[]
  }
}

interface Job {
  id: string
  title: string
}

interface CandidatesTableProps {
  candidates: CandidateWithStats[]
  nationalities: string[]
  qualifications: string[]
  jobs: Job[]
}

const SOURCE_LABELS: Record<string, string> = {
  career_page: 'Career Page',
  linkedin: 'LinkedIn',
  referral: 'Referral',
  agency: 'Agency',
  other: 'Other',
}

const EXPERIENCE_RANGES = [
  { value: '0-2', label: '0-2 years', min: 0, max: 2 },
  { value: '3-5', label: '3-5 years', min: 3, max: 5 },
  { value: '6-10', label: '6-10 years', min: 6, max: 10 },
  { value: '11-15', label: '11-15 years', min: 11, max: 15 },
  { value: '15+', label: '15+ years', min: 15, max: 100 },
]

export function CandidatesTable({ candidates, nationalities, qualifications, jobs }: CandidatesTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNationality, setSelectedNationality] = useState<string>('all')
  const [selectedQualification, setSelectedQualification] = useState<string>('all')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    await supabase.from('candidates').delete().eq('id', deleteId)
    setDeleteId(null)
    setIsDeleting(false)
    router.refresh()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedNationality('all')
    setSelectedQualification('all')
    setSelectedPosition('all')
    setSelectedExperience('all')
  }

  const hasActiveFilters = searchQuery || selectedNationality !== 'all' || selectedQualification !== 'all' || selectedPosition !== 'all' || selectedExperience !== 'all'

  // Filter candidates based on all criteria
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search by name or email
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = candidate.full_name?.toLowerCase().includes(query)
        const matchesEmail = candidate.email?.toLowerCase().includes(query)
        const matchesPhone = candidate.phone?.toLowerCase().includes(query)
        if (!matchesName && !matchesEmail && !matchesPhone) return false
      }

      // Filter by nationality
      if (selectedNationality !== 'all' && candidate.nationality !== selectedNationality) {
        return false
      }

      // Filter by qualification
      if (selectedQualification !== 'all' && candidate.qualification !== selectedQualification) {
        return false
      }

      // Filter by position (job title the candidate has applied to)
      if (selectedPosition !== 'all') {
        const appliedPositions = candidate._stats?.positions || []
        const selectedJob = jobs.find(j => j.id === selectedPosition)
        if (!selectedJob || !appliedPositions.includes(selectedJob.title)) {
          return false
        }
      }

      // Filter by experience range (using notice_period_days as a proxy or could be calculated from date_of_birth)
      // For now, we'll skip this if no experience data is available
      // This would need a dedicated experience_years field in the candidates table

      return true
    })
  }, [candidates, searchQuery, selectedNationality, selectedQualification, selectedPosition, jobs])

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Search by Name */}
            <div className="relative xl:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Position Filter */}
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nationality Filter */}
            <Select value={selectedNationality} onValueChange={setSelectedNationality}>
              <SelectTrigger>
                <SelectValue placeholder="All Nationalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nationalities</SelectItem>
                {nationalities.map(nat => (
                  <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Qualification Filter */}
            <Select value={selectedQualification} onValueChange={setSelectedQualification}>
              <SelectTrigger>
                <SelectValue placeholder="All Qualifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualifications</SelectItem>
                {qualifications.map(qual => (
                  <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Experience Range Filter */}
            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                {EXPERIENCE_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="hidden lg:table-cell">Links</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No candidates match your filters. Try adjusting your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
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
                  <TableCell className="hidden md:table-cell">
                    <a href={`mailto:${candidate.email}`} className="hover:underline">
                      {candidate.email}
                    </a>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">
                      {SOURCE_LABELS[candidate.source] || candidate.source || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{candidate._stats.active} active</span>
                      {candidate._stats.total > candidate._stats.active && (
                        <span className="text-xs text-muted-foreground">
                          ({candidate._stats.total} total)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {candidate.resume_url && (
                        <a
                          href={candidate.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          title="Resume"
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
                          title="LinkedIn"
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
                          title="Portfolio"
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this candidate? This will also delete all their applications and interview records. This action cannot be undone.
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
