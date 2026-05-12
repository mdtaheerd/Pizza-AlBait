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
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, X, Calendar, Clock, Link as LinkIcon, Users } from 'lucide-react'
import { format } from 'date-fns'

interface ScheduleInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  recruiterEmail?: string
  hiringManagerEmail?: string
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  recruiterEmail,
  hiringManagerEmail,
}: ScheduleInterviewDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('60')
  const [interviewType, setInterviewType] = useState('video')
  const [meetingLink, setMeetingLink] = useState('')
  const [location, setLocation] = useState('')
  const [interviewerEmails, setInterviewerEmails] = useState<string[]>([''])
  const [notes, setNotes] = useState('')

  const addInterviewerEmail = () => {
    if (interviewerEmails.length < 3) {
      setInterviewerEmails([...interviewerEmails, ''])
    }
  }

  const removeInterviewerEmail = (index: number) => {
    setInterviewerEmails(interviewerEmails.filter((_, i) => i !== index))
  }

  const updateInterviewerEmail = (index: number, value: string) => {
    const updated = [...interviewerEmails]
    updated[index] = value
    setInterviewerEmails(updated)
  }

  const handleSubmit = async () => {
    if (!date || !time) {
      setError('Please select a date and time')
      return
    }

    const validEmails = interviewerEmails.filter(e => e.trim())
    if (validEmails.length === 0) {
      setError('Please add at least one interviewer email')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const scheduledAt = new Date(`${date}T${time}`)

      // Create interview record
      const { data: interview, error: createError } = await supabase
        .from('interviews')
        .insert({
          application_id: applicationId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration),
          interview_type: interviewType,
          meeting_link: meetingLink || null,
          location: location || null,
          interviewer_emails: validEmails,
          notes: notes || null,
          status: 'scheduled',
        })
        .select()
        .single()

      if (createError) throw createError

      // Update application stage
      await supabase
        .from('applications')
        .update({ stage: 'interview_scheduled' })
        .eq('id', applicationId)

      // Send notification emails to interviewers and candidate
      await fetch('/api/send-interview-schedule-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          jobTitle,
          interviewerEmails: validEmails,
          recruiterEmail,
          hiringManagerEmail,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(duration),
          interviewType,
          meetingLink,
          location,
        }),
      })

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      console.error('[v0] Error scheduling interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to schedule interview')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Schedule an interview for {candidateName} ({jobTitle})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
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
              <Label htmlFor="type">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meeting-link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Meeting Link
            </Label>
            <Input
              id="meeting-link"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
          </div>

          {/* Location (for onsite) */}
          {interviewType === 'onsite' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office address or room number"
              />
            </div>
          )}

          {/* Interviewer Emails */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Interviewer Emails * (up to 3)
            </Label>
            <div className="space-y-2">
              {interviewerEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateInterviewerEmail(index, e.target.value)}
                    placeholder={`Interviewer ${index + 1} email`}
                  />
                  {interviewerEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInterviewerEmail(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {interviewerEmails.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInterviewerEmail}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Interviewer
                </Button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions for the interview..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Interview'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
