'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Star, CheckCircle, XCircle, Clock } from 'lucide-react'

interface InterviewFeedbackFormProps {
  interviewId: string
  candidateName: string
  jobTitle: string
  candidateEmail?: string
  recruiterEmail?: string
  hiringManagerEmail?: string
  existingFeedback?: {
    technical_score: number | null
    communication_score: number | null
    experience_score: number | null
    cultural_fit_score: number | null
    overall_score: number | null
    feedback_comments: string | null
    feedback_decision: 'hire' | 'reject' | 'hold' | null
    feedback_submitted: boolean
  }
}

const SCORE_LABELS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export function InterviewFeedbackForm({
  interviewId,
  candidateName,
  jobTitle,
  candidateEmail,
  recruiterEmail,
  hiringManagerEmail,
  existingFeedback,
}: InterviewFeedbackFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [scores, setScores] = useState({
    technical: existingFeedback?.technical_score || 0,
    communication: existingFeedback?.communication_score || 0,
    experience: existingFeedback?.experience_score || 0,
    cultural_fit: existingFeedback?.cultural_fit_score || 0,
    overall: existingFeedback?.overall_score || 0,
  })

  const [comments, setComments] = useState(existingFeedback?.feedback_comments || '')
  const [decision, setDecision] = useState<'hire' | 'reject' | 'hold' | ''>(
    existingFeedback?.feedback_decision || ''
  )

  const ScoreSelector = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: number
    onChange: (score: number) => void 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                score <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30 hover:text-amber-400/50'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {value > 0 ? SCORE_LABELS[value as keyof typeof SCORE_LABELS] : 'Not rated'}
        </span>
      </div>
    </div>
  )

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please select a decision (Hire, Reject, or Hold)')
      return
    }

    if (scores.overall === 0) {
      setError('Please provide at least an overall score')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          technical_score: scores.technical || null,
          communication_score: scores.communication || null,
          experience_score: scores.experience || null,
          cultural_fit_score: scores.cultural_fit || null,
          overall_score: scores.overall,
          feedback_comments: comments || null,
          feedback_decision: decision,
          feedback_submitted: true,
          feedback_submitted_at: new Date().toISOString(),
          feedback_submitted_by: user?.email || 'Unknown',
          status: 'completed',
        })
        .eq('id', interviewId)

      if (updateError) throw updateError

      // Send notification to recruiter and hiring manager
      await fetch('/api/send-interview-feedback-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          jobTitle,
          recruiterEmail,
          hiringManagerEmail,
          decision,
          overallScore: scores.overall,
          comments,
          submittedBy: user?.email,
        }),
      })

      setSuccess(true)
      router.refresh()
    } catch (err) {
      console.error('[v0] Error submitting feedback:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success || existingFeedback?.feedback_submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Feedback Submitted</p>
              <p className="text-sm text-green-700">
                Decision: <Badge className={
                  existingFeedback?.feedback_decision === 'hire' ? 'bg-green-600' :
                  existingFeedback?.feedback_decision === 'reject' ? 'bg-red-600' :
                  'bg-amber-600'
                }>
                  {existingFeedback?.feedback_decision?.toUpperCase() || decision.toUpperCase()}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Feedback</CardTitle>
        <CardDescription>
          Rate {candidateName} for the {jobTitle} position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scoring Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <ScoreSelector
            label="Technical Skills"
            value={scores.technical}
            onChange={(score) => setScores({ ...scores, technical: score })}
          />
          <ScoreSelector
            label="Communication"
            value={scores.communication}
            onChange={(score) => setScores({ ...scores, communication: score })}
          />
          <ScoreSelector
            label="Relevant Experience"
            value={scores.experience}
            onChange={(score) => setScores({ ...scores, experience: score })}
          />
          <ScoreSelector
            label="Cultural Fit"
            value={scores.cultural_fit}
            onChange={(score) => setScores({ ...scores, cultural_fit: score })}
          />
        </div>

        <div className="border-t pt-4">
          <ScoreSelector
            label="Overall Score *"
            value={scores.overall}
            onChange={(score) => setScores({ ...scores, overall: score })}
          />
        </div>

        {/* Comments Section */}
        <div className="space-y-2">
          <Label htmlFor="comments">Additional Comments</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide detailed feedback about the candidate's performance..."
            rows={4}
          />
        </div>

        {/* Decision Section */}
        <div className="space-y-3 border-t pt-4">
          <Label>Final Decision *</Label>
          <RadioGroup
            value={decision}
            onValueChange={(value) => setDecision(value as 'hire' | 'reject' | 'hold')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hire" id="hire" />
              <Label htmlFor="hire" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Hire
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reject" id="reject" />
              <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer">
                <XCircle className="h-5 w-5 text-red-600" />
                Reject
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hold" id="hold" />
              <Label htmlFor="hold" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-5 w-5 text-amber-600" />
                Hold
              </Label>
            </div>
          </RadioGroup>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !decision || scores.overall === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
