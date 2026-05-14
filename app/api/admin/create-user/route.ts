import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, role } = await request.json()
    
    // Validate input
    if (!email || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate role
    const validRoles = ['recruiter', 'hiring_manager']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    
    // Verify the requester is an admin
    const supabase = createServiceClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()
    
    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }
    
    // Create user with temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        role
      }
    })
    
    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }
    
    // Update profile to approved status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        role,
        approval_status: 'approved'
      })
      .eq('id', newUser.user.id)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
    }
    
    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email
    })
    
    if (resetError) {
      console.error('Error sending reset email:', resetError)
    }
    
    // Also try to send via the regular API
    await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudae.org'}/auth/reset-password`
    })
    
    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.user.id, email, full_name, role }
    })
    
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 })
  }
}
