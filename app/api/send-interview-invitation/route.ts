import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Initialize Resend inside function to avoid build-time errors
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      interviewId,
      candidateName,
      candidateEmail,
      jobTitle,
      scheduledAt,
      meetingLink,
      interviewerEmails,
      notes
    } = body

    if (!interviewId || !candidateEmail || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Send email to candidate
    if (candidateEmail) {
      await resend.emails.send({
        from: 'CPECC Careers <careers@cloudae.org>',
        to: candidateEmail,
        subject: `Interview Scheduled: ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Interview Scheduled</h2>
            <p>Dear ${candidateName},</p>
            <p>Your interview for the position of <strong>${jobTitle}</strong> has been scheduled.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              ${notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p>Please ensure you join the meeting on time. If you have any questions or need to reschedule, please contact us.</p>
            
            <p>Best regards,<br>CPECC HR Team</p>
          </div>
        `,
      })
    }

    // Send emails to interviewers
    if (interviewerEmails && interviewerEmails.length > 0) {
      const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cloudae.org'}/interview-feedback/${interviewId}`
      
      for (const interviewerEmail of interviewerEmails) {
        if (interviewerEmail && interviewerEmail.trim()) {
          await resend.emails.send({
            from: 'CPECC Careers <careers@cloudae.org>',
            to: interviewerEmail.trim(),
            subject: `Interview Scheduled: ${candidateName} for ${jobTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a1a;">Interview Scheduled</h2>
                <p>You have been assigned as an interviewer for the following candidate:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                  ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                  ${notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                </div>
                
                <p>After the interview, please submit your feedback using the link below:</p>
                <p style="margin: 20px 0;">
                  <a href="${feedbackUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Submit Interview Feedback</a>
                </p>
                
                <p>Best regards,<br>CPECC HR Team</p>
              </div>
            `,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending interview invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send interview invitation' },
      { status: 500 }
    )
  }
}
