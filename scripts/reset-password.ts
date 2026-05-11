import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function resetPassword(email: string) {
  console.log(`Sending password reset email to ${email}...`)
  
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://pizza-al-bait.vercel.app/auth/reset-password',
  })

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Password reset email sent to ${email}`)
}

const email = process.argv[2] || 'imtiaz.ahmad@cpecc.ae'
resetPassword(email)
