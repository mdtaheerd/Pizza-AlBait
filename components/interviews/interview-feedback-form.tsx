'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

interface InterviewFeedbackFormProps {
  interviewId: string
  candidateName: string
  jobTitle: string
  departmentName?: string
  interviewDate?: string
  interviewRound?: string
  candidateEmail?: string
  recruiterEmail?: string
  hiringManagerEmail?: string
  existingFeedback?: {
    technical_score: number | null
    communication_score: number | null
    problem_solving_score: number | null
    leadership_score: number | null
    cultural_fit_score: number | null
    overall_score: number | null
    feedback_comments: string | null
    feedback_decision: string | null
    feedback_submitted: boolean
  }
}

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Below Average' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Good' },
  { value: 5, label: '5 - Excellent' },
]

const RECOMMENDATION_OPTIONS = [
  { value: 'strongly_recommended', label: 'Strongly Recommended to Hire', color: 'bg-green-600' },
  { value: 'recommended_with_reservations', label: 'Recommended with Reservations', color: 'bg-amber-600' },
  { value: 'not_recommended', label: 'Not Recommended', color: 'bg-orange-600' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-600' },
]

export function InterviewFeedbackForm({
  interviewId,
  candidateName,
  jobTitle,
  departmentName,
  interviewDate,
  interviewRound = 'First Round',
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
    problem_solving: existingFeedback?.problem_solving_score || 0,
    leadership: existingFeedback?.leadership_score || 0,
    cultural_fit: existingFeedback?.cultural_fit_score || 0,
    overall: existingFeedback?.overall_score || 0,
  })

  const [comments, setComments] = useState(existingFeedback?.feedback_comments || '')
  const [recommendation, setRecommendation] = useState<string>(
    existingFeedback?.feedback_decision || ''
  )

  const ScoreDropdown = ({ 
    label, 
    value, 
    onChange,
    required = false
  }: { 
    label: string
    value: number
    onChange: (score: number) => void
    required?: boolean
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value > 0 ? value.toString() : ''}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select rating..." />
        </SelectTrigger>
        <SelectContent>
          {SCORE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const handleSubmit = async () => {
    if (!recommendation) {
      setError('Please select a recommendation')
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

      // Update interview with feedback
      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          technical_score: scores.technical || null,
          communication_score: scores.communication || null,
          problem_solving_score: scores.problem_solving || null,
          leadership_score: scores.leadership || null,
          cultural_fit_score: scores.cultural_fit || null,
          overall_score: scores.overall,
          feedback_comments: comments || null,
          feedback_decision: recommendation,
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
          departmentName,
          recruiterEmail,
          hiringManagerEmail,
          recommendation,
          overallScore: scores.overall,
          comments,
          submittedBy: user?.email,
          interviewRound,
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

  const getRecommendationBadge = (value: string) => {
    const option = RECOMMENDATION_OPTIONS.find(o => o.value === value)
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : null
  }

  if (success || existingFeedback?.feedback_submitted) {
    const displayDecision = existingFeedback?.feedback_decision || recommendation
    return (
      <Card className="border-green-200 bg-green-50 max-w-3xl mx-auto">
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div>
              <p className="font-semibold text-lg text-green-800">Feedback Submitted Successfully</p>
              <p className="text-sm text-green-700 mt-2">
                Recommendation: {getRecommendationBadge(displayDecision)}
              </p>
              <p className="text-sm text-green-600 mt-4">
                The Recruiter/HRBP has been notified and will process the candidate accordingly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
              alt="CPECC"
              width={60}
              height={60}
              className="h-14 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Interview Feedback Form</h1>
              <p className="text-sm text-muted-foreground">CPECC Abu Dhabi Branch</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Candidate Information */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Candidate Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Candidate Name</p>
              <p className="font-medium">{candidateName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Position Applied</p>
              <p className="font-medium">{jobTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{departmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interview Date</p>
              <p className="font-medium">
                {interviewDate ? format(new Date(interviewDate), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interview Round</p>
              <p className="font-medium">{interviewRound}</p>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Evaluation Criteria
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Rate the candidate on a scale of 1-5 (1 = Poor, 5 = Excellent)
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreDropdown
              label="Technical / Functional Knowledge"
              value={scores.technical}
              onChange={(score) => setScores({ ...scores, technical: score })}
            />
            <ScoreDropdown
              label="Communication Skills"
              value={scores.communication}
              onChange={(score) => setScores({ ...scores, communication: score })}
            />
            <ScoreDropdown
              label="Problem Solving / Analytical Skills"
              value={scores.problem_solving}
              onChange={(score) => setScores({ ...scores, problem_solving: score })}
            />
            <ScoreDropdown
              label="Leadership / Teamwork"
              value={scores.leadership}
              onChange={(score) => setScores({ ...scores, leadership: score })}
            />
            <ScoreDropdown
              label="Cultural Fit"
              value={scores.cultural_fit}
              onChange={(score) => setScores({ ...scores, cultural_fit: score })}
            />
            <ScoreDropdown
              label="Overall Impression"
              value={scores.overall}
              onChange={(score) => setScores({ ...scores, overall: score })}
              required
            />
          </div>
        </div>

        {/* Interview Feedback / Recommendation */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Interview Feedback / Recommendation <span className="text-destructive">*</span>
          </h2>
          <Select
            value={recommendation}
            onValueChange={setRecommendation}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select recommendation..." />
            </SelectTrigger>
            <SelectContent>
              {RECOMMENDATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {recommendation === 'strongly_recommended' && 
              'The candidate will be moved forward for offer processing by Recruiter/HRBP.'}
            {recommendation === 'recommended_with_reservations' && 
              'The candidate may require additional evaluation before final decision.'}
            {recommendation === 'not_recommended' && 
              'The candidate is not recommended for this position at this time.'}
            {recommendation === 'rejected' && 
              'The candidate will be rejected for this position.'}
          </p>
        </div>

        {/* Additional Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments">
            Additional Comments
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide detailed feedback about the candidate's performance, strengths, areas for improvement, and any other observations..."
            rows={5}
            className="resize-none"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !recommendation || scores.overall === 0}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Feedback...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Once submitted, the Recruiter/HRBP will be notified to take further action on this candidate.
        </p>
      </CardContent>
    </Card>
  )
}
