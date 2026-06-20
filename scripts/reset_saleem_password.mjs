import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

const EMAIL = 'mohammed.asrari@cpecc.ae'
const TEMP_PASSWORD = 'Cpecc@Saleem2026'

// Find the auth user by email (paginate through users)
let target = null
let page = 1
while (!target) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
  if (error) { console.error('listUsers error:', error); break }
  if (!data.users.length) break
  target = data.users.find((u) => (u.email || '').toLowerCase() === EMAIL.toLowerCase())
  page++
  if (page > 20) break
}

if (!target) {
  console.log('No auth user found for', EMAIL)
  process.exit(1)
}

const { error: updErr } = await supabase.auth.admin.updateUserById(target.id, {
  password: TEMP_PASSWORD,
  email_confirm: true,
})

if (updErr) {
  console.error('Password update failed:', updErr)
  process.exit(1)
}

console.log('Password reset OK for', EMAIL, '(id:', target.id + ')')
console.log('Temporary password:', TEMP_PASSWORD)
