import { Linkedin, Home } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function CareersHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
            alt="CPECC"
            width={50}
            height={50}
            className="h-12 w-auto"
          />
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground leading-tight">中国石油工程建设有限公司海湾地区公司</p>
            <p className="text-[10px] text-muted-foreground leading-tight">CHINA PETROLEUM ENGINEERING & CONSTRUCTION CORPORATION</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/careers">
              All Jobs
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">
              About Us
            </Link>
          </Button>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:bg-[#0077B5] hover:text-white"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/auth/login">Recruiter/HRBP Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
