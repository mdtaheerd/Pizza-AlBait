import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Mail, Phone, Linkedin, Globe, FileText, Plus, AlertTriangle, Lock, Download, Calendar, Briefcase, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { STAGE_LABELS, STAGE_COLORS, LOCK_STATUS_LABELS, LOCK_STATUS_COLORS, CURRENCY_SYMBOLS, SalaryCurrency } from '@/lib/types'
import type { Application, CandidateHistory } from '@/lib/types'
import { CandidateHistoryTimeline } from '@/components/candidates/candidate-history'
import { CandidateApplicationActions } from '@/components/candidates/candidate-application-actions'

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>
}

const SOURCE_LABELS: Record<string, string> = {
  career_page: 'Career Page',
  linkedin: 'LinkedIn',
  referral: 'Referral',
  agency: 'Agency',
  other: 'Other',
}

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user and profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentProfile) redirect('/auth/login')

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*, global_locker:profiles!candidates_global_locked_by_fkey(full_name, email), locked_job:jobs!candidates_global_lock_job_id_fkey(title)')
    .eq('id', id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(
        id, 
        title, 
        salary_min,
        salary_max,
        salary_currency,
        department:departments(id, name)
      ),
      locker:profiles!applications_locked_by_fkey(full_name, email)
    `)
    .eq('candidate_id', id)
    .order('applied_at', { ascending: false })

  // Fetch candidate history
  const { data: history } = await supabase
    .from('candidate_history')
    .select('*, actor:profiles(full_name, email), job:jobs(title)')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false })

  // Check if candidate has any rejected or declined applications (available for reconsideration)
  const hasRejectedApplications = applications?.some(
    (app) => app.stage === 'rejected' || app.lock_status === 'released'
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">{candidate.full_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {candidate.email}
            </a>
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {candidate.phone}
              </a>
            )}
            {candidate.source && (
              <Badge variant="outline">
                {SOURCE_LABELS[candidate.source] || candidate.source}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Global Lock Status */}
      {candidate.is_globally_locked && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">
                  Candidate Locked for Processing
                </p>
                <p className="text-sm text-red-700">
                  Being processed by <strong>{candidate.global_locker?.full_name}</strong> for{' '}
                  <strong>{candidate.locked_job?.title}</strong>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This candidate cannot be processed for other positions until the current process is completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multiple Applications Info */}
      {applications && applications.length > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">
                  Multi-Position Candidate
                </p>
                <p className="text-sm text-blue-700">
                  This candidate has applied to <strong>{applications.length} positions</strong>.
                  {candidate.is_globally_locked && ' Currently locked for one position.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous History Warning */}
      {hasRejectedApplications && history && history.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Previous Application History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-2">
              This candidate has been previously processed. Review their history below before reconsidering.
            </p>
          </CardContent>
        </Card>
      )}

      {/* CV and Links */}
      {(candidate.resume_url || candidate.linkedin_url || candidate.portfolio_url) && (
        <Card>
          <CardHeader>
            <CardTitle>Resume & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CV Information */}
            {candidate.resume_url && (
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {candidate.cv_filename || 'Resume'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {candidate.cv_size_bytes && (
                        <span>{(candidate.cv_size_bytes / 1024).toFixed(1)} KB</span>
                      )}
                      {candidate.cv_uploaded_at && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Uploaded {format(new Date(candidate.cv_uploaded_at), 'MMM d, yyyy')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/download-cv?candidateId=${candidate.id}`} download={candidate.cv_filename || 'resume.pdf'}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            )}

            {/* Other Links */}
            <div className="flex flex-wrap gap-3">
              {candidate.linkedin_url && (
                <Button variant="outline" className="border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5] hover:text-white" asChild>
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn Profile
                  </a>
                </Button>
              )}
              {candidate.portfolio_url && (
                <Button variant="outline" asChild>
                  <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Portfolio
                  </a>
                </Button>
              )}
            </div>

            {/* CV Auto-delete Notice */}
            {candidate.cv_uploaded_at && (
              <p className="text-xs text-muted-foreground">
                Note: CVs are automatically deleted after 6 months to optimize storage.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {candidate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {candidate.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Candidate Info Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary & Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Salary</p>
              <p className="font-medium">
                {candidate.current_salary 
                  ? `${CURRENCY_SYMBOLS[candidate.current_salary_currency as SalaryCurrency] || candidate.current_salary_currency || ''} ${candidate.current_salary.toLocaleString()}`
                  : 'Not specified'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expected Salary</p>
              <p className="font-medium">
                {candidate.expected_salary 
                  ? `${CURRENCY_SYMBOLS[candidate.expected_salary_currency as SalaryCurrency] || candidate.expected_salary_currency || ''} ${candidate.expected_salary.toLocaleString()}`
                  : 'Not specified'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notice Period</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {candidate.notice_period_days !== null && candidate.notice_period_days !== undefined
                  ? `${candidate.notice_period_days} days`
                  : 'Not specified'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nationality</p>
              <p className="font-medium">{candidate.nationality || 'Not specified'}</p>
            </div>
          </div>
          {/* Contact Numbers */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Contact Numbers</p>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div>
                <span className="text-muted-foreground">Primary:</span>{' '}
                {candidate.phone ? `${candidate.country_code || ''} ${candidate.phone}` : 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Home Country:</span>{' '}
                {candidate.home_country_phone ? `${candidate.home_country_code || ''} ${candidate.home_country_phone}` : 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Alternate:</span>{' '}
                {candidate.alternate_phone ? `${candidate.alternate_country_code || ''} ${candidate.alternate_phone}` : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Applications ({applications?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/candidates/${candidate.id}/apply`}>
              <Plus className="mr-2 h-4 w-4" />
              Add to Job
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(applications || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This candidate has not applied to any jobs yet.
            </p>
          ) : (
            <div className="space-y-4">
              {(applications as Application[]).map((application) => (
                <div
                  key={application.id}
                  className="rounded-lg border p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/dashboard/jobs/${application.job?.id}`}
                        className="font-medium hover:underline text-lg"
                      >
                        {application.job?.title}
                      </Link>
                      {application.job?.department?.name && (
                        <p className="text-sm text-muted-foreground">
                          Department: {application.job.department.name}
                        </p>
                      )}
                      {application.job?.salary_min && application.job?.salary_max && (
                        <p className="text-sm text-muted-foreground">
                          Position Salary: {CURRENCY_SYMBOLS[application.job.salary_currency as SalaryCurrency] || application.job.salary_currency}{' '}
                          {application.job.salary_min.toLocaleString()} - {application.job.salary_max.toLocaleString()}
                        </p>
                      )}
                      {/* Show lock status */}
                      {application.lock_status && application.lock_status !== 'available' && (
                        <div className="mt-1 flex items-center gap-2">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className={`text-xs ${LOCK_STATUS_COLORS[application.lock_status]}`}>
                            {LOCK_STATUS_LABELS[application.lock_status]}
                          </Badge>
                          {application.locker && (
                            <span className="text-xs text-muted-foreground">
                              by {application.locker.full_name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={STAGE_COLORS[application.stage]}>
                        {STAGE_LABELS[application.stage]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(application.applied_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Workflow Actions */}
                  <CandidateApplicationActions 
                    application={{
                      ...application,
                      candidate: {
                        email: candidate.email,
                        full_name: candidate.full_name,
                        current_salary: candidate.current_salary,
                        current_salary_currency: candidate.current_salary_currency,
                        expected_salary: candidate.expected_salary,
                        expected_salary_currency: candidate.expected_salary_currency,
                        notice_period_days: candidate.notice_period_days,
                        nationality: candidate.nationality,
                      }
                    }}
                    currentUser={currentProfile}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate History Timeline */}
      {history && history.length > 0 && (
        <CandidateHistoryTimeline history={history as CandidateHistory[]} />
      )}

      {/* Meta Information */}
      <div className="text-sm text-muted-foreground">
        Added on {format(new Date(candidate.created_at), 'MMMM d, yyyy')}
      </div>
    </div>
  )
}
