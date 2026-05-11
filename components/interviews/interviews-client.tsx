'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  History,
  CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Using local interface to avoid type conflicts with Interview's application property

const INTERVIEW_TYPE_ICONS: Record<string, typeof Phone> = {
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

interface InterviewWithRelations {
  id: string
  application_id: string
  scheduled_at: string
  duration_minutes: number
  interview_type: string
  location: string | null
  meeting_link: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  application?: {
    id: string
    candidate?: {
      id: string
      full_name: string
      email: string
    }
    job?: {
      title: string
      hiring_manager?: {
        email: string
        full_name: string
      }
    }
  }
  interviewer?: {
    full_name: string
    email: string
  } | null
}

interface InterviewsClientProps {
  interviews: InterviewWithRelations[]
  currentUserId: string
}

export function InterviewsClient({ interviews, currentUserId }: InterviewsClientProps) {
  const router = useRouter()
  
  // Split interviews into upcoming (scheduled status, any future date or today) and past/completed
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today
  
  const upcomingInterviews = interviews.filter(i => {
    const date = new Date(i.scheduled_at)
    // Show all scheduled interviews that are today or in the future
    return i.status === 'scheduled' && date >= now
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  
  const pastInterviews = interviews.filter(i => {
    const date = new Date(i.scheduled_at)
    // Show completed/cancelled interviews OR scheduled interviews in the past
    return i.status !== 'scheduled' || date < now
  }).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
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
    const date = new Date(interview.scheduled_at)
    setNewDate(format(date, 'yyyy-MM-dd'))
    setNewTime(format(date, 'HH:mm'))
    setNewDuration(String(interview.duration_minutes || 60))
    setNewLocation(interview.location || '')
    setRescheduleReason('')
    setError(null)
    setSuccess(null)
    setRescheduleDialog(true)
  }

  const handleReschedule = async () => {
    if (!selectedInterview || !newDate || !newTime) return

    setIsLoading(true)
    setError(null)

    try {
      const scheduledAt = new Date(`${newDate}T${newTime}`)

      // Update interview in database
      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(newDuration),
          location: newLocation || null,
          status: 'scheduled',
        })
        .eq('id', selectedInterview.id)

      if (updateError) throw updateError

      // Send reschedule notification email
      await fetch('/api/send-interview-reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateEmail: selectedInterview.application?.candidate?.email,
          candidateName: selectedInterview.application?.candidate?.full_name,
          interviewerEmail: selectedInterview.interviewer?.email,
          interviewerName: selectedInterview.interviewer?.full_name,
          hiringManagerEmail: selectedInterview.application?.job?.hiring_manager?.email,
          hiringManagerName: selectedInterview.application?.job?.hiring_manager?.full_name,
          jobTitle: selectedInterview.application?.job?.title,
          newDate: scheduledAt.toISOString(),
          newLocation: newLocation,
          reason: rescheduleReason,
        }),
      })

      setSuccess('Interview rescheduled successfully')
      setRescheduleDialog(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!selectedInterview) return

    setIsLoading(true)
    try {
      await supabase
        .from('interviews')
        .update({ status: 'completed' })
        .eq('id', selectedInterview.id)

      setCompleteDialog(false)
      router.refresh()
    } catch (err) {
      setError('Failed to mark interview as complete')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedInterview) return

    setIsLoading(true)
    try {
      await supabase
        .from('interviews')
        .update({ status: 'cancelled' })
        .eq('id', selectedInterview.id)

      setCancelDialog(false)
      router.refresh()
    } catch (err) {
      setError('Failed to cancel interview')
    } finally {
      setIsLoading(false)
    }
  }

  const InterviewRow = ({ interview, showActions = true }: { interview: InterviewWithRelations; showActions?: boolean }) => {
    const TypeIcon = INTERVIEW_TYPE_ICONS[interview.interview_type || 'video'] || Video

    return (
      <TableRow>
        <TableCell>
          <div className="font-medium">{interview.application?.candidate?.full_name || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">{interview.application?.candidate?.email}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm">{interview.application?.job?.title || '-'}</div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(interview.scheduled_at), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(interview.scheduled_at), 'h:mm a')}</span>
            <span>({interview.duration_minutes || 60} min)</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{interview.interview_type || 'video'}</span>
          </div>
          {interview.location && (
            <div className="text-sm text-muted-foreground">{interview.location}</div>
          )}
        </TableCell>
        <TableCell>
          <div className="text-sm">{interview.interviewer?.full_name || '-'}</div>
        </TableCell>
        <TableCell>
          <Badge className={STATUS_COLORS[interview.status] || STATUS_COLORS.scheduled}>
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1).replace('_', ' ')}
          </Badge>
        </TableCell>
        {showActions && (
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => openRescheduleDialog(interview)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedInterview(interview)
                  setCompleteDialog(true)
                }}
                title="Mark Complete"
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedInterview(interview)
                  setCancelDialog(true)
                }}
                title="Cancel"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Interviews</h1>
        <p className="text-muted-foreground">Manage scheduled interviews and track feedback</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>
      )}

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Upcoming Interviews
          </CardTitle>
          <CardDescription>
            All scheduled interviews - use actions to reschedule, complete, or cancel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No interviews scheduled for the next 7 days.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingInterviews.map((interview) => (
                  <InterviewRow key={interview.id} interview={interview} showActions={true} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Past/Completed Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            Recent Past Interviews
          </CardTitle>
          <CardDescription>
            Completed, cancelled, or past interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No interviews in the past 7 days.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastInterviews.map((interview) => (
                  <InterviewRow key={interview.id} interview={interview} showActions={interview.status === 'scheduled'} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>
              Reschedule interview for {selectedInterview?.application?.candidate?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-date">New Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-time">New Time</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-duration">Duration</Label>
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
                <Label htmlFor="new-location">Location</Label>
                <Input
                  id="new-location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Google Meet, Office"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rescheduling</Label>
              <Textarea
                id="reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Optional: Explain why the interview is being rescheduled"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={isLoading || !newDate || !newTime}>
              {isLoading ? 'Rescheduling...' : 'Reschedule Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialog} onOpenChange={setCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Interview as Complete</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this interview as completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? 'Updating...' : 'Mark Complete'}
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
              Are you sure you want to cancel this interview? The candidate will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Interview
            </Button>
            <Button onClick={handleCancel} disabled={isLoading} variant="destructive">
              {isLoading ? 'Cancelling...' : 'Cancel Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
