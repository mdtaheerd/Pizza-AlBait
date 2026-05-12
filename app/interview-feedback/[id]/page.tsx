'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { InterviewFeedbackForm } from '@/components/interviews/interview-feedback-form'

export default function InterviewFeedbackPage() {
  const params = useParams()
  const interviewId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interview, setInterview] = useState<any>(null)

  useEffect(() => {
    async function fetchInterview() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            id,
            candidate:candidates(full_name, email),
            job:jobs(
              title,
              department:departments(name),
              creator:profiles!jobs_created_by_fkey(email, full_name),
              hiring_manager:profiles!jobs_hiring_manager_id_fkey(email, full_name)
            )
          )
        `)
        .eq('id', interviewId)
        .single()

      if (error || !data) {
        setError('Interview not found or has expired')
        setIsLoading(false)
        return
      }

      setInterview(data)
      setIsLoading(false)
    }

    fetchInterview()
  }, [interviewId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <InterviewFeedbackForm
        interviewId={interviewId}
        candidateName={interview?.application?.candidate?.full_name || 'Unknown'}
        jobTitle={interview?.application?.job?.title || 'Unknown Position'}
        departmentName={interview?.application?.job?.department?.name || interview?.department_name}
        interviewDate={interview?.scheduled_at}
        interviewRound={interview?.interview_round || 'First Round'}
        candidateEmail={interview?.application?.candidate?.email}
        recruiterEmail={interview?.application?.job?.creator?.email}
        hiringManagerEmail={interview?.application?.job?.hiring_manager?.email}
        existingFeedback={interview?.feedback_submitted ? {
          technical_score: interview?.technical_score,
          communication_score: interview?.communication_score,
          problem_solving_score: interview?.problem_solving_score,
          leadership_score: interview?.leadership_score,
          cultural_fit_score: interview?.cultural_fit_score,
          overall_score: interview?.overall_score,
          feedback_comments: interview?.feedback_comments,
          feedback_decision: interview?.feedback_decision,
          feedback_submitted: interview?.feedback_submitted,
        } : undefined}
      />
    </div>
  )
}
