import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Direct (email-free) password reset for staff accounts.
 *
 * The user provides their account email and a new password, and the password
 * is updated immediately without any email confirmation link. This exists
 * because email delivery is unreliable for this deployment and staff need a
 * quick self-service way to regain access.
 *
 * Security: limited to staff roles (recruiter, hiring_manager, admin). Candidate
 * accounts cannot be reset through this endpoint.
 */
export async function POST(request: NextRequest) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Look up the profile by email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, approval_status')
      .ilike('email', normalizedEmail)
      .single()

    if (!profile) {
      // Generic message - do not reveal whether the account exists
      return NextResponse.json(
        { error: 'No staff account found with that email address.' },
        { status: 404 }
      )
    }

    // Only staff accounts may use direct reset
    if (!['recruiter', 'hiring_manager', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'No staff account found with that email address.' },
        { status: 404 }
      )
    }

    // Block reset for rejected/revoked accounts
    if (profile.approval_status === 'rejected') {
      return NextResponse.json(
        { error: 'This account is not active. Please contact your administrator.' },
        { status: 403 }
      )
    }

    // Update the password directly
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('[SECURITY] Direct password reset failed:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been updated. You can now sign in.',
    })
  } catch (error) {
    console.error('[SECURITY] Direct password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
