// Security utilities for protecting the application

// In-memory rate limiting store (for serverless, consider using Redis/Upstash for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 100 // Max requests per window for general routes
const MAX_LOGIN_ATTEMPTS = 5 // Max login attempts per window
const MAX_API_REQUESTS = 30 // Max API requests per window

export type RateLimitType = 'general' | 'login' | 'api'

const RATE_LIMITS: Record<RateLimitType, number> = {
  general: MAX_REQUESTS_PER_WINDOW,
  login: MAX_LOGIN_ATTEMPTS,
  api: MAX_API_REQUESTS,
}

export function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'general'
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = `${type}:${identifier}`
  const record = rateLimitStore.get(key)
  const maxRequests = RATE_LIMITS[type]

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

// Suspicious patterns to detect potential attacks
const SUSPICIOUS_PATTERNS = [
  // SQL Injection patterns
  /(\b(select|insert|update|delete|drop|union|exec|execute)\b.*\b(from|into|where|table)\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  // XSS patterns
  /<script[^>]*>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /on(load|error|click|mouse|focus|blur|change|submit)=/i,
  // Path traversal
  /\.\.\//,
  /%2e%2e%2f/i,
  // Command injection
  /[;&|`$]/,
  // Common attack signatures
  /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
  /'\s*(or|and)\s+'/i,
]

export function detectSuspiciousInput(input: string): boolean {
  if (!input || typeof input !== 'string') return false
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      return true
    }
  }
  return false
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Generate security log entry
export function logSecurityEvent(
  event: 'rate_limit' | 'suspicious_input' | 'unauthorized' | 'blocked_user' | 'login_failure',
  details: {
    ip?: string
    userAgent?: string
    path?: string
    userId?: string
    message?: string
  }
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    ...details,
  }
  
  // In production, this should go to a proper logging service
  console.warn(`[SECURITY] ${JSON.stringify(logEntry)}`)
}

// Blocked IPs store (in production, use Redis or a database)
const blockedIPs = new Set<string>()
const loginFailures = new Map<string, { count: number; lastAttempt: number }>()

const MAX_LOGIN_FAILURES = 10 // Block after 10 failed attempts
const LOGIN_FAILURE_WINDOW = 15 * 60 * 1000 // 15 minutes

export function recordLoginFailure(ip: string): boolean {
  const now = Date.now()
  const record = loginFailures.get(ip)

  if (!record || now - record.lastAttempt > LOGIN_FAILURE_WINDOW) {
    loginFailures.set(ip, { count: 1, lastAttempt: now })
    return false
  }

  record.count++
  record.lastAttempt = now

  if (record.count >= MAX_LOGIN_FAILURES) {
    blockedIPs.add(ip)
    logSecurityEvent('blocked_user', { ip, message: 'IP blocked due to excessive login failures' })
    return true
  }

  return false
}

export function clearLoginFailures(ip: string) {
  loginFailures.delete(ip)
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip)
}

export function unblockIP(ip: string) {
  blockedIPs.delete(ip)
  loginFailures.delete(ip)
}

// Password strength validation
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true, message: 'Password is strong' }
}
