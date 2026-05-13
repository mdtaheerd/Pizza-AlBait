import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[v0] RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    
    const resend = new Resend(apiKey)
    
    const body = await request.json()
    console.log('[v0] Email request body:', JSON.stringify(body, null, 2))
    
    const { 
      candidateName,
      candidateEmail,
      jobTitle,
      interviewerEmails,
      recruiterEmail,
      hiringManagerEmail,
      scheduledAt,
      duration,
      interviewType,
      meetingLink,
      location
    } = body

    if (!candidateEmail || !scheduledAt) {
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

    const interviewTypeLabels: Record<string, string> = {
      video: 'Video Call',
      phone: 'Phone Interview',
      onsite: 'On-site Interview',
      technical: 'Technical Interview',
      panel: 'Panel Interview'
    }

    const interviewTypeLabel = interviewTypeLabels[interviewType] || interviewType
    
    // Use Resend's default domain for testing, or your verified domain
    const fromEmail = process.env.EMAIL_FROM || 'CPECC Careers <onboarding@resend.dev>'
    const emailResults = []

    // Email to candidate
    try {
      const candidateResult = await resend.emails.send({
        from: fromEmail,
        to: candidateEmail,
        subject: `Interview Scheduled: ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Interview Scheduled</h2>
            <p>Dear ${candidateName},</p>
            <p>We are pleased to inform you that your interview for the position of <strong>${jobTitle}</strong> has been scheduled.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
              <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
              ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            
            <p>Please ensure you are available and prepared for the interview. If you have any questions or need to reschedule, please contact us.</p>
            
            <p>Best regards,<br>CPECC HR Team</p>
          </div>
        `,
      })
      console.log('[v0] Candidate email sent:', candidateResult)
      emailResults.push({ to: candidateEmail, status: 'sent', id: candidateResult.data?.id })
    } catch (err: any) {
      console.error('[v0] Failed to send candidate email:', err)
      emailResults.push({ to: candidateEmail, status: 'failed', error: err.message })
    }

    // Email to interviewers
    if (interviewerEmails && interviewerEmails.length > 0) {
      for (const interviewerEmail of interviewerEmails) {
        if (interviewerEmail && interviewerEmail.trim()) {
          try {
            const result = await resend.emails.send({
              from: fromEmail,
              to: interviewerEmail.trim(),
              subject: `Interview Assigned: ${candidateName} for ${jobTitle}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1a1a1a;">Interview Assignment</h2>
                  <p>You have been assigned to interview a candidate for the following position:</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                    <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
                    ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                    ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
                  </div>
                  
                  <p>Please review the candidate's profile and be prepared for the interview.</p>
                  
                  <p>Best regards,<br>CPECC HR Team</p>
                </div>
              `,
            })
            console.log('[v0] Interviewer email sent:', interviewerEmail, result)
            emailResults.push({ to: interviewerEmail.trim(), status: 'sent', id: result.data?.id })
          } catch (err: any) {
            console.error('[v0] Failed to send interviewer email:', interviewerEmail, err)
            emailResults.push({ to: interviewerEmail.trim(), status: 'failed', error: err.message })
          }
        }
      }
    }

    // Email to hiring manager
    if (hiringManagerEmail && hiringManagerEmail.trim()) {
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: hiringManagerEmail.trim(),
          subject: `Interview Scheduled: ${candidateName} for ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Interview Scheduled</h2>
              <p>An interview has been scheduled for a candidate applying to your team:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
                <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
                ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
              </div>
              
              <p>Best regards,<br>CPECC HR Team</p>
            </div>
          `,
        })
        console.log('[v0] Hiring manager email sent:', result)
        emailResults.push({ to: hiringManagerEmail.trim(), status: 'sent', id: result.data?.id })
      } catch (err: any) {
        console.error('[v0] Failed to send HM email:', err)
        emailResults.push({ to: hiringManagerEmail.trim(), status: 'failed', error: err.message })
      }
    }

    // Email confirmation to recruiter
    if (recruiterEmail && recruiterEmail.trim()) {
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: recruiterEmail.trim(),
          subject: `Interview Confirmation: ${candidateName} for ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Interview Scheduled Successfully</h2>
              <p>This is a confirmation that the following interview has been scheduled:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName} (${candidateEmail})</p>
                <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
                <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
                ${interviewerEmails?.length ? `<p style="margin: 0 0 10px 0;"><strong>Interviewers:</strong> ${interviewerEmails.filter((e: string) => e).join(', ')}</p>` : ''}
                ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
              </div>
              
              <p>All parties have been notified.</p>
              
              <p>Best regards,<br>CPECC ATS System</p>
            </div>
          `,
        })
        console.log('[v0] Recruiter confirmation sent:', result)
        emailResults.push({ to: recruiterEmail.trim(), status: 'sent', id: result.data?.id })
      } catch (err: any) {
        console.error('[v0] Failed to send recruiter email:', err)
        emailResults.push({ to: recruiterEmail.trim(), status: 'failed', error: err.message })
      }
    }

    console.log('[v0] Email results:', emailResults)
    return NextResponse.json({ success: true, results: emailResults })

  } catch (error: any) {
    console.error('[v0] Email API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 })
  }
}
