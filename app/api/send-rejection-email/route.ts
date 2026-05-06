import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle } = body

    await sendEmail({
      to: candidateEmail,
      subject: `Application Update - ${jobTitle} at CPECC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Application Update</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <p>Dear ${candidateName},</p>
            
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at China Petroleum Engineering & Construction Corporation (CPECC) and for taking the time to apply.</p>
            
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
            
            <p>We encourage you to continue exploring opportunities with CPECC. We will keep your resume on file for future openings that may be a better fit for your skills and experience.</p>
            
            <p>We wish you all the best in your career endeavors.</p>
            
            <p>Best regards,<br>
            <strong>CPECC HR Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>China Petroleum Engineering & Construction Corporation</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending rejection email:', error)
    return NextResponse.json(
      { error: 'Failed to send rejection email' },
      { status: 500 }
    )
  }
}
