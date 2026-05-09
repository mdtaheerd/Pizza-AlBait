import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, ExternalLink, MapPin, Banknote, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  EMPLOYMENT_TYPE_LABELS,
  STAGE_LABELS,
  STAGE_COLORS,
  CURRENCY_SYMBOLS,
  type SalaryCurrency,
} from '@/lib/types'
import type { Application } from '@/lib/types'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      department:departments(name),
      creator:profiles(full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*, candidate:candidates(*)')
    .eq('job_id', id)
    .order('applied_at', { ascending: false })

  // Calculate stage counts
  const stageCounts = (applications || []).reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatSalary = (min: number | null, max: number | null, currency: SalaryCurrency = 'USD') => {
    if (!min && !max) return null
    const symbol = CURRENCY_SYMBOLS[currency] || '$'
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    })
    if (min && max) return `${symbol}${formatter.format(min)} - ${symbol}${formatter.format(max)}`
    if (min) return `From ${symbol}${formatter.format(min)}`
    if (max) return `Up to ${symbol}${formatter.format(max)}`
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-balance">{job.title}</h1>
            <Badge variant="secondary" className={JOB_STATUS_COLORS[job.status]}>
              {JOB_STATUS_LABELS[job.status]}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.department?.name && (
              <span>{job.department.name}</span>
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
                {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
              </span>
            )}
            {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
              <span className="flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {job.status === 'open' && (
            <Button variant="outline" asChild>
              <Link href={`/careers/${job.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/jobs/${job.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applications ({applications?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {Object.entries(STAGE_LABELS).map(([stage, label]) => (
              <div
                key={stage}
                className="flex flex-col items-center rounded-lg border p-3 text-center"
              >
                <Badge variant="secondary" className={STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}>
                  {label}
                </Badge>
                <span className="mt-2 text-xl font-bold">
                  {stageCounts[stage] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {job.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {job.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {job.requirements ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {job.requirements}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No requirements provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/pipeline?job=${job.id}`}>
              View Pipeline
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(applications || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet. Share the job listing to start receiving applications.
            </p>
          ) : (
            <div className="space-y-3">
              {(applications as Application[]).slice(0, 10).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{application.candidate?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.candidate?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={STAGE_COLORS[application.stage]}>
                      {STAGE_LABELS[application.stage]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(application.applied_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta Information */}
      <div className="text-sm text-muted-foreground">
        Created by {job.creator?.full_name || 'Unknown'} on{' '}
        {format(new Date(job.created_at), 'MMMM d, yyyy')}
        {job.published_at && (
          <> · Published on {format(new Date(job.published_at), 'MMMM d, yyyy')}</>
        )}
      </div>
    </div>
  )
}
