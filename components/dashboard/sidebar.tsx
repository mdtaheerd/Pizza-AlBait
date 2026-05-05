'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import {
  Briefcase,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Building2,
  Linkedin,
  UserCog,
  FileSpreadsheet,
  Home,
} from 'lucide-react'

interface DashboardSidebarProps {
  profile: Profile | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: FileText },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: Briefcase },
  { name: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileSpreadsheet },
]

const adminNavigation = [
  { name: 'User Management', href: '/dashboard/users', icon: UserCog },
  { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside className="hidden w-64 flex-col bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4 bg-white">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CPECC%20Logo-v2VEWr2wpVlNgvVySqwQDyOe1A3E71.jpg"
          alt="CPECC Logo"
          width={50}
          height={50}
          className="rounded"
        />
        <div className="ml-3">
          <span className="text-sm font-bold text-slate-800 block">CPECC</span>
          <span className="text-[10px] text-slate-500 block leading-tight">Recruitment Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {/* Home Button */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-2 border border-sidebar-border"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>

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
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* LinkedIn Integration Section */}
        <div className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Integrations
          </p>
          <Link
            href="/dashboard/linkedin"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              pathname === '/dashboard/linkedin'
                ? 'bg-linkedin text-white shadow-md'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Linkedin className="h-5 w-5" />
            LinkedIn Import
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-8 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
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
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-medium text-primary-foreground">
              {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {profile.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
