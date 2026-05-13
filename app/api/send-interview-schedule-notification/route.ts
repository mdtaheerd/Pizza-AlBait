import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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

    // Email to candidate
    await resend.emails.send({
      from: 'CPECC Careers <careers@cloudae.org>',
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

    // Email to interviewers
    if (interviewerEmails && interviewerEmails.length > 0) {
      for (const interviewerEmail of interviewerEmails) {
        if (interviewerEmail && interviewerEmail.trim()) {
          await resend.emails.send({
            from: 'CPECC Careers <careers@cloudae.org>',
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
                
                <p>Please review the candidate's profile before the interview and be prepared to provide feedback after.</p>
                
                <p>Best regards,<br>CPECC HR Team</p>
              </div>
            `,
          })
        }
      }
    }

    // Email to hiring manager
    if (hiringManagerEmail) {
      await resend.emails.send({
        from: 'CPECC Careers <careers@cloudae.org>',
        to: hiringManagerEmail,
        subject: `Interview Scheduled: ${candidateName} for ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Interview Scheduled</h2>
            <p>An interview has been scheduled for a candidate applying to your position:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
              <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
              <p style="margin: 0 0 10px 0;"><strong>Interviewer(s):</strong> ${interviewerEmails?.join(', ') || 'N/A'}</p>
              ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            
            <p>You will receive the interviewer's feedback after the interview is completed.</p>
            
            <p>Best regards,<br>CPECC HR Team</p>
          </div>
        `,
      })
    }

    // Email to recruiter
    if (recruiterEmail) {
      await resend.emails.send({
        from: 'CPECC Careers <careers@cloudae.org>',
        to: recruiterEmail,
        subject: `Interview Confirmed: ${candidateName} for ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Interview Confirmed</h2>
            <p>The following interview has been scheduled and all parties have been notified:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName} (${candidateEmail})</p>
              <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
              <p style="margin: 0 0 10px 0;"><strong>Interview Type:</strong> ${interviewTypeLabel}</p>
              <p style="margin: 0 0 10px 0;"><strong>Interviewer(s):</strong> ${interviewerEmails?.join(', ') || 'N/A'}</p>
              ${meetingLink ? `<p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            
            <p style="color: #666; font-size: 12px;">Notifications sent to: Candidate, Interviewer(s)${hiringManagerEmail ? ', Hiring Manager' : ''}</p>
            
            <p>Best regards,<br>CPECC HR Team</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending interview schedule notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
