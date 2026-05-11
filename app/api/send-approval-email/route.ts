import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalConfirmationEmail, sendRejectionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user details
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Send appropriate email
    let result
    if (action === 'approve') {
      result = await sendApprovalConfirmationEmail({
        email: targetUser.email,
        full_name: targetUser.full_name || 'User',
      })
    } else if (action === 'reject') {
      result = await sendRejectionEmail({
        email: targetUser.email,
        full_name: targetUser.full_name || 'User',
        reason,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (!result.success) {
      console.error('[API] Failed to send email:', result.error)
      return NextResponse.json(
        { success: false, message: 'Email sending failed' },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error in send-approval-email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
