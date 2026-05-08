import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendAdminApprovalEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Processing callback, code exists:', !!code)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('[Auth Callback] Session exchange result:', { 
      hasUser: !!data?.user, 
      error: error?.message 
    })
    
    if (!error && data.user) {
      // Check if this is a new user who needs approval
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, approval_status, created_at')
        .eq('id', data.user.id)
        .single()

      console.log('[Auth Callback] Profile lookup:', { 
        hasProfile: !!profile, 
        role: profile?.role, 
        approvalStatus: profile?.approval_status,
        error: profileError?.message 
      })

      // Send admin approval email for new non-candidate users who are pending
      if (profile && profile.role !== 'candidate' && profile.approval_status === 'pending') {
        // Check if this is a recent registration (within last 5 minutes)
        const createdAt = new Date(profile.created_at)
        const now = new Date()
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
        
        console.log('[Auth Callback] Checking if new registration:', {
          createdAt: createdAt.toISOString(),
          isRecent: createdAt > fiveMinutesAgo
        })
        
        if (createdAt > fiveMinutesAgo) {
          console.log('[Auth Callback] Sending admin approval email for new user:', profile.email)
          const emailResult = await sendAdminApprovalEmail({
            id: profile.id,
            email: profile.email || data.user.email || '',
            full_name: profile.full_name || 'Unknown',
            role: profile.role,
          })
          console.log('[Auth Callback] Email send result:', emailResult)
        }
      }

      // Redirect based on role and approval status
      if (profile?.role === 'candidate') {
        console.log('[Auth Callback] Redirecting candidate to candidate dashboard')
        return NextResponse.redirect(`${origin}/candidate/dashboard`)
      } else if (profile?.approval_status === 'pending') {
        console.log('[Auth Callback] Redirecting pending user to pending-approval page')
        return NextResponse.redirect(`${origin}/auth/pending-approval`)
      }
      
      console.log('[Auth Callback] Redirecting approved user to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log('[Auth Callback] Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/error`)
}
