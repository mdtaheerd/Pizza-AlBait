import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Create admin client inside function to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user exists and their approval status
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, approval_status, role')
      .eq('email', email)
      .single()

    if (fetchError || !profile) {
      // User doesn't exist, normal signup flow
      return NextResponse.json({ 
        exists: false, 
        canReregister: false,
        message: 'User not found' 
      })
    }

    if (profile.approval_status === 'rejected') {
      // Reset status to pending for re-registration using admin client
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          approval_status: 'pending',
          approved_by: null,
          approved_at: null
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('[Reregister] Failed to update status:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update registration status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        exists: true,
        canReregister: true,
        message: 'Registration status reset to pending. Please wait for admin approval.',
        wasRejected: true
      })
    }

    if (profile.approval_status === 'pending') {
      return NextResponse.json({
        exists: true,
        canReregister: false,
        message: 'Your registration is already pending approval.',
        isPending: true
      })
    }

    if (profile.approval_status === 'approved') {
      return NextResponse.json({
        exists: true,
        canReregister: false,
        message: 'You already have an approved account. Please login instead.',
        isApproved: true
      })
    }

    return NextResponse.json({ exists: true, canReregister: false })
  } catch (error) {
    console.error('[Reregister] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
