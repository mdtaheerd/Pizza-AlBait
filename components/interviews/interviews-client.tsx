'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Users,
  Monitor,
  CalendarClock,
  X,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Interview } from '@/lib/types'

const INTERVIEW_TYPE_ICONS = {
  phone: Phone,
  video: Video,
  onsite: MapPin,
  technical: Monitor,
  panel: Users,
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
}

interface InterviewWithRelations extends Interview {
  application?: {
    id: string
    candidate?: {
      id: string
      full_name: string
      email: string
    }
    job?: {
      title: string
    }
  }
  interviewer?: {
    full_name: string
    email: string
  }
}

interface InterviewsClientProps {
  groupedInterviews: Record<string, InterviewWithRelations[]>
  pastInterviews: InterviewWithRelations[]
}

export function InterviewsClient({ groupedInterviews: initialGrouped, pastInterviews: initialPast }: InterviewsClientProps) {
  const [groupedInterviews, setGroupedInterviews] = useState(initialGrouped)
  const [pastInterviews, setPastInterviews] = useState(initialPast)
  const [rescheduleDialog, setRescheduleDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [completeDialog, setCompleteDialog] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Reschedule form state
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newDuration, setNewDuration] = useState('60')
  const [newLocation, setNewLocation] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')

  const supabase = createClient()

  const openRescheduleDialog = (interview: InterviewWithRelations) => {
    setSelectedInterview(interview)
    const scheduledDate = new Date(interview.scheduled_at)
    setNewDate(format(scheduledDate, 'yyyy-MM-dd'))
    setNewTime(format(scheduledDate, 'HH:mm'))
    setNewDuration(String(interview.duration_minutes || 60))
    setNewLocation(interview.location || '')
    setRescheduleReason('')
    setError(null)
    setSuccess(null)
    setRescheduleDialog(true)
  }

  const openCancelDialog = (interview: InterviewWithRelations) => {
    setSelectedInterview(interview)
    setError(null)
    setSuccess(null)
    setCancelDialog(true)
  }

  const openCompleteDialog = (interview: InterviewWithRelations) => {
    setSelectedInterview(interview)
    setError(null)
    setSuccess(null)
    setCompleteDialog(true)
  }

  const handleReschedule = async () => {
    if (!selectedInterview || !newDate || !newTime) {
      setError('Please select a new date and time')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newScheduledAt = new Date(`${newDate}T${newTime}`)
      
      // Update interview in database
      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          scheduled_at: newScheduledAt.toISOString(),
          duration_minutes: parseInt(newDuration),
          location: newLocation || null,
          notes: selectedInterview.notes 
            ? `${selectedInterview.notes}\n\nRescheduled: ${rescheduleReason}` 
            : `Rescheduled: ${rescheduleReason}`,
        })
        .eq('id', selectedInterview.id)

      if (updateError) throw updateError

      // Also update the application's interview details
      if (selectedInterview.application?.id) {
        await supabase
          .from('applications')
          .update({
            interview_scheduled_at: newScheduledAt.toISOString(),
            interview_location: newLocation || null,
          })
          .eq('id', selectedInterview.application.id)
      }

      // Send reschedule notification emails
      await fetch('/api/send-interview-reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: selectedInterview.id,
          candidateEmail: selectedInterview.application?.candidate?.email,
          candidateName: selectedInterview.application?.candidate?.full_name,
          interviewerEmail: selectedInterview.interviewer?.email,
          interviewerName: selectedInterview.interviewer?.full_name,
          jobTitle: selectedInterview.application?.job?.title,
          newInterviewDate: newScheduledAt.toISOString(),
          newLocation: newLocation,
          reason: rescheduleReason,
        }),
      })

      setSuccess('Interview rescheduled successfully. Notifications sent.')
      setRescheduleDialog(false)
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (err) {
      console.error('Failed to reschedule interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to reschedule interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedInterview) return

    setIsLoading(true)
    setError(null)

    try {
      // Update interview status to cancelled
      const { error: updateError } = await supabase
        .from('interviews')
        .update({ status: 'cancelled' })
        .eq('id', selectedInterview.id)

      if (updateError) throw updateError

      // Send cancellation notification
      await fetch('/api/send-interview-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cancelled',
          candidateEmail: selectedInterview.application?.candidate?.email,
          candidateName: selectedInterview.application?.candidate?.full_name,
          interviewerEmail: selectedInterview.interviewer?.email,
          jobTitle: selectedInterview.application?.job?.title,
        }),
      })

      setSuccess('Interview cancelled successfully.')
      setCancelDialog(false)
      window.location.reload()
    } catch (err) {
      console.error('Failed to cancel interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!selectedInterview) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('interviews')
        .update({ status: 'completed' })
        .eq('id', selectedInterview.id)

      if (updateError) throw updateError

      setSuccess('Interview marked as completed.')
      setCompleteDialog(false)
      window.location.reload()
    } catch (err) {
      console.error('Failed to complete interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to update interview')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Interviews</h1>
        <p className="text-muted-foreground">
          Manage scheduled interviews and track feedback
        </p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-green-800">
          {success}
        </div>
      )}

      {/* Upcoming Interviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Upcoming Interviews</h2>
        {Object.keys(groupedInterviews).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No interviews scheduled for the next 7 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedInterviews).map(([dateKey, interviews]) => (
              <div key={dateKey}>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {format(new Date(dateKey), 'EEEE, MMMM d')}
                </h3>
                <div className="space-y-3">
                  {interviews.map((interview) => {
                    const TypeIcon = INTERVIEW_TYPE_ICONS[interview.interview_type as keyof typeof INTERVIEW_TYPE_ICONS] || Video
                    return (
                      <Card key={interview.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <TypeIcon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {interview.application?.candidate?.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.application?.job?.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary" className={STATUS_COLORS[interview.status]}>
                                {interview.status.replace('_', ' ')}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {format(new Date(interview.scheduled_at), 'h:mm a')}
                                <span className="mx-1">·</span>
                                {interview.duration_minutes} min
                              </div>
                              {interview.interviewer && (
                                <span className="text-sm text-muted-foreground">
                                  with {interview.interviewer.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          {interview.status === 'scheduled' && (
                            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRescheduleDialog(interview)}
                                className="gap-1"
                              >
                                <CalendarClock className="h-4 w-4" />
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCompleteDialog(interview)}
                                className="gap-1 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCancelDialog(interview)}
                                className="gap-1 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          )}

                          {(interview.location || interview.meeting_link) && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                              {interview.meeting_link ? (
                                <a
                                  href={interview.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Join Meeting
                                </a>
                              ) : interview.location ? (
                                <span>{interview.location}</span>
                              ) : null}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Recent Past Interviews</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {pastInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">
                        {interview.application?.candidate?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interview.application?.job?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={STATUS_COLORS[interview.status]}>
                        {interview.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(interview.scheduled_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Reschedule Interview
            </DialogTitle>
            <DialogDescription>
              Reschedule the interview for {selectedInterview?.application?.candidate?.full_name}. 
              Both the candidate and interviewer will be notified.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">New Date</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTime">New Time</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Office / Video call"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rescheduling</Label>
              <Textarea
                id="reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g., Interviewer unavailable, candidate requested change..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={isLoading}>
              {isLoading ? 'Rescheduling...' : 'Reschedule & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview with {selectedInterview?.application?.candidate?.full_name}? 
              They will be notified of the cancellation.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)} disabled={isLoading}>
              Keep Interview
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? 'Cancelling...' : 'Cancel Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialog} onOpenChange={setCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Interview as Completed</DialogTitle>
            <DialogDescription>
              Mark the interview with {selectedInterview?.application?.candidate?.full_name} as completed?
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? 'Updating...' : 'Mark Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
