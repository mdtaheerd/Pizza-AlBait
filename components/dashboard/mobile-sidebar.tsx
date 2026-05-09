'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Building2,
  Briefcase,
  Linkedin,
} from 'lucide-react'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface MobileSidebarProps {
  profile: Profile | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: FileText },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: Briefcase },
  { name: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

const adminNavigation = [
  { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileSidebar({ profile }: MobileSidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b px-6 py-4">
        <SheetTitle className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CPECC%20Logo-v2VEWr2wpVlNgvVySqwQDyOe1A3E71.jpg"
            alt="CPECC Logo"
            width={40}
            height={40}
            className="rounded"
          />
          <div>
            <span className="text-sm font-bold tracking-tight">CPECC</span>
            <span className="text-[10px] text-muted-foreground block">Recruitment Portal</span>
          </div>
        </SheetTitle>
      </SheetHeader>
      <nav className="flex-1 space-y-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* LinkedIn Integration */}
        <div className="mt-6 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Integrations
          </p>
          <Link
            href="/dashboard/linkedin"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              pathname === '/dashboard/linkedin'
                ? 'bg-linkedin text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Linkedin className="h-5 w-5" />
            LinkedIn Import
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-6 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* User Info */}
      {profile && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-medium text-primary-foreground">
              {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
