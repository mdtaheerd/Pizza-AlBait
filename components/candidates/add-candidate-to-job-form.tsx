'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Briefcase, Loader2, User } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  department: { id: string; name: string } | null
  location: string | null
  recruiter_id: string | null
  recruiter: { id: string; full_name: string } | null
}

interface AddCandidateToJobFormProps {
  candidateId: string
  candidateName: string
  availableJobs: Job[]
}

export function AddCandidateToJobForm({ candidateId, candidateName, availableJobs }: AddCandidateToJobFormProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJobId) {
      setError('Please select a job')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, delete any existing rejected application for this candidate+job
      // This allows re-adding a previously rejected candidate to the same job
      await supabase
        .from('applications')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('job_id', selectedJobId)
        .eq('stage', 'rejected')

      // Create new application
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidateId,
          job_id: selectedJobId,
          stage: 'applied',
          applied_at: new Date().toISOString()
        })

      if (appError) throw appError

      // Add to candidate history
      const selectedJob = availableJobs.find(j => j.id === selectedJobId)
      await supabase
        .from('candidate_history')
        .insert({
          candidate_id: candidateId,
          job_id: selectedJobId,
          action: 'stage_change',
          details: `Added to ${selectedJob?.title || 'job'} by recruiter`,
          from_stage: null,
          to_stage: 'applied'
        })

      router.push(`/dashboard/candidates/${candidateId}`)
      router.refresh()
    } catch (err: any) {
      console.error('Error adding candidate to job:', err)
      setError(err.message || 'Failed to add candidate to job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Select a Job Position
        </CardTitle>
        <CardDescription>
          Choose an open position to add {candidateName} as an applicant
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No available jobs found. Either all jobs are closed or this candidate has already been added to all open positions.
            </p>
            <Link href={`/dashboard/candidates/${candidateId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidate
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job">Job Position *</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="job">
                  <SelectValue placeholder="Select a job position" />
                </SelectTrigger>
                <SelectContent>
                  {availableJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{job.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {job.department?.name || 'No department'} • {job.location || 'No location'}
                          {job.recruiter?.full_name && (
                            <span className="ml-1">• Recruiter: {job.recruiter.full_name}</span>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || !selectedJobId}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Job
              </Button>
              <Link href={`/dashboard/candidates/${candidateId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
