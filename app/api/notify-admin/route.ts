import { NextRequest, NextResponse } from 'next/server'
import { sendAdminApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, fullName, role } = body

    if (!userId || !email || !fullName || !role) {
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

    if (!result.success) {
      console.error('[API] Failed to send admin notification:', result.error)
      // Don't fail the registration if email fails
      return NextResponse.json(
        { success: false, message: 'Email notification failed but registration succeeded' },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error in notify-admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
