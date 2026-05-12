'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Application, Profile } from '@/lib/types'
import { 
  CheckCircle, 
  XCircle, 
  Calendar as CalendarIcon, 
  Loader2,
  UserCheck,
  Send,
  Briefcase,
  Clock,
  MessageSquare,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidateApplicationActionsProps {
  application: Application & {
    candidate?: { 
      email: string
      full_name: string 
      current_salary?: number | null
      current_salary_currency?: string | null
      expected_salary?: number | null
      expected_salary_currency?: string | null
      notice_period_days?: number | null
      nationality?: string | null
    }
    job?: { 
      title: string
      department?: { id: string; name: string } | null
      salary_min?: number | null
      salary_max?: number | null
      salary_currency?: string
      created_by?: string | null
      hiring_manager?: { email: string; full_name: string } | null
    }
  }
  currentUser: Profile
}

export function CandidateApplicationActions({ 
  application, 
  currentUser 
}: CandidateApplicationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Dialog states
  const [shortlistDialogOpen, setShortlistDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [interviewResultDialogOpen, setInterviewResultDialogOpen] = useState(false)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  
  // Form states
  const [interviewDate, setInterviewDate] = useState<Date>()
  const [interviewTime, setInterviewTime] = useState('10:00')
  const [interviewLocation, setInterviewLocation] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewerEmail, setInterviewerEmail] = useState('')
  const [interviewerEmail2, setInterviewerEmail2] = useState('')
  const [interviewerEmail3, setInterviewerEmail3] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [recruiterComments, setRecruiterComments] = useState('')
  const [hiringManagerComments, setHiringManagerComments] = useState('')
  const [interviewResult, setInterviewResult] = useState<'hire' | 'reject'>('hire')
  const [sendSelectionEmail, setSendSelectionEmail] = useState(false)
  const [sendRejectionEmail, setSendRejectionEmail] = useState(true)
  
  // Screening notes states
  const [screeningNotesOpen, setScreeningNotesOpen] = useState(false)
  const [screeningSummary, setScreeningSummary] = useState(application.screening_summary || '')
  const [salaryExpectation, setSalaryExpectation] = useState(application.salary_expectation || '')
  const [benefitsExpectation, setBenefitsExpectation] = useState(application.benefits_expectation || '')
  const [noticePeriod, setNoticePeriod] = useState(application.notice_period || '')
  
  // Reschedule states
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    application.interview_date ? new Date(application.interview_date) : undefined
  )
  const [rescheduleTime, setRescheduleTime] = useState(
    application.interview_date ? format(new Date(application.interview_date), 'HH:mm') : '10:00'
  )
  const [rescheduleLocation, setRescheduleLocation] = useState(application.interview_location || '')
  
  // Multiple interviewers
  const [interviewerEmailsInput, setInterviewerEmailsInput] = useState(
    application.interviewer_emails?.join(', ') || application.interviewer_email || ''
  )

  const supabase = createClient()
  const isRecruiter = currentUser.role === 'recruiter' || currentUser.role === 'admin'
  const isHiringManager = currentUser.role === 'hiring_manager' || currentUser.role === 'admin'

  const handleSaveScreeningNotes = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          screening_summary: screeningSummary || null,
          salary_expectation: salaryExpectation || null,
          benefits_expectation: benefitsExpectation || null,
          notice_period: noticePeriod || null,
        })
        .eq('id', application.id)

      if (error) throw error
      setScreeningNotesOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving screening notes:', error)
      alert('Failed to save screening notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async (sendNotification: boolean) => {
    if (!rescheduleDate) {
      alert('Please select a date')
      return
    }
    
    setIsLoading(true)
    try {
      const [hours, minutes] = rescheduleTime.split(':').map(Number)
      const scheduledDate = new Date(rescheduleDate)
      scheduledDate.setHours(hours, minutes, 0, 0)

      // Parse interviewer emails
      const emailsArray = interviewerEmailsInput
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      const { error } = await supabase
        .from('applications')
        .update({
          interview_date: scheduledDate.toISOString(),
          interview_location: rescheduleLocation || null,
          interviewer_emails: emailsArray.length > 0 ? emailsArray : null,
          interview_status: 'rescheduled',
          original_interview_date: application.interview_date,
          rescheduled_at: new Date().toISOString(),
          rescheduled_by: currentUser.id,
        })
        .eq('id', application.id)

      if (error) throw error

      // Send notification if requested
      if (sendNotification && application.candidate?.email) {
        await fetch('/api/send-interview-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate.email,
            candidateName: application.candidate.full_name,
            jobTitle: application.job?.title,
            interviewDate: format(scheduledDate, 'EEEE, MMMM d, yyyy'),
            interviewTime: format(scheduledDate, 'h:mm a'),
            interviewLocation: rescheduleLocation,
            interviewerEmails: emailsArray,
            hiringManagerEmail: application.job?.hiring_manager?.email,
            hiringManagerName: application.job?.hiring_manager?.full_name,
            isRescheduled: true,
          }),
        })
      }

      setRescheduleDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error rescheduling interview:', error)
      alert('Failed to reschedule interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoveToScreening = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          stage: 'screening',
          assigned_to: currentUser.id,
          locked_by: currentUser.id,
          locked_at: new Date().toISOString(),
          lock_status: 'locked',
        })
        .eq('id', application.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error moving to screening:', error)
      alert('Failed to move to screening')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShortlistForInterview = async (sendNotificationToCandidate: boolean = false) => {
    if (!interviewDate || !interviewTime || !interviewerEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const [hours, minutes] = interviewTime.split(':')
      const scheduledDate = new Date(interviewDate)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes))

      // Parse multiple interviewer emails (comma-separated)
      const emailsArray = interviewerEmail
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0)

      const { error } = await supabase
        .from('applications')
        .update({
          stage: 'interview_scheduled',
          interview_date: scheduledDate.toISOString(),
          interview_location: interviewLocation || null,
          interviewer_name: interviewerName,
          interviewer_email: emailsArray[0] || interviewerEmail, // Keep first for backward compat
          interviewer_emails: emailsArray,
          interview_status: 'pending',
          shortlisted_at: new Date().toISOString(),
          shortlisted_by: currentUser.id,
          assigned_to: currentUser.id,
          locked_by: currentUser.id,
          locked_at: new Date().toISOString(),
          lock_status: 'locked',
        })
        .eq('id', application.id)

      if (error) throw error

      // Collect all interviewer emails (up to 3)
      const allInterviewerEmails = [interviewerEmail, interviewerEmail2, interviewerEmail3]
        .filter(e => e && e.trim())
        .map(e => e.trim())

      // Create interview record in interviews table
      const { data: newInterview, error: interviewError } = await supabase
        .from('interviews')
        .insert({
          application_id: application.id,
          scheduled_at: scheduledDate.toISOString(),
          duration_minutes: 60,
          interview_type: 'video',
          location: interviewLocation || null,
          meeting_link: meetingLink || null,
          interviewer_id: currentUser.id,
          interviewer_emails: allInterviewerEmails.length > 0 ? allInterviewerEmails : null,
          status: 'scheduled',
          notes: `Interviewer: ${interviewerName} (${allInterviewerEmails.join(', ')})`,
        })
        .select('id')
        .single()

      if (interviewError) {
        console.error('[v0] Failed to create interview record:', interviewError)
      }

      // Send email to candidate, interviewer(s), and hiring manager
      await fetch('/api/send-interview-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: newInterview?.id,
          candidateEmail: application.candidate?.email,
          candidateName: application.candidate?.full_name,
          jobTitle: application.job?.title,
          scheduledAt: scheduledDate.toISOString(),
          meetingLink: meetingLink || null,
          interviewerEmails: allInterviewerEmails,
          notes: `Location: ${interviewLocation || 'TBD'}`,
        }),
      })

      // Send notification to candidate if requested (when HM accepts)
      if (sendNotificationToCandidate && application.candidate?.email) {
        await fetch('/api/send-interview-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate.email,
            candidateName: application.candidate.full_name,
            jobTitle: application.job?.title,
            interviewDate: format(scheduledDate, 'EEEE, MMMM d, yyyy'),
            interviewTime: format(scheduledDate, 'h:mm a'),
            interviewLocation,
            interviewerEmails: emailsArray,
            hiringManagerEmail: application.job?.hiring_manager?.email,
            hiringManagerName: application.job?.hiring_manager?.full_name,
            isRescheduled: false,
          }),
        })
        
        // Mark notification as sent
        await supabase
          .from('applications')
          .update({
            interview_notification_sent_at: new Date().toISOString(),
            interview_status: 'accepted',
            interview_accepted_at: new Date().toISOString(),
            interview_accepted_by: currentUser.id,
          })
          .eq('id', application.id)
      }

      setShortlistDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (rejectionComments.length > 30) {
      alert('Comments must not exceed 30 characters')
      return
    }

    setIsLoading(true)
    try {
      // Unlock candidate on rejection so other recruiters can process
      const { error } = await supabase
        .from('applications')
        .update({
          stage: 'rejected',
          rejection_comments: rejectionComments || null,
          rejected_at: new Date().toISOString(),
          recruiter_comments: currentUser.role === 'recruiter' ? recruiterComments : undefined,
          hiring_manager_comments: currentUser.role === 'hiring_manager' ? hiringManagerComments : undefined,
          // Unlock candidate for other recruiters
          locked_by: null,
          locked_at: null,
          lock_status: 'available',
          assigned_to: null,
        })
        .eq('id', application.id)

      if (error) throw error

      // Send rejection email if option is selected
      if (sendRejectionEmail && application.candidate?.email) {
        await fetch('/api/send-rejection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate?.email,
            candidateName: application.candidate?.full_name,
            jobTitle: application.job?.title,
          }),
        })
      }

      setRejectDialogOpen(false)
      setSendRejectionEmail(true) // Reset for next time
      router.refresh()
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Failed to reject application')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterviewResult = async () => {
    setIsLoading(true)
    try {
      const updates: Record<string, unknown> = {
        interviewed_at: new Date().toISOString(),
        interviewed_by: currentUser.id,
        recruiter_comments: recruiterComments || application.recruiter_comments,
        hiring_manager_comments: hiringManagerComments || application.hiring_manager_comments,
      }

      if (interviewResult === 'hire') {
        updates.stage = 'offered'
        // Keep locked when moving to offer
      } else {
        updates.stage = 'rejected'
        updates.rejected_at = new Date().toISOString()
        updates.rejection_comments = rejectionComments || null
        // Unlock candidate on rejection for other recruiters
        updates.locked_by = null
        updates.locked_at = null
        updates.lock_status = 'available'
        updates.assigned_to = null
      }

      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', application.id)

      if (error) throw error

      // Send appropriate email
      if (interviewResult === 'hire' && sendSelectionEmail) {
        await fetch('/api/send-selection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate?.email,
            candidateName: application.candidate?.full_name,
            jobTitle: application.job?.title,
          }),
        })
      } else if (interviewResult === 'reject' && sendRejectionEmail && application.candidate?.email) {
        await fetch('/api/send-rejection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate?.email,
            candidateName: application.candidate?.full_name,
            jobTitle: application.job?.title,
          }),
        })
      }

      setInterviewResultDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating interview result:', error)
      alert('Failed to update interview result')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOffer = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          offer_sent_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (error) throw error

      await fetch('/api/send-offer-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateEmail: application.candidate?.email,
          candidateName: application.candidate?.full_name,
          jobTitle: application.job?.title,
        }),
      })

      setOfferDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error sending offer:', error)
      alert('Failed to send offer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsHired = async () => {
    setIsLoading(true)
    try {
      const { error: appError } = await supabase
        .from('applications')
        .update({
          stage: 'hired',
          hired_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (appError) throw appError

      // Close the job position
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: 'closed',
        })
        .eq('id', application.job_id)

      if (jobError) throw jobError

      router.refresh()
    } catch (error) {
      console.error('Error marking as hired:', error)
      alert('Failed to mark as hired')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can perform actions
  const canPerformActions = isRecruiter || isHiringManager

  // Show comments if they exist
  const hasComments = application.recruiter_comments || application.hiring_manager_comments

  // Render based on stage
  const renderActions = () => {
    const stage = application.stage

    switch (stage) {
      case 'applied':
        return isRecruiter ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveToScreening}
              disabled={isLoading}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
              Move to Screening
            </Button>
            <Button
              size="sm"
              onClick={() => setShortlistDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Shortlist for Interview
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : null

      case 'screening':
        return isRecruiter ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setScreeningNotesOpen(true)}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Screening Notes
            </Button>
            <Button
              size="sm"
              onClick={() => setShortlistDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Shortlist for Interview
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : null

      case 'shortlisted':
      case 'interview_scheduled':
        const isUrl = application.interview_location?.startsWith('http://') || application.interview_location?.startsWith('https://')
        return (
          <div className="space-y-3">
            {application.interview_date && (
              <div className="flex flex-wrap items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm">
                  Interview: {format(new Date(application.interview_date), 'PPp')}
                </span>
                {application.interview_location && (
                  isUrl ? (
                    <a 
                      href={application.interview_location} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Join Meeting
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      | {application.interview_location}
                    </span>
                  )
                )}
                {application.interview_status === 'rescheduled' && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                    Rescheduled
                  </Badge>
                )}
              </div>
            )}
            {application.interviewer_emails && application.interviewer_emails.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Interviewers: {application.interviewer_emails.join(', ')}
              </div>
            )}
            {(isRecruiter || isHiringManager) && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setInterviewResultDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Record Interview Result
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRescheduleDialogOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
              </div>
            )}
          </div>
        )

      case 'offered':
        return isRecruiter ? (
          <div className="flex flex-wrap gap-2">
            {!application.offer_sent_at && (
              <Button
                size="sm"
                onClick={() => setOfferDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Offer Email
              </Button>
            )}
            {application.offer_sent_at && (
              <Badge className="bg-emerald-100 text-emerald-700">
                Offer Sent: {format(new Date(application.offer_sent_at), 'PP')}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={handleMarkAsHired}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
              Mark as Hired & Close Position
            </Button>
          </div>
        ) : null

      case 'hired':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Hired {application.hired_at && `on ${format(new Date(application.hired_at), 'PP')}`}
            </Badge>
          </div>
        )

      case 'rejected':
        return (
          <div className="space-y-2">
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <XCircle className="mr-1 h-3 w-3" />
              Rejected
            </Badge>
            {application.rejection_comments && (
              <p className="text-sm text-muted-foreground">
                Reason: {application.rejection_comments}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      {/* Actions */}
      {canPerformActions && renderActions()}

      {/* Screening Notes - visible to hiring manager and in rejection view */}
      {(application.screening_summary || application.salary_expectation || application.benefits_expectation || application.notice_period) && (
        <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-medium flex items-center gap-2 text-amber-700">
            <MessageSquare className="h-4 w-4" />
            Screening Notes
          </p>
          {application.screening_summary && (
            <div className="text-sm">
              <span className="font-medium text-amber-700">Summary:</span>{' '}
              <span className="text-amber-900">{application.screening_summary}</span>
            </div>
          )}
          {application.salary_expectation && (
            <div className="text-sm">
              <span className="font-medium text-amber-700">Salary Expectation:</span>{' '}
              <span className="text-amber-900">{application.salary_expectation}</span>
            </div>
          )}
          {application.benefits_expectation && (
            <div className="text-sm">
              <span className="font-medium text-amber-700">Benefits Expectation:</span>{' '}
              <span className="text-amber-900">{application.benefits_expectation}</span>
            </div>
          )}
          {application.notice_period && (
            <div className="text-sm">
              <span className="font-medium text-amber-700">Notice Period:</span>{' '}
              <span className="text-amber-900">{application.notice_period}</span>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {hasComments && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </p>
          {application.recruiter_comments && (
            <div className="rounded bg-blue-50 p-2 text-sm">
              <p className="text-xs text-blue-600 font-medium">Recruiter</p>
              <p>{application.recruiter_comments}</p>
            </div>
          )}
          {application.hiring_manager_comments && (
            <div className="rounded bg-purple-50 p-2 text-sm">
              <p className="text-xs text-purple-600 font-medium">Hiring Manager</p>
              <p>{application.hiring_manager_comments}</p>
            </div>
          )}
        </div>
      )}

      {/* Screening Notes Dialog */}
      <Dialog open={screeningNotesOpen} onOpenChange={setScreeningNotesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Screening Notes</DialogTitle>
            <DialogDescription>
              Add your screening observations for {application.candidate?.full_name}. These notes will be visible to the hiring manager during interviews.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="screening_summary">Summary</Label>
              <Textarea
                id="screening_summary"
                value={screeningSummary}
                onChange={(e) => setScreeningSummary(e.target.value)}
                placeholder="Brief summary of the candidate's profile and fit..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_expectation">Salary Expectation</Label>
              <Input
                id="salary_expectation"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="e.g., AED 25,000 - 30,000 per month"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits_expectation">Benefits Expectation</Label>
              <Input
                id="benefits_expectation"
                value={benefitsExpectation}
                onChange={(e) => setBenefitsExpectation(e.target.value)}
                placeholder="e.g., Housing allowance, annual leave, medical insurance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice_period">Notice Period</Label>
              <Input
                id="notice_period"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="e.g., 30 days, 2 months, Immediately available"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScreeningNotesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveScreeningNotes} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shortlist Dialog */}
      <Dialog open={shortlistDialogOpen} onOpenChange={setShortlistDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {application.candidate?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interview Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !interviewDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {interviewDate ? format(interviewDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={interviewDate}
                    onSelect={setInterviewDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Interview Time *</Label>
              <Input
                id="time"
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                placeholder="e.g., Office Room 101, Abu Dhabi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/... or https://teams.microsoft.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_name">Interviewer Name</Label>
              <Input
                id="interviewer_name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Name of the primary interviewer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_email">Interviewer 1 Email *</Label>
              <Input
                id="interviewer_email"
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="interviewer1@cpecc.ae"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_email2">Interviewer 2 Email (Optional)</Label>
              <Input
                id="interviewer_email2"
                type="email"
                value={interviewerEmail2}
                onChange={(e) => setInterviewerEmail2(e.target.value)}
                placeholder="interviewer2@cpecc.ae"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_email3">Interviewer 3 Email (Optional)</Label>
              <Input
                id="interviewer_email3"
                type="email"
                value={interviewerEmail3}
                onChange={(e) => setInterviewerEmail3(e.target.value)}
                placeholder="interviewer3@cpecc.ae"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShortlistDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleShortlistForInterview(false)} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule (Pending HM Approval)
            </Button>
            <Button onClick={() => handleShortlistForInterview(true)} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Schedule & Notify Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              This will reject the application and notify the candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_comments">
                Rejection Reason (max 30 characters)
              </Label>
              <Input
                id="rejection_comments"
                value={rejectionComments}
                onChange={(e) => setRejectionComments(e.target.value.slice(0, 30))}
                placeholder="Brief reason..."
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                {rejectionComments.length}/30 characters
              </p>
            </div>
            </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => { setSendRejectionEmail(false); handleReject(); }} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
            {application.candidate?.email && (
              <Button 
                variant="destructive" 
                onClick={() => { setSendRejectionEmail(true); handleReject(); }} 
                disabled={isLoading}
                className="bg-red-700 hover:bg-red-800"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Send Rejection Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Result Dialog */}
      <Dialog open={interviewResultDialogOpen} onOpenChange={setInterviewResultDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Interview Result</DialogTitle>
            <DialogDescription>
              Update the interview result for {application.candidate?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Decision *</Label>
              <Select
                value={interviewResult}
                onValueChange={(value) => setInterviewResult(value as 'hire' | 'reject')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hire">Move to Offer</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {interviewResult === 'hire' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendSelectionEmail"
                  checked={sendSelectionEmail}
                  onChange={(e) => setSendSelectionEmail(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="sendSelectionEmail" className="text-sm font-normal">
                  Send selection email to candidate
                </Label>
              </div>
            )}

            {interviewResult === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection_comments_interview">
                  Rejection Reason (max 30 characters)
                </Label>
                <Input
                  id="rejection_comments_interview"
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value.slice(0, 30))}
                  placeholder="Brief reason..."
                  maxLength={30}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comments">
                {currentUser.role === 'hiring_manager' ? 'Hiring Manager' : 'Recruiter'} Comments
              </Label>
              <Textarea
                id="comments"
                value={currentUser.role === 'hiring_manager' ? hiringManagerComments : recruiterComments}
                onChange={(e) => 
                  currentUser.role === 'hiring_manager' 
                    ? setHiringManagerComments(e.target.value)
                    : setRecruiterComments(e.target.value)
                }
                placeholder="Add your feedback..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setInterviewResultDialogOpen(false)}>
              Cancel
            </Button>
            {interviewResult === 'reject' ? (
              <>
                <Button variant="destructive" onClick={() => { setSendRejectionEmail(false); handleInterviewResult(); }} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
                {application.candidate?.email && (
                  <Button 
                    variant="destructive" 
                    onClick={() => { setSendRejectionEmail(true); handleInterviewResult(); }} 
                    disabled={isLoading}
                    className="bg-red-700 hover:bg-red-800"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Mail className="mr-2 h-4 w-4" />
                    Send Rejection Email
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => { setSendRejectionEmail(false); handleInterviewResult(); }} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Result
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Offer</DialogTitle>
            <DialogDescription>
              Send an offer email to {application.candidate?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              This will send an offer notification email to the candidate at{' '}
              <strong>{application.candidate?.email}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Offer Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>
              Reschedule the interview for {application.candidate?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Interview Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule_time">New Interview Time *</Label>
              <Input
                id="reschedule_time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule_location">Location / Meeting Link</Label>
              <Input
                id="reschedule_location"
                value={rescheduleLocation}
                onChange={(e) => setRescheduleLocation(e.target.value)}
                placeholder="Office or video call link (paste URL here)"
              />
              <p className="text-xs text-muted-foreground">
                Paste a meeting URL (e.g., Teams, Zoom) to make it clickable
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_emails_input">Interviewer Email(s)</Label>
              <Input
                id="interviewer_emails_input"
                value={interviewerEmailsInput}
                onChange={(e) => setInterviewerEmailsInput(e.target.value)}
                placeholder="email1@company.com, email2@company.com"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple emails with commas
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleReschedule(false)} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reschedule Only
            </Button>
            <Button onClick={() => handleReschedule(true)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Reschedule & Notify Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
