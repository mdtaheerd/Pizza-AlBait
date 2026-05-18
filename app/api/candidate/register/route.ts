import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      fullName, 
      phone,
      nationality,
      currentLocation,
      noticePeriodDays,
      expectedSalary,
      currentSalary
    } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role client to create user without email confirmation
    const supabase = createServiceClient()

    // Check if user already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      )
    }

    // Check if candidate already exists
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'A candidate profile with this email already exists. Please login instead.' },
        { status: 400 }
      )
    }

    // Create user with admin API - email_confirm: true means user is auto-confirmed (no email needed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no verification email sent
      user_metadata: {
        full_name: fullName,
        role: 'candidate',
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

    // Create profile (auto-approved for candidates)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'candidate',
        approval_status: 'approved', // Candidates are auto-approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // Note: Candidate record will be created by the client with full form data
    // This API only handles auth user and profile creation

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! You can now login.',
      userId: authData.user.id
    })

  } catch (error) {
    console.error('Candidate registration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
