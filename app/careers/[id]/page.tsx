import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Banknote, ArrowLeft, Building2, User, FolderOpen, CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { EMPLOYMENT_TYPE_LABELS, CURRENCY_OPTIONS, type SalaryCurrency } from '@/lib/types'
import { CareersHeader } from '@/components/careers/careers-header'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated - redirect to registration if not
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/candidate/register?redirect=/careers/${id}`)
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      department:departments(name)
    `)
    .eq('id', id)
    .eq('status', 'open')
    .single()

  if (error || !job) {
    notFound()
  }

  // Fetch recruiter name separately
  let recruiterName: string | null = null
  if (job.recruiter_id) {
    const { data: recruiter } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', job.recruiter_id)
      .single()
    recruiterName = recruiter?.full_name || null
  }

  const formatSalary = (min: number | null, max: number | null, currency: SalaryCurrency = 'USD') => {
    if (!min && !max) return null
    // Use currency code (e.g., "AED") for better browser compatibility
    const currencyInfo = CURRENCY_OPTIONS.find(c => c.value === currency)
    const currencyLabel = currencyInfo?.value || 'USD'
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })
    if (min && max) return `${currencyLabel} ${formatter.format(min)} - ${formatter.format(max)}`
    if (min) return `From ${currencyLabel} ${formatter.format(min)}`
    if (max) return `Up to ${currencyLabel} ${formatter.format(max)}`
    return null
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <CareersHeader />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/careers"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-3xl font-bold text-balance">{job.title}</h1>
              {job.employment_type && (
                <Badge variant="secondary" className="mt-1">
                  {EMPLOYMENT_TYPE_LABELS[job.employment_type as keyof typeof EMPLOYMENT_TYPE_LABELS]}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground">
              {job.department?.name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.department.name}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
              )}
              {job.employment_type && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {EMPLOYMENT_TYPE_LABELS[job.employment_type as keyof typeof EMPLOYMENT_TYPE_LABELS]}
                </span>
              )}
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                <span className="flex items-center gap-1">
                  <Banknote className="h-4 w-4" />
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)} / year
                </span>
              )}
            </div>
            {/* Project, Recruiter and Closing Date Info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t pt-4">
              {job.project_name && (
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-medium">Project:</span> {job.project_name}
                </span>
              )}
              {recruiterName && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Recruiter/HRBP:</span> {recruiterName}
                </span>
              )}
              {job.closing_date && (
                <span className="flex items-center gap-1 text-amber-600">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">Closing Date:</span> {new Date(job.closing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <Button size="lg" asChild>
            <Link href={`/careers/${id}/apply`}>Apply for this position</Link>
          </Button>

          {/* Job Description */}
          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle>About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </CardContent>
            </Card>
          )}

          {/* Job Criteria */}
          {(job.years_of_experience || job.age_criteria || job.required_languages?.length || job.other_certifications || job.other_requirements) && (
            <Card>
              <CardHeader>
                <CardTitle>Job Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.years_of_experience && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Years of Experience</p>
                    <p className="text-foreground">{job.years_of_experience}</p>
                  </div>
                )}
                {job.age_criteria && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age Criteria</p>
                    <p className="text-foreground">{job.age_criteria}</p>
                  </div>
                )}
                {job.required_languages?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Required Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.required_languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.other_certifications && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                    <p className="text-foreground">{job.other_certifications}</p>
                  </div>
                )}
                {job.other_requirements && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Other Requirements</p>
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: job.other_requirements }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Apply CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <h2 className="text-2xl font-semibold">Ready to apply?</h2>
              <p className="mt-2 text-primary-foreground/80">
                {"We'd love to hear from you. Submit your application today."}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-6"
                asChild
              >
                <Link href={`/careers/${id}/apply`}>Apply Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
