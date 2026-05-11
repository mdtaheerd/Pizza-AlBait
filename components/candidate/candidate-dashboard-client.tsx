'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Home, 
  Briefcase, 
  FileText, 
  User, 
  LogOut, 
  MapPin, 
  Calendar,
  ExternalLink,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { STAGE_LABELS, STAGE_COLORS, EMPLOYMENT_TYPE_LABELS } from '@/lib/types'
import type { Candidate, Job, Application, ApplicationStage, EmploymentType } from '@/lib/types'

interface CandidateDashboardClientProps {
  candidate: (Candidate & {
    applications?: (Application & {
      job?: Job & {
        department?: { name: string } | null
      }
    })[]
  }) | null
  openJobs: (Pick<Job, 'id' | 'title' | 'location' | 'employment_type' | 'closing_date'> & {
    department?: { id: string; name: string }[] | { id: string; name: string } | null
  })[]
  userEmail: string
}

export function CandidateDashboardClient({ candidate, openJobs, userEmail }: CandidateDashboardClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Get applied job IDs to filter them from open jobs
  const appliedJobIds = new Set(candidate?.applications?.map(app => app.job?.id) || [])
  const availableJobs = openJobs.filter(job => !appliedJobIds.has(job.id))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SIoaEem9rRhvQManhsXzLTLTuvKC1c.png"
                alt="CPECC"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex">Candidate Portal</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/careers" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">
            Welcome back, {candidate?.full_name || userEmail}
          </h1>
          <p className="text-muted-foreground">
            Manage your job applications and profile
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidate?.applications?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidate?.applications?.filter(a => 
                  !['hired', 'rejected'].includes(a.stage)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableJobs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Applications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Applications
            </CardTitle>
            <CardDescription>
              Track the status of your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidate?.applications && candidate.applications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden sm:table-cell">Applied On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidate.applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.job?.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 md:hidden">
                            {application.job?.department?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {application.job?.department?.name || '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(application.applied_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={STAGE_COLORS[application.stage as ApplicationStage]}
                        >
                          {STAGE_LABELS[application.stage as ApplicationStage]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven&apos;t applied to any jobs yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/careers">Browse Open Positions</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs You Can Apply To
            </CardTitle>
            <CardDescription>
              Open positions you haven&apos;t applied to yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableJobs.length > 0 ? (
              <div className="space-y-3">
                {availableJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                        {(Array.isArray(job.department) ? job.department[0]?.name : job.department?.name) && (
                          <span>{Array.isArray(job.department) ? job.department[0]?.name : job.department?.name}</span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        {job.employment_type && (
                          <Badge variant="outline" className="text-xs">
                            {EMPLOYMENT_TYPE_LABELS[job.employment_type as EmploymentType]}
                          </Badge>
                        )}
                        {job.closing_date && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Calendar className="h-3 w-3" />
                            Closes {format(new Date(job.closing_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/careers/${job.id}/apply`} className="flex items-center gap-1">
                        Apply
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {openJobs.length > availableJobs.length && (
                  <div className="text-center pt-2">
                    <Button variant="link" asChild>
                      <Link href="/careers">View all open positions</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You&apos;ve applied to all available positions!</p>
                <p className="text-sm mt-1">Check back later for new openings.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Card */}
        {candidate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{candidate.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{candidate.country_code} {candidate.phone}</p>
                </div>
                {candidate.nationality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{candidate.nationality}</p>
                  </div>
                )}
                {candidate.current_salary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Salary</p>
                    <p className="font-medium">
                      {candidate.current_salary_currency} {candidate.current_salary.toLocaleString()}
                    </p>
                  </div>
                )}
                {candidate.expected_salary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Salary</p>
                    <p className="font-medium">
                      {candidate.expected_salary_currency} {candidate.expected_salary.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
