import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, departmentId } = await request.json()

    // Validate inputs
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only allow recruiter and hiring_manager roles
    if (!['recruiter', 'hiring_manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check user limit (max 25 recruiters + hiring managers)
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['recruiter', 'hiring_manager'])
      .eq('approval_status', 'approved')

    if (count && count >= 25) {
      return NextResponse.json(
        { error: 'Maximum user limit reached (25 recruiters/hiring managers)' },
        { status: 400 }
      )
    }

    // Create user with admin API (no email confirmation needed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role,
      }
    })

    if (authError) {
      console.error('[v0] Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create profile (pending approval)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        department_id: departmentId || null,
        approval_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('[v0] Profile error:', profileError)
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Awaiting admin approval.',
      userId: authData.user.id
    })

  } catch (error) {
    console.error('[v0] Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
