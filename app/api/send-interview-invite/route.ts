import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      candidateEmail,
      candidateName,
      interviewerEmail,
      interviewerEmails,
      interviewerName,
      jobTitle,
      interviewDate,
      interviewLocation,
      hiringManagerEmail,
      hiringManagerName,
    } = body

    const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Send email to candidate
    await sendEmail({
      to: candidateEmail,
      subject: `Interview Scheduled - ${jobTitle} at CPECC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Interview Invitation</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <p>Dear ${candidateName},</p>
            <p>We are pleased to inform you that you have been shortlisted for an interview for the position of <strong>${jobTitle}</strong> at China Petroleum Engineering & Construction Corporation (CPECC).</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #d32f2f;">Interview Details</h3>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              ${interviewLocation ? `<p><strong>Location:</strong> ${interviewLocation}</p>` : ''}
              ${interviewerName ? `<p><strong>Interviewer:</strong> ${interviewerName}</p>` : ''}
            </div>
            
            <p>Please confirm your attendance by replying to this email. If you need to reschedule, please let us know at least 24 hours in advance.</p>
            
            <p>We look forward to meeting you!</p>
            
            <p>Best regards,<br>
            <strong>CPECC HR Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>China Petroleum Engineering & Construction Corporation</p>
          </div>
        </div>
      `,
    })

    // Send email to interviewer
    if (interviewerEmail) {
      await sendEmail({
        to: interviewerEmail,
        subject: `Interview Scheduled - ${candidateName} for ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Interview Scheduled</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <p>Dear ${interviewerName || 'Interviewer'},</p>
              <p>An interview has been scheduled for you to interview a candidate.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #d32f2f;">Interview Details</h3>
                <p><strong>Candidate:</strong> ${candidateName}</p>
                <p><strong>Position:</strong> ${jobTitle}</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                ${interviewLocation ? `<p><strong>Location:</strong> ${interviewLocation}</p>` : ''}
              </div>
              
              <p>Please add this to your calendar.</p>
              
              <p>Best regards,<br>
              <strong>CPECC HR Team</strong></p>
            </div>
          </div>
        `,
      })
    }

    // Send email to additional interviewers if provided
    if (interviewerEmails && Array.isArray(interviewerEmails)) {
      for (const email of interviewerEmails) {
        if (email && email !== interviewerEmail) {
          await sendEmail({
            to: email,
            subject: `Interview Scheduled - ${candidateName} for ${jobTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Interview Scheduled</h1>
                </div>
                <div style="padding: 30px; background: #ffffff;">
                  <p>Dear Interviewer,</p>
                  <p>An interview has been scheduled for you to interview a candidate.</p>
                  
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #d32f2f;">Interview Details</h3>
                    <p><strong>Candidate:</strong> ${candidateName}</p>
                    <p><strong>Position:</strong> ${jobTitle}</p>
                    <p><strong>Date & Time:</strong> ${formattedDate}</p>
                    ${interviewLocation ? `<p><strong>Location:</strong> ${interviewLocation}</p>` : ''}
                  </div>
                  
                  <p>Please add this to your calendar.</p>
                  
                  <p>Best regards,<br>
                  <strong>CPECC HR Team</strong></p>
                </div>
              </div>
            `,
          })
        }
      }
    }

    // Send email to hiring manager if provided
    if (hiringManagerEmail) {
      await sendEmail({
        to: hiringManagerEmail,
        subject: `Interview Scheduled - ${candidateName} for ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Interview Scheduled</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <p>Dear ${hiringManagerName || 'Hiring Manager'},</p>
              <p>An interview has been scheduled for a candidate applying to a position you manage.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #d32f2f;">Interview Details</h3>
                <p><strong>Candidate:</strong> ${candidateName}</p>
                <p><strong>Position:</strong> ${jobTitle}</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                ${interviewLocation ? `<p><strong>Location:</strong> ${interviewLocation}</p>` : ''}
              </div>
              
              <p>Please add this to your calendar.</p>
              
              <p>Best regards,<br>
              <strong>CPECC Recruitment System</strong></p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending interview invite:', error)
    return NextResponse.json(
      { error: 'Failed to send interview invite' },
      { status: 500 }
    )
  }
}
