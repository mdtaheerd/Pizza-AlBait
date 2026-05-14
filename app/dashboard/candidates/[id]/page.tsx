import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Mail, Phone, Linkedin, Globe, FileText, Plus, AlertTriangle, Lock, Download, Calendar, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { STAGE_LABELS, STAGE_COLORS, LOCK_STATUS_LABELS, LOCK_STATUS_COLORS } from '@/lib/types'
import type { Application, CandidateHistory } from '@/lib/types'
import { CandidateHistoryTimeline } from '@/components/candidates/candidate-history'
import { CandidateRemarks } from '@/components/candidates/candidate-remarks'
import { CandidateApplicationActionsWrapper } from '@/components/candidates/candidate-application-actions-wrapper'

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
  const serviceClient = createServiceClient()

  // Get current user profile
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUserProfile } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() : { data: null }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*, global_locker:profiles!candidates_global_locked_by_fkey(full_name, email), locked_job:jobs!candidates_global_lock_job_id_fkey(title)')
    .eq('id', id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  // Fetch applications using the same supabase client (RLS is disabled on all tables)
  // Use the same authenticated client for applications
  const { data: applications, error: applicationsError } = await serviceClient
    .from('applications')
    .select('*, job:jobs(id, title, department:departments(id, name), salary_min, salary_max, salary_currency, created_by, recruiter_id)')
    .eq('candidate_id', id)
    .order('applied_at', { ascending: false })
  
  
  // Fetch interviews separately for each application
  const applicationIds = (applications || []).map(a => a.id)
  const { data: allInterviews } = applicationIds.length > 0
    ? await serviceClient.from('interviews').select('id, application_id, scheduled_at, status').in('application_id', applicationIds)
    : { data: [] }
  
  // Group interviews by application_id
  const interviewsByApp = (allInterviews || []).reduce((acc, interview) => {
    if (!acc[interview.application_id]) acc[interview.application_id] = []
    acc[interview.application_id].push(interview)
    return acc
  }, {} as Record<string, any[]>)
  
  // Attach interviews to applications
  const applicationsWithInterviews = (applications || []).map(app => ({
    ...app,
    interviews: interviewsByApp[app.id] || []
  }))

  // Fetch locker and hiring manager profiles separately to avoid join issues
  const lockerIds = [...new Set((applicationsWithInterviews || []).map(a => a.locked_by).filter(Boolean))]
  const hmIds: string[] = [] // hiring_manager_id does not exist in jobs table
  const recruiterIds = [...new Set((applicationsWithInterviews || []).map(a => a.job?.recruiter_id).filter(Boolean))]
  const allProfileIds = [...new Set([...lockerIds, ...hmIds, ...recruiterIds])]
  
  const { data: relatedProfiles } = allProfileIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', allProfileIds)
    : { data: [] }
  
  const profileMap = (relatedProfiles || []).reduce((acc, p) => {
    acc[p.id] = p
    return acc
  }, {} as Record<string, { id: string; full_name: string; email: string }>)
  
  // Enrich applications with profile data
  const enrichedApplications = (applicationsWithInterviews || []).map(app => ({
    ...app,
    locker: app.locked_by ? profileMap[app.locked_by] : null,
    job: app.job ? {
      ...app.job,
      hiring_manager: null, // hiring_manager_id not in jobs table
      recruiter: app.job.recruiter_id ? profileMap[app.job.recruiter_id] : null
    } : null
  }))

  // Fetch candidate history
  const { data: history } = await serviceClient
    .from('candidate_history')
    .select('*, job:jobs(title)')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false })

  // Fetch actor profiles separately for history
  const actorIds = [...new Set((history || []).map(h => h.actor_id).filter(Boolean))]
  const { data: actors } = actorIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', actorIds)
    : { data: [] }

  const actorMap = (actors || []).reduce((acc, a) => {
    acc[a.id] = { full_name: a.full_name, email: a.email }
    return acc
  }, {} as Record<string, { full_name: string; email: string }>)

  const historyWithActor = (history || []).map(h => ({
    ...h,
    actor: h.actor_id ? actorMap[h.actor_id] : null
  }))

  // Check if candidate has any rejected or declined applications (available for reconsideration)
  const hasRejectedApplications = enrichedApplications?.some(
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
      {enrichedApplications && enrichedApplications.length > 1 && (
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
                  This candidate has applied to <strong>{enrichedApplications.length} positions</strong>.
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
                  <a href={`/api/download-cv?candidateId=${candidate.id}`}>
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

      {/* Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Applications ({enrichedApplications?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/candidates/${candidate.id}/apply`}>
              <Plus className="mr-2 h-4 w-4" />
              Add to Job
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(enrichedApplications || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This candidate has not applied to any jobs yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(enrichedApplications as Application[]).map((application) => (
                <div key={application.id} className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Link
                        href={`/dashboard/jobs/${application.job?.id}`}
                        className="font-medium hover:underline"
                      >
                        {application.job?.title}
                      </Link>
                      {application.job?.department?.name && (
                        <p className="text-sm text-muted-foreground">
                          {application.job.department.name}
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
                        {(() => {
                          // Get the latest scheduled interview for this application
                          const interviews = (application as any).interviews || []
                          const latestInterview = interviews
                            .filter((i: any) => i.status === 'scheduled')
                            .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]
                          
                          if (latestInterview && application.stage === 'interview_scheduled') {
                            return format(new Date(latestInterview.scheduled_at), 'MMM d, yyyy')
                          }
                          return format(new Date(application.applied_at), 'MMM d, yyyy')
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Application Actions (Schedule Interview, Move Stage, etc.) */}
                  {currentUserProfile && ['admin', 'recruiter', 'hiring_manager'].includes(currentUserProfile.role) && (
                    <CandidateApplicationActionsWrapper
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
                        },
                        job: application.job ? {
                          ...application.job,
                          hiring_manager: (application.job as any).hiring_manager,
                        } : undefined,
                      }}
                      recruiterName={(application.job as any)?.recruiter?.full_name}
                      hiringManagerName={(application.job as any)?.hiring_manager?.full_name}
                      currentUser={currentUserProfile}
                    />
                  )}
                  
                  {/* Remarks for this application */}
                  {currentUserProfile && (
                    <CandidateRemarks
                      applicationId={application.id}
                      recruiterRemarks={(application as any).recruiter_remarks}
                      recruiterRemarksUpdatedAt={(application as any).recruiter_remarks_updated_at}
                      hmRemarks={(application as any).hm_remarks}
                      hmRemarksUpdatedAt={(application as any).hm_remarks_updated_at}
                      recruiterName={(application.job as any)?.recruiter?.full_name}
                      hiringManagerName={(application.job as any)?.hiring_manager?.full_name}
                      currentUser={currentUserProfile}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate History Timeline */}
      {historyWithActor && (
        <CandidateHistoryTimeline history={historyWithActor as CandidateHistory[]} />
      )}

      {/* Meta Information */}
      <div className="text-sm text-muted-foreground">
        Added on {format(new Date(candidate.created_at), 'MMMM d, yyyy')}
      </div>
    </div>
  )
}
