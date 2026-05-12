import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    // Initialize Resend inside function to avoid build-time errors
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const body = await request.json()
    const {
      candidateName,
      candidateEmail,
      jobTitle,
      recruiterEmail,
      hiringManagerEmail,
      decision,
      overallScore,
      comments,
      submittedBy,
    } = body

    const decisionLabels = {
      hire: 'HIRE',
      reject: 'REJECT', 
      hold: 'HOLD',
    }

    const decisionColors = {
      hire: '#16a34a',
      reject: '#dc2626',
      hold: '#d97706',
    }

    const recipients = [recruiterEmail, hiringManagerEmail].filter(Boolean) as string[]

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients to notify' })
    }

    const scoreStars = '★'.repeat(overallScore) + '☆'.repeat(5 - overallScore)

    await resend.emails.send({
      from: 'CPECC Careers <careers@cpecc.ae>',
      to: recipients,
      subject: `Interview Feedback: ${candidateName} - ${jobTitle} - ${decisionLabels[decision as keyof typeof decisionLabels]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Interview Feedback Submitted</h1>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: ${decisionColors[decision as keyof typeof decisionColors]}15; border-left: 4px solid ${decisionColors[decision as keyof typeof decisionColors]}; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: ${decisionColors[decision as keyof typeof decisionColors]};">
                Decision: ${decisionLabels[decision as keyof typeof decisionLabels]}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; width: 140px; color: #6b7280;">Candidate:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${candidateName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Position:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Overall Score:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #f59e0b; font-size: 18px;">${scoreStars}</span>
                  <span style="color: #6b7280; margin-left: 8px;">(${overallScore}/5)</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Submitted By:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${submittedBy}</td>
              </tr>
            </table>

            ${comments ? `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-weight: 500; color: #374151;">Interviewer Comments:</p>
                <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${comments}</p>
              </div>
            ` : ''}

            <div style="text-align: center; padding-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cloudae.org'}/dashboard/interviews" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">CPECC - China Petroleum Engineering & Construction Corporation</p>
            <p style="margin: 4px 0 0 0;">This is an automated notification from the recruitment system.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error sending feedback notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
