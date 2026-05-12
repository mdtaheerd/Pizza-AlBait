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
      departmentName,
      recruiterEmail,
      hiringManagerEmail,
      recommendation,
      overallScore,
      comments,
      submittedBy,
      interviewRound,
    } = body

    // Map recommendation values to display labels
    const recommendationLabels: Record<string, string> = {
      strongly_recommended: 'STRONGLY RECOMMENDED TO HIRE',
      recommended_with_reservations: 'RECOMMENDED WITH RESERVATIONS',
      not_recommended: 'NOT RECOMMENDED',
      rejected: 'REJECTED',
      // Legacy values for backwards compatibility
      hire: 'HIRE',
      reject: 'REJECT', 
      hold: 'HOLD',
    }

    const recommendationColors: Record<string, string> = {
      strongly_recommended: '#16a34a',
      recommended_with_reservations: '#d97706',
      not_recommended: '#ea580c',
      rejected: '#dc2626',
      // Legacy values
      hire: '#16a34a',
      reject: '#dc2626',
      hold: '#d97706',
    }

    const recipients = [recruiterEmail, hiringManagerEmail].filter(Boolean) as string[]

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients to notify' })
    }

    const scoreStars = '★'.repeat(overallScore) + '☆'.repeat(5 - overallScore)
    const recLabel = recommendationLabels[recommendation] || recommendation?.toUpperCase() || 'PENDING'
    const recColor = recommendationColors[recommendation] || '#6b7280'
    
    // Determine action required message based on recommendation
    let actionMessage = ''
    if (recommendation === 'strongly_recommended') {
      actionMessage = `
        <div style="background: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #166534; font-weight: 600;">
            <strong>Action Required:</strong> Candidate is strongly recommended for hire. 
            Please proceed with the offer process.
          </p>
        </div>
      `
    } else if (recommendation === 'rejected') {
      actionMessage = `
        <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 600;">
            <strong>Action Required:</strong> Candidate has been rejected. 
            Please update the candidate status and send rejection notification if applicable.
          </p>
        </div>
      `
    } else if (recommendation === 'recommended_with_reservations') {
      actionMessage = `
        <div style="background: #fffbeb; border: 1px solid #d97706; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            <strong>Action Required:</strong> Candidate is recommended with reservations. 
            Please review the feedback and decide on next steps (additional interview, assessment, or proceed with offer).
          </p>
        </div>
      `
    } else if (recommendation === 'not_recommended') {
      actionMessage = `
        <div style="background: #fff7ed; border: 1px solid #ea580c; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #c2410c; font-weight: 600;">
            <strong>Action Required:</strong> Candidate is not recommended for this position. 
            Please review the feedback and decide whether to reject or keep for future opportunities.
          </p>
        </div>
      `
    }

    await resend.emails.send({
      from: 'CPECC Abu Dhabi Branch <careers@cloudae.org>',
      to: recipients,
      subject: `Interview Feedback: ${candidateName} - ${jobTitle} - ${recLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Interview Feedback Submitted</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">CPECC Abu Dhabi Branch</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: ${recColor}15; border-left: 4px solid ${recColor}; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: ${recColor}; font-size: 16px;">
                Recommendation: ${recLabel}
              </p>
            </div>

            ${actionMessage}

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; width: 160px; color: #6b7280;">Candidate:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${candidateName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Position:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${jobTitle}</td>
              </tr>
              ${departmentName ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Department:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${departmentName}</td>
              </tr>
              ` : ''}
              ${interviewRound ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Interview Round:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${interviewRound}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Overall Score:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #f59e0b; font-size: 18px;">${scoreStars}</span>
                  <span style="color: #6b7280; margin-left: 8px;">(${overallScore}/5)</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Submitted By:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${submittedBy}</td>
              </tr>
            </table>

            ${comments ? `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-weight: 500; color: #374151;">Interviewer Comments:</p>
                <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${comments}</p>
              </div>
            ` : ''}

            <div style="text-align: center; padding-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cloudae.org'}/dashboard/pipeline" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Process Candidate in Pipeline
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">CPECC Abu Dhabi Branch - China Petroleum Engineering & Construction Corporation</p>
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
