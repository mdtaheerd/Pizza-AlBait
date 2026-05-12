import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle } = body

    await sendEmail({
      to: candidateEmail,
      subject: `Application Update - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Application Update</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; line-height: 1.6;">
            <p>Dear Applicant,</p>
            
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position with our Company and for taking the time to submit your application.</p>
            
            <p>After careful review of your profile and qualifications, we regret to inform you that you have not been shortlisted for the next stage of the recruitment process for this particular opportunity.</p>
            
            <p>Please note that this decision does not diminish your experience or professional achievements. We will keep your profile in our database and may contact you should a suitable opportunity arise in the future.</p>
            
            <p>We wish you every success in your career endeavors.</p>
            
            <p style="margin-top: 30px;">Best regards,</p>
            <p style="margin-top: 20px;">
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
    console.error('Error sending rejection email:', error)
    // Return success even on error to not block the workflow
    // The rejection status is already updated in the database
    return NextResponse.json({ 
      success: true, 
      warning: 'Email could not be sent but rejection was processed' 
    })
  }
}
