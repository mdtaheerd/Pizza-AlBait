import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle } = body

    const name = candidateName || 'Applicant'

    await sendEmail({
      to: candidateEmail,
      subject: `Congratulations! Job Offer - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e5631 0%, #0d3320 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CPECC Abu Dhabi Branch</h1>
            <p style="color: #a8d5ba; margin: 10px 0 0 0; font-size: 14px;">Careers Portal</p>
          </div>
          <div style="padding: 30px; background: #ffffff; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px;">🎉</span>
            </div>
            
            <p>Dear ${name},</p>
            
            <p>We are delighted to inform you that after careful consideration, you have been <strong>selected for the position of ${jobTitle}</strong> at CPECC Abu Dhabi Branch.</p>
            
            <p>Your qualifications, experience, and performance throughout our recruitment process have impressed our team, and we believe you will be a valuable addition to our organization.</p>
            
            <div style="background: #f0f9f4; border-left: 4px solid #1e5631; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Next Steps:</p>
              <p style="margin: 10px 0 0 0;">Our HR team will be in contact with you shortly to discuss the offer details, including compensation, benefits, and start date. Please keep your phone and email accessible.</p>
            </div>
            
            <p>We look forward to welcoming you to the CPECC Abu Dhabi Branch team!</p>
            
            <p style="margin-top: 30px;">Congratulations and best regards,</p>
            <p style="margin-top: 10px;">
              <strong>HR Team</strong><br/>
              CPECC Abu Dhabi Branch
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated message from CPECC Abu Dhabi Branch Careers Portal</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending offer notification:', error)
    return NextResponse.json({ 
      success: true, 
      warning: 'Email could not be sent but status was updated' 
    })
  }
}
