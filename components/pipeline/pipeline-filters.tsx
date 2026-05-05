'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Job {
  id: string
  title: string
}

interface PipelineFiltersProps {
  jobs: Job[]
  currentJobId?: string
}

export function PipelineFilters({ jobs, currentJobId }: PipelineFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleJobChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('job')
    } else {
      params.set('job', value)
    }
    router.push(`/dashboard/pipeline?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/dashboard/pipeline')
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentJobId || 'all'} onValueChange={handleJobChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Filter by job" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Jobs</SelectItem>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              {job.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentJobId && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}
