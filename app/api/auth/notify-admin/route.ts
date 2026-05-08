import { NextRequest, NextResponse } from 'next/server'
import { sendAdminApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, role } = await request.json()

    console.log('[Notify Admin] Received request to notify admin for new user:', email)

    // Only send for non-candidate roles
    if (role === 'candidate') {
      console.log('[Notify Admin] Skipping - user is a candidate')
      return NextResponse.json({ success: true, message: 'Candidates do not require admin approval' })
    }

    const result = await sendAdminApprovalEmail({
      id: userId,
      email,
      full_name: fullName,
      role,
    })

    console.log('[Notify Admin] Email send result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Notify Admin] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
