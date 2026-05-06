import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time to prevent errors
    // The actual client will be created at runtime
    console.warn('Supabase env vars not available, using placeholder')
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
