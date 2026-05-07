import { NextRequest, NextResponse } from 'next/server'
import { sendAdminApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  console.log('[v0] notify-admin API called')
  
  try {
    const body = await request.json()
    const { userId, email, fullName, role } = body

    console.log('[v0] notify-admin received:', { userId, email, fullName, role })
    console.log('[v0] Environment check:', {
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailAppPassword: !!process.env.GMAIL_APP_PASSWORD,
      adminEmail: process.env.ADMIN_EMAIL
    })

    if (!userId || !email || !fullName || !role) {
      console.log('[v0] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email to admin
    const result = await sendAdminApprovalEmail({
      id: userId,
      email,
      full_name: fullName,
      role,
    })

    console.log('[v0] sendAdminApprovalEmail result:', JSON.stringify(result))

    if (!result.success) {
      console.error('[v0] Failed to send admin notification:', JSON.stringify(result.error))
      // Don't fail the registration if email fails
      return NextResponse.json(
        { success: false, message: 'Email notification failed but registration succeeded', error: result.error },
        { status: 200 }
      )
    }

    console.log('[v0] Email sent successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in notify-admin:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}
