import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkApiAuthorization } from '@/lib/api-security'

export async function POST(request: Request) {
  try {
    // SECURITY: Only admins may create HR/Recruiter accounts.
    // Public self-registration for staff roles is disabled to stop job
    // applicants from registering themselves as Recruiter/HRBP.
    const auth = await checkApiAuthorization(['admin'])
    if (!auth.authorized) {
      return auth.error!
    }

    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only allow recruiter and hiring_manager roles to be created here
    if (!['recruiter', 'hiring_manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Use service role client to create user without email confirmation
    const supabase = createServiceClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, approval_status')
      .eq('email', email)
      .single()

    if (existingUser) {
      if (existingUser.approval_status === 'approved') {
        return NextResponse.json(
          { error: 'This user already has an approved account.', code: 'APPROVED' },
          { status: 400 }
        )
      }
      if (existingUser.approval_status === 'pending' || existingUser.approval_status === 'rejected') {
        // Admin is creating the account, so approve immediately
        await supabase
          .from('profiles')
          .update({ 
            approval_status: 'approved',
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id)
        
        return NextResponse.json({ 
          success: true, 
          message: 'User account activated and approved.',
          reregistered: true 
        })
      }
    }

    // Create user with admin API - email_confirm: true means user is auto-confirmed (no email needed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no verification email sent
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    })

    if (authError) {
      // Handle specific error for existing auth user
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please login or use a different email.' },
          { status: 400 }
        )
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Create profile - admin-created accounts are auto-approved
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // Notify admin about new registration
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/notify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email,
          fullName,
          role,
        }),
      })
    } catch (notifyError) {
      // Don't block signup if notification fails
      console.error('Failed to notify admin:', notifyError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User account created and approved.' 
    })

  } catch (error) {
    console.error('Admin signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
