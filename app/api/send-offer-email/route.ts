import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle } = body

    await sendEmail({
      to: candidateEmail,
      subject: `Job Offer - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Job Offer</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <p>Dear ${candidateName},</p>
            
            <p>We are pleased to extend a formal offer of employment for the position of <strong>${jobTitle}</strong>.</p>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f57c00;">
              <p style="margin: 0; font-size: 16px;">
                Please review the attached offer letter carefully. If you have any questions regarding the terms and conditions, please don't hesitate to contact our HR department.
              </p>
            </div>
            
            <p>To accept this offer, please:</p>
            <ol>
              <li>Review all terms and conditions</li>
              <li>Sign the offer letter</li>
              <li>Return the signed documents within 7 business days</li>
            </ol>
            
            <p>We are excited about the possibility of you joining our team!</p>
            
            <p>Best regards,<br>
            <strong>HR Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>Sent via TalentTrack ATS</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending offer email:', error)
    return NextResponse.json(
      { error: 'Failed to send offer email' },
      { status: 500 }
    )
  }
}
