import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Home, LogIn, Briefcase } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegistrationSuccessPage() {
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

      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/images/talenttrack-logo.png"
                alt="TalentTrack ATS"
                width={200}
                height={60}
                className="h-14 w-auto"
              />
            </Link>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl text-green-700">Registration Successful!</CardTitle>
              <CardDescription className="mt-2">
                Your candidate account has been created. Please check your email to verify your account, then login to start applying for jobs.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/candidate/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login to Your Account
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/careers" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Browse Open Positions
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
