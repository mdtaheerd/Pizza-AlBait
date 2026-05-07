import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      candidateEmail, 
      candidateName, 
      jobTitle, 
      interviewDate, 
      interviewTime,
      interviewLocation,
      interviewerEmails,
      isRescheduled = false
    } = body

    const subject = isRescheduled 
      ? `Interview Rescheduled - ${jobTitle} at CPECC`
      : `Interview Scheduled - ${jobTitle} at CPECC`

    const headerText = isRescheduled 
      ? 'Interview Rescheduled'
      : 'Interview Invitation'

    const introText = isRescheduled
      ? `We would like to inform you that your interview for the <strong>${jobTitle}</strong> position has been rescheduled.`
      : `We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position at China Petroleum Engineering & Construction Corporation (CPECC).`

    // Check if location is a URL
    const isUrl = interviewLocation?.startsWith('http://') || interviewLocation?.startsWith('https://')
    const locationHtml = isUrl 
      ? `<a href="${interviewLocation}" style="color: #c41e3a; text-decoration: underline;">Join Meeting</a>`
      : (interviewLocation || 'To be confirmed')

    await sendEmail({
      to: candidateEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">${headerText}</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; line-height: 1.6;">
            <p>Dear ${candidateName},</p>
            
            <p>${introText}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Interview Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Position:</strong></td>
                  <td style="padding: 8px 0;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0;">${interviewDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
                  <td style="padding: 8px 0;">${interviewTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Location:</strong></td>
                  <td style="padding: 8px 0;">${locationHtml}</td>
                </tr>
              </table>
            </div>
            
            <p>Please confirm your attendance by replying to this email. If you need to reschedule, kindly let us know at your earliest convenience.</p>
            
            <p>We look forward to meeting you.</p>
            
            <p style="margin-top: 30px;">Best regards,</p>
            <p>
              <strong>CPECC HR Team</strong><br>
              China Petroleum Engineering & Construction Corporation
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">China Petroleum Engineering & Construction Corporation</p>
            <p style="margin: 5px 0 0 0;">Gulf Region</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending interview notification:', error)
    return NextResponse.json(
      { error: 'Failed to send interview notification' },
      { status: 500 }
    )
  }
}
