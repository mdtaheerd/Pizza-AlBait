import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'

// Lazy initialization to avoid build-time errors
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: Request) {
  const resend = getResend()
  try {
    const body = await request.json()
    const {
      candidateEmail,
      candidateName,
      interviewerEmail,
      interviewerName,
      hiringManagerEmail,
      hiringManagerName,
      jobTitle,
      newDate,
      newLocation,
      reason,
    } = body

    if (!candidateEmail) {
      return NextResponse.json({ error: 'Candidate email is required' }, { status: 400 })
    }

    const formattedDate = format(new Date(newDate), 'EEEE, MMMM d, yyyy')
    const formattedTime = format(new Date(newDate), 'h:mm a')

    const emailPromises = []

    // Email template header
    const emailHeader = `
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center;">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png" alt="CPECC" style="height: 60px; margin-bottom: 15px;" />
        <h1 style="color: white; margin: 0; font-size: 24px;">Interview Rescheduled</h1>
      </div>
    `

    const emailFooter = `
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">
          &copy; ${new Date().getFullYear()} CPECC - China Petroleum Engineering & Construction Corporation. All rights reserved.
        </p>
      </div>
    `

    // Send email to candidate
    emailPromises.push(
      resend.emails.send({
        from: 'CPECC Careers <notifications@cloudae.org>',
        to: candidateEmail,
        subject: `Interview Rescheduled - ${jobTitle} | CPECC`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 30px; background: #f8fafc;">
              <p style="font-size: 16px; color: #334155;">Dear ${candidateName},</p>
              <p style="font-size: 16px; color: #334155;">
                Your interview for the <strong>${jobTitle}</strong> position at CPECC has been rescheduled.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 15px 0; color: #dc2626;">New Interview Details</h3>
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
                <strong>CPECC Recruitment Team</strong>
              </p>
            </div>
            ${emailFooter}
          </div>
        `,
      })
    )

    // Send email to interviewer if available
    if (interviewerEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'CPECC Careers <notifications@cloudae.org>',
          to: interviewerEmail,
          subject: `Interview Rescheduled - ${candidateName} for ${jobTitle} | CPECC`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${emailHeader}
              <div style="padding: 30px; background: #f8fafc;">
                <p style="font-size: 16px; color: #334155;">Dear ${interviewerName || 'Interviewer'},</p>
                <p style="font-size: 16px; color: #334155;">
                  The interview with <strong>${candidateName}</strong> for the <strong>${jobTitle}</strong> position has been rescheduled.
                </p>
                
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3 style="margin: 0 0 15px 0; color: #dc2626;">New Interview Details</h3>
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
                  <strong>CPECC Recruitment Team</strong>
                </p>
              </div>
              ${emailFooter}
            </div>
          `,
        })
      )
    }

    // Send email to hiring manager if available
    if (hiringManagerEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'CPECC Careers <notifications@cloudae.org>',
          to: hiringManagerEmail,
          subject: `Interview Rescheduled - ${candidateName} for ${jobTitle} | CPECC`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${emailHeader}
              <div style="padding: 30px; background: #f8fafc;">
                <p style="font-size: 16px; color: #334155;">Dear ${hiringManagerName || 'Hiring Manager'},</p>
                <p style="font-size: 16px; color: #334155;">
                  An interview has been rescheduled for a candidate applying to your open position.
                </p>
                
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3 style="margin: 0 0 15px 0; color: #dc2626;">Rescheduled Interview Details</h3>
                  <p style="margin: 5px 0; color: #334155;"><strong>Candidate:</strong> ${candidateName}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>Position:</strong> ${jobTitle}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>New Date:</strong> ${formattedDate}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>New Time:</strong> ${formattedTime}</p>
                  ${newLocation ? `<p style="margin: 5px 0; color: #334155;"><strong>Location:</strong> ${newLocation}</p>` : ''}
                  ${interviewerName ? `<p style="margin: 5px 0; color: #334155;"><strong>Interviewer:</strong> ${interviewerName}</p>` : ''}
                  ${reason ? `<p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px;"><strong>Reason for Rescheduling:</strong> ${reason}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #334155;">
                  This is an automated notification. No action is required unless you need to make further changes.
                </p>
                
                <p style="font-size: 16px; color: #334155; margin-top: 30px;">
                  Best regards,<br>
                  <strong>CPECC Recruitment Team</strong>
                </p>
              </div>
              ${emailFooter}
            </div>
          `,
        })
      )
    }

    await Promise.all(emailPromises)

    return NextResponse.json({ 
      success: true,
      notified: {
        candidate: !!candidateEmail,
        interviewer: !!interviewerEmail,
        hiringManager: !!hiringManagerEmail,
      }
    })
  } catch (error) {
    console.error('Failed to send reschedule notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
