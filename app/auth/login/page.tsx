'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Linkedin, Mail, Loader2, Home, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log('[v0] Starting login for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.log('[v0] Login error:', error.message)
        throw error
      }
      
      console.log('[v0] Login successful, user:', data.user?.email)
      console.log('[v0] Session exists:', !!data.session)
      
      // Check user's approval status
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('id', data.user?.id)
        .single()
      
      console.log('[v0] User profile:', profile)
      
      // Block rejected users
      if (profile?.approval_status === 'rejected') {
        await supabase.auth.signOut()
        throw new Error('Your account has been rejected. Please contact the administrator.')
      }
      
      // Redirect pending users to pending approval page
      if (profile?.role !== 'candidate' && profile?.role !== 'admin' && profile?.approval_status === 'pending') {
        window.location.href = '/auth/pending-approval'
        return
      }
      
      // Wait a moment for the session to be set in cookies
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify the session is set
      const { data: sessionCheck } = await supabase.auth.getSession()
      console.log('[v0] Session check after login:', !!sessionCheck.session)
      
      // Redirect based on role
      if (profile?.role === 'candidate') {
        window.location.href = '/candidate/dashboard'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error: unknown) {
      // Log detailed error for debugging but show generic message to user
      console.error('[SECURITY] Login failure:', error)
      
      // Don't reveal whether email exists or not - always show generic message
      const errorMessage = error instanceof Error ? error.message : ''
      
      // Only show specific message for rejected users
      if (errorMessage.includes('rejected')) {
        setError(errorMessage)
      } else {
        setError('Invalid email or password. Please try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-6 md:p-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      
      {/* Home Button */}
      <div className="absolute top-6 left-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
      
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
              alt="CPECC"
              width={80}
              height={80}
              priority
              className="h-20 w-auto"
              style={{ height: 'auto' }}
            />
          </Link>
          
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* LinkedIn Sign In - Future Feature */}
              <Button 
                variant="outline" 
                className="w-full gap-2 border-linkedin/30 text-linkedin hover:bg-linkedin hover:text-white"
                type="button"
                disabled
              >
                <Linkedin className="h-4 w-4" />
                Continue with LinkedIn
                <span className="ml-auto text-xs opacity-60">Coming soon</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {"Don't have an account? "}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
