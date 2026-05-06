import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
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
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hdNTqit9D9oEqOX2PeHJoQmOeK7S4W.png"
              alt="CPECC - China Petroleum Engineering & Construction Corporation"
              width={280}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong during authentication. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">Back to login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
