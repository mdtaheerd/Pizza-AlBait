'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { Job, Department, JobStatus, EmploymentType, SalaryCurrency } from '@/lib/types'
import { EMPLOYMENT_TYPE_LABELS, JOB_STATUS_LABELS, CURRENCY_OPTIONS } from '@/lib/types'

interface JobFormProps {
  job?: Job
  departments: Department[]
}

export function JobForm({ job, departments }: JobFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    department_id: job?.department_id || '',
    location: job?.location || '',
    employment_type: job?.employment_type || '',
    salary_min: job?.salary_min?.toString() || '',
    salary_max: job?.salary_max?.toString() || '',
    salary_currency: job?.salary_currency || 'USD',
    status: job?.status || 'draft',
    closing_date: job?.closing_date || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('You must be logged in to create a job. Please log out and log back in.')
      }

      // Check user profile and approval status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[v0] Profile fetch error:', profileError)
        throw new Error('Could not verify your permissions. Please try logging out and back in.')
      }

      if (profile.role !== 'admin' && profile.approval_status !== 'approved') {
        throw new Error(`Your account is pending approval. Current status: ${profile.approval_status}`)
      }

      console.log('[v0] User profile:', profile)

      const jobData = {
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements || null,
        department_id: formData.department_id || null,
        location: formData.location || null,
        employment_type: formData.employment_type || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency as SalaryCurrency,
        status: formData.status as JobStatus,
        closing_date: formData.closing_date || null,
        created_by: user?.id || null,
        published_at: formData.status === 'open' ? new Date().toISOString() : null,
      }

      if (job) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id)

        if (updateError) {
          console.error('[v0] Update job error:', updateError)
          throw new Error(updateError.message || 'Failed to update job')
        }
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()

        if (insertError) {
          console.error('[v0] Insert job error:', insertError)
          throw new Error(insertError.message || 'Failed to create job')
        }
        console.log('[v0] Job created:', insertData)
      }

      router.push('/dashboard/jobs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) => setFormData({ ...formData, department_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing_date">Closing Date</Label>
              <Input
                id="closing_date"
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Job auto-closes on this date
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary_currency">Salary Currency</Label>
            <Select
              value={formData.salary_currency}
              onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.label} ({currency.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary (Annual)</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                placeholder="e.g. 80000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary (Annual)</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List the required qualifications, skills, and experience..."
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">Error creating job</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
