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
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, Linkedin, Globe, Search, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Candidate } from '@/lib/types'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
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
  const [keywordSearch, setKeywordSearch] = useState('')
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false)
  const [keywordResults, setKeywordResults] = useState<CandidateWithStats[] | null>(null)
  const [keywordSearchActive, setKeywordSearchActive] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    await supabase.from('candidates').delete().eq('id', deleteId)
    setDeleteId(null)
    setIsDeleting(false)
    router.refresh()
  }

  const handleKeywordSearch = useCallback(async () => {
    if (!keywordSearch.trim()) {
      setKeywordResults(null)
      setKeywordSearchActive(false)
      return
    }

    setIsSearchingKeywords(true)
    try {
      const response = await fetch(`/api/candidates/search?keywords=${encodeURIComponent(keywordSearch.trim())}`)
      const data = await response.json()
      
      if (response.ok && data.candidates) {
        // Map search results to match the expected format with stats
        const resultsWithStats = data.candidates.map((candidate: CandidateWithStats) => ({
          ...candidate,
          _stats: candidate._stats || { total: 0, active: 0 }
        }))
        setKeywordResults(resultsWithStats)
        setKeywordSearchActive(true)
      } else {
        setKeywordResults([])
        setKeywordSearchActive(true)
      }
    } catch (error) {
      console.error('Keyword search error:', error)
      setKeywordResults([])
      setKeywordSearchActive(true)
    } finally {
      setIsSearchingKeywords(false)
    }
  }, [keywordSearch])

  const clearKeywordSearch = () => {
    setKeywordSearch('')
    setKeywordResults(null)
    setKeywordSearchActive(false)
  }

  // Use keyword results if keyword search is active, otherwise use all candidates
  const baseCandidates = keywordSearchActive && keywordResults !== null ? keywordResults : candidates
  
  const filteredCandidates = baseCandidates.filter((candidate) =>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resumes by keywords..."
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              className="w-full pl-9 pr-20 sm:w-72"
            />
            {keywordSearchActive && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-10 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={clearKeywordSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
              onClick={handleKeywordSearch}
              disabled={isSearchingKeywords || !keywordSearch.trim()}
            >
              {isSearchingKeywords ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {keywordSearchActive && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Found {keywordResults?.length || 0} candidate{keywordResults?.length !== 1 ? 's' : ''} matching &quot;{keywordSearch}&quot; in resumes
          </span>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={clearKeywordSearch}>
            Clear search
          </Button>
        </div>
      )}

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
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-2">
                    {candidate.resume_url && (
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
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
