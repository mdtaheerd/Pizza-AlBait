import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Role = 'admin' | 'recruiter' | 'hiring_manager' | 'candidate'

interface SecurityCheckResult {
  authorized: boolean
  user?: { id: string; email: string }
  profile?: { role: string; approval_status: string }
  error?: NextResponse
}

/**
 * Check if the request is from an authenticated and authorized user
 * @param allowedRoles - Array of roles that are allowed to access this endpoint
 * @param requireApproved - Whether the user must be approved (default: true)
 */
export async function checkApiAuthorization(
  allowedRoles?: Role[],
  requireApproved = true
): Promise<SecurityCheckResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        ),
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'User profile not found' },
          { status: 403 }
        ),
      }
    }

    // Check if user is approved (if required)
    if (requireApproved && profile.approval_status === 'rejected') {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Your account has been rejected' },
          { status: 403 }
        ),
      }
    }

    if (requireApproved && profile.role !== 'candidate' && profile.role !== 'admin' && profile.approval_status !== 'approved') {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Your account is pending approval' },
          { status: 403 }
        ),
      }
    }

    // Check role authorization
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(profile.role as Role)) {
        return {
          authorized: false,
          error: NextResponse.json(
            { error: 'You do not have permission to perform this action' },
            { status: 403 }
          ),
        }
      }
    }

    return {
      authorized: true,
      user: { id: user.id, email: user.email || '' },
      profile: { role: profile.role, approval_status: profile.approval_status },
    }
  } catch (error) {
    console.error('[SECURITY] Authorization check failed:', error)
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Authorization check failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Validate that required fields are present in the request body
 */
export function validateRequestBody(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000) // Limit length
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>
) {
  console.warn(`[SECURITY] ${event}:`, JSON.stringify(details))
}
