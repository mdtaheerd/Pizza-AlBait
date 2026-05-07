import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
let initialized = false

function initSendGrid() {
  if (!initialized) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set')
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    initialized = true
  }
}

// Hardcoded to match verified sender email
const getAdminEmail = () => 'mdtaheerd@gmail.com'
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@cpecc-recruitment.com'
const FROM_NAME = 'CPECC Recruitment'
const getAppUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'https://pizza-al-bait.vercel.app'

// Generic email sender for workflow emails
export async function sendEmail({ 
  to, 
  subject, 
  html 
}: { 
  to: string
  subject: string
  html: string 
}) {
  try {
    initSendGrid()
    
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      html,
    }

    await sgMail.send(msg)
    console.log('[Email] Email sent successfully to:', to)
    return { success: true }
  } catch (error: unknown) {
    console.error('[Email] Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendAdminApprovalEmail(user: {
  id: string
  email: string
  full_name: string
  role: string
}) {
  try {
    initSendGrid()
    const ADMIN_EMAIL = getAdminEmail()
    const APP_URL = getAppUrl()
    const approvalUrl = `${APP_URL}/dashboard/users?approve=${user.id}`
    
    console.log('[v0] sendAdminApprovalEmail called with:', { 
      userId: user.id, 
      userEmail: user.email, 
      userName: user.full_name,
      role: user.role,
      adminEmail: ADMIN_EMAIL,
      fromEmail: FROM_EMAIL,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY
    })
    
    const msg = {
      to: ADMIN_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `New Registration Pending Approval: ${user.full_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Registration Pending Approval</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Registration Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new user has registered and is awaiting your approval:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${user.full_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #6b7280;">Role:</td>
                  <td style="padding: 10px 0; text-transform: capitalize;">${user.role.replace('_', ' ')}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center;">
              <a href="${approvalUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review & Approve
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
              You can also manage user approvals from the <a href="${APP_URL}/dashboard/users" style="color: #dc2626;">User Management</a> section.
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated email from CPECC Recruitment System
          </p>
        </body>
        </html>
      `,
    }

    await sgMail.send(msg)
    console.log('[v0] Admin approval email sent successfully')
    return { success: true }
  } catch (error: unknown) {
    console.error('[v0] Failed to send admin approval email:', error)
    return { success: false, error }
  }
}

export async function sendApprovalConfirmationEmail(user: {
  email: string
  full_name: string
}) {
  try {
    initSendGrid()
    const APP_URL = getAppUrl()
    const loginUrl = `${APP_URL}/auth/login`
    
    const msg = {
      to: user.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: 'Your Registration Has Been Approved - CPECC Recruitment',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Registration Approved!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${user.full_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your registration has been approved by the administrator. You now have full access to the CPECC Recruitment System.
            </p>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 20px;">
              <p style="margin: 0; color: #166534; font-weight: 500;">
                ✓ Your account is now active and ready to use
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Login to Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you have any questions, please contact your system administrator.
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated email from CPECC Recruitment System
          </p>
        </body>
        </html>
      `,
    }

    await sgMail.send(msg)
    console.log('[Email] Approval confirmation email sent successfully')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Email] Failed to send approval confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendRejectionEmail(user: {
  email: string
  full_name: string
  reason?: string
}) {
  try {
    initSendGrid()
    
    const msg = {
      to: user.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: 'Registration Update - CPECC Recruitment',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Update</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Registration Update</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${user.full_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in joining the CPECC Recruitment System. Unfortunately, your registration request could not be approved at this time.
            </p>
            
            ${user.reason ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fcd34d; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">
                Reason: ${user.reason}
              </p>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you believe this is an error or have questions, please contact your HR department or system administrator.
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated email from CPECC Recruitment System
          </p>
        </body>
        </html>
      `,
    }

    await sgMail.send(msg)
    console.log('[Email] Rejection email sent successfully')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Email] Failed to send rejection email:', error)
    return { success: false, error }
  }
}
