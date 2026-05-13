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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
    qualification_other: (job as any)?.qualification_other || '',
    years_of_experience: (job as any)?.years_of_experience || '',
    age_criteria: (job as any)?.age_criteria || '',
    required_languages: (job as any)?.required_languages || [] as string[],
    other_certifications: (job as any)?.other_certifications || '',
    other_requirements: (job as any)?.other_requirements || '',
    place_of_work: (job as any)?.place_of_work || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate all mandatory fields
    if (!formData.title || !formData.department_id || !formData.location || 
        !formData.project_name || !formData.recruiter_id || !formData.employment_type ||
        !formData.status || !formData.closing_date || !formData.qualification ||
         !formData.years_of_experience ||
        !formData.age_criteria || formData.required_languages.length === 0 ||
        !formData.description || !formData.requirements || !formData.place_of_work) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

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
        qualification_other: formData.qualification === 'Other' ? formData.qualification_other : null,
        years_of_experience: formData.years_of_experience || null,
        age_criteria: formData.age_criteria || null,
        required_languages: formData.required_languages.length > 0 ? formData.required_languages : null,
        other_certifications: formData.other_certifications || null,
        other_requirements: formData.other_requirements || null,
        place_of_work: formData.place_of_work || null,
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

  const RequiredMark = () => <span className="text-red-500">*</span>

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title <RequiredMark /></Label>
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
              <Label htmlFor="department">Department <RequiredMark /></Label>
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
              <Label htmlFor="location">Job Location <RequiredMark /></Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. AUH"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_work">Place of Work <RequiredMark /></Label>
              <Select
                value={formData.place_of_work}
                onValueChange={(value) => setFormData({ ...formData, place_of_work: value })}
              >
                <SelectTrigger id="place_of_work">
                  <SelectValue placeholder="Select work location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_office">Home Office</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name <RequiredMark /></Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g. Al Dhafra Gas Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruiter">Recruiter/HRBP <RequiredMark /></Label>
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
              <Label htmlFor="employment_type">Employment Type <RequiredMark /></Label>
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
              <Label htmlFor="status">Status <RequiredMark /></Label>
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
              <Label htmlFor="closing_date">Closing Date <RequiredMark /></Label>
              <Input
                id="closing_date"
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
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

          {/* Job Requirements Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Job Requirements</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience <RequiredMark /></Label>
                <Input
                  id="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  placeholder="e.g. 5-10 years"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_criteria">Age Criteria <RequiredMark /></Label>
                <Input
                  id="age_criteria"
                  value={formData.age_criteria}
                  onChange={(e) => setFormData({ ...formData, age_criteria: e.target.value })}
                  placeholder="e.g. 25-45 years"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification <RequiredMark /></Label>
                <Select
                  value={formData.qualification}
                  onValueChange={(value) => setFormData({ ...formData, qualification: value, qualification_other: value !== 'Other' ? '' : formData.qualification_other })}
                >
                  <SelectTrigger id="qualification">
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Secondary School">Secondary School</SelectItem>
                    <SelectItem value="Diploma in Engineering - Civil">Diploma in Engineering - Civil</SelectItem>
                    <SelectItem value="Diploma in Engineering - Mechanical">Diploma in Engineering - Mechanical</SelectItem>
                    <SelectItem value="Diploma in Engineering - Electrical">Diploma in Engineering - Electrical</SelectItem>
                    <SelectItem value="Diploma in Engineering - Electronics & Communication">Diploma in Engineering - Electronics & Communication</SelectItem>
                    <SelectItem value="Diploma in Engineering - Computer Science">Diploma in Engineering - Computer Science</SelectItem>
                    <SelectItem value="Diploma in Engineering - Other">Diploma in Engineering - Other</SelectItem>
                    <SelectItem value="Bachelor Degree - Science">Bachelor Degree - Science</SelectItem>
                    <SelectItem value="Bachelor Degree - Commerce">Bachelor Degree - Commerce</SelectItem>
                    <SelectItem value="Bachelor Degree - Arts">Bachelor Degree - Arts</SelectItem>
                    <SelectItem value="Bachelor Degree - Business Administration">Bachelor Degree - Business Administration</SelectItem>
                    <SelectItem value="Bachelor Degree - Engineering - Civil">Bachelor Degree - Engineering - Civil</SelectItem>
                    <SelectItem value="Bachelor Degree - Engineering - Mechanical">Bachelor Degree - Engineering - Mechanical</SelectItem>
                    <SelectItem value="Bachelor Degree - Engineering - Electrical">Bachelor Degree - Engineering - Electrical</SelectItem>
                    <SelectItem value="Bachelor Degree - Engineering - Electronics & Communication">Bachelor Degree - Engineering - Electronics & Communication</SelectItem>
                    <SelectItem value="Bachelor Degree - Engineering - Computer Science">Bachelor Degree - Engineering - Computer Science</SelectItem>
                    <SelectItem value="Bachelor Degree - Other">Bachelor Degree - Other</SelectItem>
                    <SelectItem value="Master Degree - Science">Master Degree - Science</SelectItem>
                    <SelectItem value="Master Degree - Commerce">Master Degree - Commerce</SelectItem>
                    <SelectItem value="Master Degree - Arts">Master Degree - Arts</SelectItem>
                    <SelectItem value="Master Degree - Business Administration (MBA)">Master Degree - Business Administration (MBA)</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Civil">Master Degree - Engineering - Civil</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Mechanical">Master Degree - Engineering - Mechanical</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Electrical">Master Degree - Engineering - Electrical</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Electronics & Communication">Master Degree - Engineering - Electronics & Communication</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Computer Science">Master Degree - Engineering - Computer Science</SelectItem>
                    <SelectItem value="Master Degree - Engineering - Other">Master Degree - Engineering - Other</SelectItem>
                    <SelectItem value="PhD / Doctorate">PhD / Doctorate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.qualification === 'Other' && (
                  <Input
                    id="qualification_other"
                    value={formData.qualification_other}
                    onChange={(e) => setFormData({ ...formData, qualification_other: e.target.value })}
                    placeholder="Please specify qualification"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Required Languages <RequiredMark /></Label>
              <div className="flex flex-wrap gap-4">
                {['English', 'Chinese', 'Hindi/Urdu'].map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang}`}
                      checked={formData.required_languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ 
                            ...formData, 
                            required_languages: [...formData.required_languages, lang] 
                          })
                        } else {
                          setFormData({ 
                            ...formData, 
                            required_languages: formData.required_languages.filter((l: string) => l !== lang) 
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`lang-${lang}`} className="text-sm font-normal cursor-pointer">
                      {lang}
                    </Label>
                  </div>
                ))}
                </div>
            </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="other_certifications">Other Certifications</Label>
              <Input
                id="other_certifications"
                value={formData.other_certifications}
                onChange={(e) => setFormData({ ...formData, other_certifications: e.target.value })}
                placeholder="e.g. PMP, NEBOSH, etc."
              />
            </div>


          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <RequiredMark /></Label>
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements <RequiredMark /></Label>
            <RichTextEditor
              content={formData.requirements}
              onChange={(content) => setFormData({ ...formData, requirements: content })}
              placeholder="List the required qualifications, skills, and experience..."
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="other_requirements">Other Requirements (Optional)</Label>
            <RichTextEditor
              content={formData.other_requirements}
              onChange={(content) => setFormData({ ...formData, other_requirements: content })}
              placeholder="Additional requirements with formatting options..."
            />
            <p className="text-xs text-muted-foreground">
              Use the toolbar above for bullet points, bold text, and font size options
            </p>
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
