'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { Job, Department, JobStatus, EmploymentType, SalaryCurrency, Profile } from '@/lib/types'
import { EMPLOYMENT_TYPE_LABELS, JOB_STATUS_LABELS, CURRENCY_OPTIONS } from '@/lib/types'

interface JobFormProps {
  job?: Job
  departments: Department[]
  recruiters?: Profile[]
}

export function JobForm({ job, departments, recruiters = [] }: JobFormProps) {
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
    budgeted_salary: job?.budgeted_salary?.toString() || '',
    salary_currency: job?.salary_currency || 'AED',
    status: job?.status || 'draft',
    closing_date: job?.closing_date ? job.closing_date.split('T')[0] : '',
    recruiter_id: job?.recruiter_id || '',
    project_name: job?.project_name || '',
    qualification: job?.qualification || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const jobData = {
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements || null,
        department_id: formData.department_id || null,
        location: formData.location || null,
        employment_type: formData.employment_type || null,
        budgeted_salary: formData.budgeted_salary ? parseInt(formData.budgeted_salary) : null,
        salary_currency: formData.salary_currency as SalaryCurrency,
        status: formData.status as JobStatus,
        closing_date: formData.closing_date || null,
        recruiter_id: formData.recruiter_id || null,
        project_name: formData.project_name || null,
        qualification: formData.qualification || null,
        created_by: user?.id || null,
        published_at: formData.status === 'open' ? new Date().toISOString() : null,
      }

      if (job) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('jobs')
          .insert(jobData)

        if (insertError) throw insertError
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
              placeholder="e.g. Senior Planning Engineer"
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
                placeholder="e.g. AUH"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g. Al Dhafra Gas Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruiter">Recruiter/HRBP</Label>
              <Select
                value={formData.recruiter_id}
                onValueChange={(value) => setFormData({ ...formData, recruiter_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Recruiter/HRBP" />
                </SelectTrigger>
                <SelectContent>
                  {recruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id}>
                      {recruiter.full_name || recruiter.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                onValueChange={(value) => setFormData({ ...formData, status: value as JobStatus })}
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="closing_date">Closing Date</Label>
              <Input
                id="closing_date"
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Bachelor's in Engineering"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary_currency">Salary Currency</Label>
              <Select
                value={formData.salary_currency}
                onValueChange={(value) => setFormData({ ...formData, salary_currency: value as SalaryCurrency })}
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

            <div className="space-y-2">
              <Label htmlFor="budgeted_salary">Budgeted Salary (Annual)</Label>
              <Input
                id="budgeted_salary"
                type="number"
                value={formData.budgeted_salary}
                onChange={(e) => setFormData({ ...formData, budgeted_salary: e.target.value })}
                placeholder="e.g. 100000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <RichTextEditor
              content={formData.requirements}
              onChange={(content) => setFormData({ ...formData, requirements: content })}
              placeholder="List the required qualifications, skills, and experience..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

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
