import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Only allow in development or for admins
  const supabase = await createClient()
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
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  // Check environment variables
  const config = {
    GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'NOT SET',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Using default: cpecchr.auh@gmail.com',
  }

  console.log('[Test Email] Config check:', config)

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({
      success: false,
      message: 'Email credentials not configured',
      config,
    })
  }

  // Try sending a test email
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'cpecchr.auh@gmail.com'
    const result = await sendEmail({
      to: adminEmail,
      subject: 'CPECC - Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email from CPECC.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    })

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send email',
      config,
      result,
    })
  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error',
      config,
    })
  }
}
