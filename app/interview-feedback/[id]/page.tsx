'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, CheckCircle, AlertCircle, Star } from 'lucide-react'
import Image from 'next/image'

const SCORE_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent']

export default function InterviewFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interview, setInterview] = useState<any>(null)
  
  const [feedback, setFeedback] = useState({
    technical_score: 0,
    communication_score: 0,
    experience_score: 0,
    cultural_fit_score: 0,
    overall_score: 0,
    feedback_comments: '',
    feedback_decision: '' as 'hire' | 'reject' | 'hold' | '',
    feedback_submitted_by: ''
  })

  useEffect(() => {
    async function fetchInterview() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            candidate:candidates(full_name, email),
            job:jobs(title)
          )
        `)
        .eq('id', interviewId)
        .single()

      if (error || !data) {
        setError('Interview not found or has expired')
        setIsLoading(false)
        return
      }

      if (data.feedback_submitted) {
        setIsSubmitted(true)
      }

      setInterview(data)
      setIsLoading(false)
    }

    fetchInterview()
  }, [interviewId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.feedback_decision) {
      setError('Please select a decision (Hire, Reject, or Hold)')
      return
    }

    if (!feedback.feedback_submitted_by.trim()) {
      setError('Please enter your name')
      return
    }

    // Validate all scores are filled
    if (feedback.technical_score === 0 || feedback.communication_score === 0 || 
        feedback.experience_score === 0 || feedback.cultural_fit_score === 0 || 
        feedback.overall_score === 0) {
      setError('Please rate all categories')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          ...feedback,
          feedback_submitted: true,
          feedback_submitted_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', interviewId)

      if (updateError) throw updateError

      // Send notification to recruiter/HM
      await fetch('/api/send-interview-feedback-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          candidateName: interview?.application?.candidate?.full_name,
          jobTitle: interview?.application?.job?.title,
          decision: feedback.feedback_decision,
          overallScore: feedback.overall_score,
          submittedBy: feedback.feedback_submitted_by
        })
      })

      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ScoreSelector = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: number
    onChange: (value: number) => void 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
              value === score 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <Star className={`h-5 w-5 ${value >= score ? 'fill-current' : ''}`} />
            <span className="text-xs mt-1">{score}</span>
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-muted-foreground">{SCORE_LABELS[value - 1]}</p>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Feedback Submitted</h2>
            <p className="text-muted-foreground">
              Thank you for submitting your interview feedback. The recruitment team has been notified.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/images/cpecc-logo.png"
            alt="CPECC"
            width={120}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">Interview Feedback Form</h1>
        </div>

        {/* Interview Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate:</span>
              <span className="font-medium">{interview?.application?.candidate?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-medium">{interview?.application?.job?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interview Date:</span>
              <span className="font-medium">
                {new Date(interview?.scheduled_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
            <CardDescription>
              Please rate the candidate on the following criteria (1-5 scale)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Your Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <input
                  id="name"
                  type="text"
                  value={feedback.feedback_submitted_by}
                  onChange={(e) => setFeedback({ ...feedback, feedback_submitted_by: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Score Selectors */}
              <div className="grid gap-6 sm:grid-cols-2">
                <ScoreSelector
                  label="Technical Skills"
                  value={feedback.technical_score}
                  onChange={(value) => setFeedback({ ...feedback, technical_score: value })}
                />
                <ScoreSelector
                  label="Communication"
                  value={feedback.communication_score}
                  onChange={(value) => setFeedback({ ...feedback, communication_score: value })}
                />
                <ScoreSelector
                  label="Relevant Experience"
                  value={feedback.experience_score}
                  onChange={(value) => setFeedback({ ...feedback, experience_score: value })}
                />
                <ScoreSelector
                  label="Cultural Fit"
                  value={feedback.cultural_fit_score}
                  onChange={(value) => setFeedback({ ...feedback, cultural_fit_score: value })}
                />
              </div>

              <ScoreSelector
                label="Overall Assessment"
                value={feedback.overall_score}
                onChange={(value) => setFeedback({ ...feedback, overall_score: value })}
              />

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  value={feedback.feedback_comments}
                  onChange={(e) => setFeedback({ ...feedback, feedback_comments: e.target.value })}
                  placeholder="Provide detailed feedback about the candidate's strengths, weaknesses, and any other observations..."
                  rows={4}
                />
              </div>

              {/* Decision */}
              <div className="space-y-3">
                <Label>Recommendation *</Label>
                <RadioGroup
                  value={feedback.feedback_decision}
                  onValueChange={(value) => setFeedback({ ...feedback, feedback_decision: value as 'hire' | 'reject' | 'hold' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hire" id="hire" />
                    <Label htmlFor="hire" className="text-green-600 font-medium cursor-pointer">Hire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hold" id="hold" />
                    <Label htmlFor="hold" className="text-amber-600 font-medium cursor-pointer">Hold</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label htmlFor="reject" className="text-red-600 font-medium cursor-pointer">Reject</Label>
                  </div>
                </RadioGroup>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
