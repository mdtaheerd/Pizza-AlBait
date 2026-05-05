import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes - redirect to login if not authenticated
  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check approval status for dashboard access
  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    user
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    // If user is not approved and not admin, redirect to pending approval page
    if (profile && profile.role !== 'admin' && profile.approval_status !== 'approved') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending-approval'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages (except pending-approval)
  if (
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/sign-up')) &&
    user
  ) {
    // First check if they need to go to pending approval
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile && profile.role !== 'admin' && profile.approval_status !== 'approved') {
      url.pathname = '/auth/pending-approval'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
