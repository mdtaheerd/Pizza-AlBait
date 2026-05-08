import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  const { pathname } = request.nextUrl
  
  // Allow all public routes without any checks
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes (dashboard), check for auth cookie
  const supabaseAuthCookie = request.cookies.getAll().find(
    cookie => cookie.name.includes('supabase') && cookie.name.includes('auth')
  )

  // If no auth cookie and trying to access dashboard, redirect to login
  if (pathname.startsWith('/dashboard') && !supabaseAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
