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
import { Application, ApplicationStage, STAGE_LABELS, STAGE_COLORS, Profile } from '@/lib/types'
import { 
  CheckCircle, 
  XCircle, 
  Calendar as CalendarIcon, 
  Loader2,
  UserCheck,
  Send,
  Briefcase,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ApplicationWorkflowActionsProps {
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
      department?: { name: string } | null
      salary_min?: number | null
      salary_max?: number | null
      salary_currency?: string
      created_by?: string | null
      hiring_manager?: { email: string; full_name: string } | null
    }
  }
  currentUser: Profile
  onUpdate?: () => void
}

export function ApplicationWorkflowActions({ 
  application, 
  currentUser,
  onUpdate 
}: ApplicationWorkflowActionsProps) {
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
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewerEmail, setInterviewerEmail] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [recruiterComments, setRecruiterComments] = useState('')
  const [hiringManagerComments, setHiringManagerComments] = useState('')
  const [interviewResult, setInterviewResult] = useState<'hire' | 'reject'>('hire')
  const [sendSelectionEmail, setSendSelectionEmail] = useState(false)

  const supabase = createClient()
  const isRecruiter = currentUser.role === 'recruiter' || currentUser.role === 'admin'
  const isHiringManager = currentUser.role === 'hiring_manager' || currentUser.role === 'admin'

  const handleShortlistForInterview = async () => {
    if (!interviewDate || !interviewTime || !interviewerEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Combine date and time
      const [hours, minutes] = interviewTime.split(':')
      const scheduledDate = new Date(interviewDate)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes))

      const { error } = await supabase
        .from('applications')
        .update({
          stage: 'interview_scheduled',
          interview_date: scheduledDate.toISOString(),
          interview_location: interviewLocation || null,
          interviewer_name: interviewerName,
          interviewer_email: interviewerEmail,
          shortlisted_at: new Date().toISOString(),
          shortlisted_by: currentUser.id,
        })
        .eq('id', application.id)

      if (error) throw error

      // Send email to candidate, interviewer, and hiring manager
      await fetch('/api/send-interview-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          candidateEmail: application.candidate?.email,
          candidateName: application.candidate?.full_name,
          interviewerEmail,
          interviewerEmails: [interviewerEmail],
          interviewerName,
          jobTitle: application.job?.title,
          interviewDate: scheduledDate.toISOString(),
          interviewLocation,
          hiringManagerEmail: application.job?.hiring_manager?.email,
          hiringManagerName: application.job?.hiring_manager?.full_name,
        }),
      })

      setShortlistDialogOpen(false)
      router.refresh()
      onUpdate?.()
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
      const { error } = await supabase
        .from('applications')
        .update({
          stage: 'rejected',
          rejection_comments: rejectionComments || null,
          rejected_at: new Date().toISOString(),
          recruiter_comments: currentUser.role === 'recruiter' ? recruiterComments : undefined,
          hiring_manager_comments: currentUser.role === 'hiring_manager' ? hiringManagerComments : undefined,
        })
        .eq('id', application.id)

      if (error) throw error

      // Send rejection email
      await fetch('/api/send-rejection-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateEmail: application.candidate?.email,
          candidateName: application.candidate?.full_name,
          jobTitle: application.job?.title,
          reason: rejectionComments,
        }),
      })

      setRejectDialogOpen(false)
      router.refresh()
      onUpdate?.()
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
      } else {
        updates.stage = 'rejected'
        updates.rejected_at = new Date().toISOString()
        updates.rejection_comments = rejectionComments || null
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
      } else if (interviewResult === 'reject') {
        await fetch('/api/send-rejection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: application.candidate?.email,
            candidateName: application.candidate?.full_name,
            jobTitle: application.job?.title,
            reason: rejectionComments,
          }),
        })
      }

      setInterviewResultDialogOpen(false)
      router.refresh()
      onUpdate?.()
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

      // Send offer email
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
      onUpdate?.()
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
      // Update application
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
      onUpdate?.()
    } catch (error) {
      console.error('Error marking as hired:', error)
      alert('Failed to mark as hired')
    } finally {
      setIsLoading(false)
    }
  }

  // Determine which actions to show based on stage
  const renderActions = () => {
    const stage = application.stage

    switch (stage) {
      case 'applied':
      case 'new':
      case 'screening':
        return isRecruiter ? (
          <div className="flex flex-wrap gap-2">
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
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Interview: {application.interview_date ? format(new Date(application.interview_date), 'PPp') : 'Not scheduled'}
            </div>
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
              </div>
            )}
          </div>
        )

      case 'interviewed':
        return (isRecruiter || isHiringManager) ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setInterviewResultDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Move to Offer / Reject
            </Button>
          </div>
        ) : null

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
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hired on {application.hired_at ? format(new Date(application.hired_at), 'PP') : 'N/A'}
          </Badge>
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
    <div className="space-y-4">
      {/* Current Stage */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Badge className={cn(STAGE_COLORS[application.stage as ApplicationStage])}>
          {STAGE_LABELS[application.stage as ApplicationStage] || application.stage}
        </Badge>
      </div>

      {/* Candidate Info Summary */}
      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Position:</span>
            <p className="font-medium">{application.job?.title}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Department:</span>
            <p className="font-medium">{application.job?.department?.name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Current Salary:</span>
            <p className="font-medium">
              {application.candidate?.current_salary 
                ? `${application.candidate.current_salary_currency} ${application.candidate.current_salary.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Salary:</span>
            <p className="font-medium">
              {application.candidate?.expected_salary 
                ? `${application.candidate.expected_salary_currency} ${application.candidate.expected_salary.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Position Salary:</span>
            <p className="font-medium">
              {application.job?.salary_min && application.job?.salary_max
                ? `${application.job.salary_currency} ${application.job.salary_min.toLocaleString()} - ${application.job.salary_max.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Notice Period:</span>
            <p className="font-medium">
              {application.candidate?.notice_period_days !== null 
                ? `${application.candidate?.notice_period_days} days`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {renderActions()}

      {/* Comments Section */}
      {(application.recruiter_comments || application.hiring_manager_comments) && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Comments</p>
          {application.recruiter_comments && (
            <div className="rounded-lg bg-blue-50 p-2">
              <p className="text-xs text-blue-600 font-medium">Recruiter</p>
              <p className="text-sm">{application.recruiter_comments}</p>
            </div>
          )}
          {application.hiring_manager_comments && (
            <div className="rounded-lg bg-purple-50 p-2">
              <p className="text-xs text-purple-600 font-medium">Hiring Manager</p>
              <p className="text-sm">{application.hiring_manager_comments}</p>
            </div>
          )}
        </div>
      )}

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
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input
                id="location"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                placeholder="Office or video call link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_name">Interviewer Name</Label>
              <Input
                id="interviewer_name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Name of the interviewer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_email">Interviewer Email *</Label>
              <Input
                id="interviewer_email"
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="interviewer@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShortlistDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShortlistForInterview} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Interview
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject & Notify
            </Button>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewResultDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInterviewResult} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Result
            </Button>
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
    </div>
  )
}
