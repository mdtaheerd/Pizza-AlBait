import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

type RejectionReason = 'screening' | 'interview' | 'noshow' | 'general'

function getEmailContent(reason: RejectionReason, candidateName: string, jobTitle: string): { subject: string; body: string } {
  const name = candidateName || 'Applicant'
  
  switch (reason) {
    case 'screening':
      return {
        subject: `Application Update - ${jobTitle}`,
        body: `
          <p>Dear ${name},</p>
          
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position with CPECC and for taking the time to submit your application.</p>
          
          <p>After careful review of your profile and qualifications during our initial screening process, we regret to inform you that you have not been shortlisted for the next stage of the recruitment process for this particular opportunity.</p>
          
          <p>Please note that this decision does not diminish your experience or professional achievements. We will keep your profile in our database and may contact you should a suitable opportunity arise in the future.</p>
          
          <p>We wish you every success in your career endeavors.</p>
        `
      }
    
    case 'interview':
      return {
        subject: `Interview Outcome - ${jobTitle}`,
        body: `
          <p>Dear ${name},</p>
          
          <p>Thank you for attending the interview for the <strong>${jobTitle}</strong> position with CPECC. We appreciate the time and effort you invested in the interview process.</p>
          
          <p>After careful consideration of all candidates, we regret to inform you that we have decided to proceed with another candidate whose qualifications more closely match our current requirements.</p>
          
          <p>This was a difficult decision, and we want you to know that your interview performance was valued. We encourage you to apply for future positions that match your skills and experience.</p>
          
          <p>We will keep your profile in our database and may contact you should a suitable opportunity arise in the future.</p>
          
          <p>We wish you all the best in your career journey.</p>
        `
      }
    
    case 'noshow':
      return {
        subject: `Regarding Your Scheduled Interview - ${jobTitle}`,
        body: `
          <p>Dear ${name},</p>
          
          <p>We recently scheduled an interview with you for the <strong>${jobTitle}</strong> position at CPECC. Unfortunately, we did not receive your attendance for the scheduled interview, and we were unable to reach you.</p>
          
          <p>As a result, we regret to inform you that your application has been closed for this position.</p>
          
          <p>If there were extenuating circumstances that prevented you from attending or contacting us, please reach out to our HR team, and we may consider rescheduling based on availability.</p>
          
          <p>We wish you the best in your future endeavors.</p>
        `
      }
    
    default:
      return {
        subject: `Application Update - ${jobTitle}`,
        body: `
          <p>Dear ${name},</p>
          
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position with CPECC and for taking the time to submit your application.</p>
          
          <p>After careful review, we regret to inform you that you have not been shortlisted for the next stage of the recruitment process for this particular opportunity.</p>
          
          <p>Please note that this decision does not diminish your experience or professional achievements. We will keep your profile in our database and may contact you should a suitable opportunity arise in the future.</p>
          
          <p>We wish you every success in your career endeavors.</p>
        `
      }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { candidateEmail, candidateName, jobTitle, rejectionReason = 'general' } = body

    const { subject, body: emailBody } = getEmailContent(rejectionReason as RejectionReason, candidateName, jobTitle)

    await sendEmail({
      to: candidateEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1f33 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CPECC Careers</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; line-height: 1.6;">
            ${emailBody}
            
            <p style="margin-top: 30px;">Best regards,</p>
            <p style="margin-top: 10px;">
              <strong>HR Team</strong><br/>
              CPECC
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated message from CPECC Careers Portal</p>
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
