'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Home, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PendingApprovalPage() {
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }, [router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-amber-50 via-background to-background p-6 md:p-10">
      {/* Home Button */}
      <div className="absolute top-6 left-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SIoaEem9rRhvQManhsXzLTLTuvKC1c.png"
              alt="CPECC"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
          </Link>

          <Card className="border-amber-200">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Pending Approval</CardTitle>
              <CardDescription>
                Your registration is awaiting administrator approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium mb-2">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>An administrator will review your registration</li>
                  <li>You will receive an email once approved</li>
                  <li>After approval, you can access all features</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="text-muted-foreground">
                  If you have any questions, please contact your system administrator
                  or HR department.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
