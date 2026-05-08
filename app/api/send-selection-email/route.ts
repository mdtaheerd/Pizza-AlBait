import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle } = body

    await sendEmail({
      to: candidateEmail,
      subject: `Congratulations! You've Been Selected - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Congratulations!</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <p>Dear ${candidateName},</p>
            
            <p>We are delighted to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle}</strong>!</p>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="margin: 0; font-size: 18px; color: #2e7d32;">
                Your interview was successful and we would like to proceed with the hiring process.
              </p>
            </div>
            
            <p>Our HR team will be in touch shortly with further details regarding:</p>
            <ul>
              <li>Offer letter and employment terms</li>
              <li>Required documentation</li>
              <li>Proposed start date</li>
            </ul>
            
            <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
            
            <p>We look forward to welcoming you to the team!</p>
            
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
    console.error('Error sending selection email:', error)
    return NextResponse.json(
      { error: 'Failed to send selection email' },
      { status: 500 }
    )
  }
}
