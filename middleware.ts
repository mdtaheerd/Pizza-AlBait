import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory rate limiting for middleware (Edge Runtime compatible)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, isLoginRoute: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const window = 60 * 1000 // 1 minute
  const maxRequests = isLoginRoute ? 10 : 100 // Stricter for login routes
  const key = `${isLoginRoute ? 'login' : 'general'}:${ip}`

  const record = rateLimitMap.get(key)

  // Clean old entries periodically
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) rateLimitMap.delete(k)
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

// Blocked IPs tracking
const blockedIPs = new Set<string>()
const suspiciousActivity = new Map<string, number>()

function recordSuspiciousActivity(ip: string): boolean {
  const count = (suspiciousActivity.get(ip) || 0) + 1
  suspiciousActivity.set(ip, count)
  
  if (count >= 20) {
    blockedIPs.add(ip)
    console.warn(`[SECURITY] Blocked IP ${ip} due to suspicious activity`)
    return true
  }
  return false
}

// Detect suspicious patterns in URL
function hasSuspiciousPattern(url: string): boolean {
  const suspicious = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS
    /javascript:/i,
    /(union|select|insert|drop|delete).*from/i, // SQL injection
    /\.(php|asp|aspx|jsp|cgi)$/i, // Probe for other backends
    /wp-admin|wp-content|wp-includes/i, // WordPress probes
    /phpmyadmin|adminer|mysql/i, // Database admin probes
    /\.env|\.git|\.htaccess/i, // Config file probes
    /eval\(|exec\(/i, // Code injection
  ]
  
  return suspicious.some(pattern => pattern.test(url))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
              request.headers.get('x-real-ip') || 
              'unknown'

  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    console.warn(`[SECURITY] Blocked request from banned IP: ${ip}`)
    return new NextResponse('Access Denied', { status: 403 })
  }

  // Check for suspicious URL patterns
  const fullUrl = request.url
  if (hasSuspiciousPattern(fullUrl) || hasSuspiciousPattern(pathname)) {
    console.warn(`[SECURITY] Suspicious URL pattern detected from ${ip}: ${pathname}`)
    recordSuspiciousActivity(ip)
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Rate limiting
  const isLoginRoute = pathname === '/auth/login' || pathname === '/api/auth/login' || pathname === '/candidate/login'
  const isApiRoute = pathname.startsWith('/api/')
  
  const { allowed, remaining } = checkRateLimit(ip, isLoginRoute || isApiRoute)
  
  if (!allowed) {
    console.warn(`[SECURITY] Rate limit exceeded for ${ip} on ${pathname}`)
    recordSuspiciousActivity(ip)
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Remaining': '0',
      }
    })
  }

  // Allow all public routes without auth checks
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/candidate/login') ||
    pathname.startsWith('/candidate/register') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add rate limit headers
  supabaseResponse.headers.set('X-RateLimit-Remaining', remaining.toString())

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.headers.set('X-RateLimit-Remaining', remaining.toString())
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isPublicRoute) {
    return supabaseResponse
  }

  // For protected routes (dashboard, candidate dashboard), check for authenticated user
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/candidate/dashboard')
  
  if (isProtectedRoute && !user) {
    console.warn(`[SECURITY] Unauthenticated access attempt to ${pathname} from ${ip}`)
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
