'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Briefcase,
  UserCircle,
  UserCog,
  ShieldCheck,
  ChevronDown,
  LogIn
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function LandingNavigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* CPECC Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
              alt="CPECC Abu Dhabi Branch"
              width={70}
              height={70}
              className="h-16 w-auto"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Open Positions
            </Link>
            <Link href="#departments" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Departments
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              About Us
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/candidate/login" className="flex items-center gap-3 cursor-pointer py-2">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Candidate Login</p>
                      <p className="text-xs text-muted-foreground">Apply for jobs</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="flex items-center gap-3 cursor-pointer py-2">
                    <UserCog className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Recruiter Login</p>
                      <p className="text-xs text-muted-foreground">Manage applications</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="flex items-center gap-3 cursor-pointer py-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Hiring Manager Login</p>
                      <p className="text-xs text-muted-foreground">Review candidates</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="flex items-center gap-3 cursor-pointer py-2">
                    <ShieldCheck className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Admin Login</p>
                      <p className="text-xs text-muted-foreground">System administration</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild className="bg-red-600 hover:bg-red-700 rounded-xl">
              <Link href="/careers">View Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
