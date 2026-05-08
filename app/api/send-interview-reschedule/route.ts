import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      candidateEmail,
      candidateName,
      interviewerEmail,
      interviewerName,
      jobTitle,
      newInterviewDate,
      newLocation,
      reason,
    } = body

    if (!candidateEmail) {
      return NextResponse.json({ error: 'Candidate email is required' }, { status: 400 })
    }

    const formattedDate = format(new Date(newInterviewDate), 'EEEE, MMMM d, yyyy')
    const formattedTime = format(new Date(newInterviewDate), 'h:mm a')

    const emailPromises = []

    // Send email to candidate
    emailPromises.push(
      resend.emails.send({
        from: 'TalentTrack ATS <notifications@cloudae.org>',
        to: candidateEmail,
        subject: `Interview Rescheduled - ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Interview Rescheduled</h1>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <p style="font-size: 16px; color: #334155;">Dear ${candidateName},</p>
              <p style="font-size: 16px; color: #334155;">
                Your interview for the <strong>${jobTitle}</strong> position has been rescheduled.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 15px 0; color: #0369a1;">New Interview Details</h3>
                <p style="margin: 5px 0; color: #334155;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; color: #334155;"><strong>Time:</strong> ${formattedTime}</p>
                ${newLocation ? `<p style="margin: 5px 0; color: #334155;"><strong>Location:</strong> ${newLocation}</p>` : ''}
                ${reason ? `<p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <p style="font-size: 16px; color: #334155;">
                Please make note of the new date and time. If you have any questions or need to request another change, 
                please contact us as soon as possible.
              </p>
              
              <p style="font-size: 16px; color: #334155; margin-top: 30px;">
                Best regards,<br>
                <strong>TalentTrack ATS Team</strong>
              </p>
            </div>
            <div style="background: #1e293b; padding: 20px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                &copy; ${new Date().getFullYear()} TalentTrack ATS. All rights reserved.
              </p>
            </div>
          </div>
        `,
      })
    )

    // Send email to interviewer if available
    if (interviewerEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'TalentTrack ATS <notifications@cloudae.org>',
          to: interviewerEmail,
          subject: `Interview Rescheduled - ${candidateName} for ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Interview Rescheduled</h1>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                <p style="font-size: 16px; color: #334155;">Dear ${interviewerName || 'Interviewer'},</p>
                <p style="font-size: 16px; color: #334155;">
                  The interview with <strong>${candidateName}</strong> for the <strong>${jobTitle}</strong> position has been rescheduled.
                </p>
                
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                  <h3 style="margin: 0 0 15px 0; color: #0369a1;">New Interview Details</h3>
                  <p style="margin: 5px 0; color: #334155;"><strong>Candidate:</strong> ${candidateName}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>Position:</strong> ${jobTitle}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>Time:</strong> ${formattedTime}</p>
                  ${newLocation ? `<p style="margin: 5px 0; color: #334155;"><strong>Location:</strong> ${newLocation}</p>` : ''}
                  ${reason ? `<p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #334155;">
                  Please update your calendar accordingly.
                </p>
                
                <p style="font-size: 16px; color: #334155; margin-top: 30px;">
                  Best regards,<br>
                  <strong>TalentTrack ATS Team</strong>
                </p>
              </div>
              <div style="background: #1e293b; padding: 20px; text-align: center;">
                <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                  &copy; ${new Date().getFullYear()} TalentTrack ATS. All rights reserved.
                </p>
              </div>
            </div>
          `,
        })
      )
    }

    await Promise.all(emailPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send reschedule notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
