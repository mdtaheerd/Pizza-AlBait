import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Banknote, Search, HardHat, ArrowRight, Users, Briefcase, Shield, Linkedin, Globe } from 'lucide-react'
import { EMPLOYMENT_TYPE_LABELS } from '@/lib/types'
import Link from 'next/link'
import { CareersSearch } from '@/components/careers/careers-search'
import Image from 'next/image'
import { autoCloseExpiredJobs } from '@/lib/jobs/auto-close'

interface CareersPageProps {
  searchParams: Promise<{ search?: string; department?: string }>
}

export default async function CareersPage({ searchParams }: CareersPageProps) {
  const { search, department } = await searchParams
  const supabase = await createClient()
  
  // Auto-close any expired jobs before showing the listings
  await autoCloseExpiredJobs()

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  let jobsQuery = supabase
    .from('jobs')
    .select(`
      *,
      department:departments(id, name)
    `)
    .eq('status', 'open')
    .order('published_at', { ascending: false })

  if (department) {
    jobsQuery = jobsQuery.eq('department_id', department)
  }

  const { data: jobs } = await jobsQuery

  const filteredJobs = search
    ? (jobs || []).filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.location?.toLowerCase().includes(search.toLowerCase()) ||
          job.department?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs || []

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min) return `From ${formatter.format(min)}`
    if (max) return `Up to ${formatter.format(max)}`
    return null
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/talenttrack-logo.png"
              alt="TalentTrack ATS"
              width={180}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button asChild className="rounded-xl shadow-md bg-red-600 hover:bg-red-700">
              <Link href="/auth/login">Recruiter Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Background */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/middle-east-construction.jpg"
            alt="Professional Team"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-4 py-1.5 text-sm shadow-sm">
            <Users className="h-4 w-4 text-red-600" />
            <span className="text-muted-foreground">{filteredJobs.length} Open Positions</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Find Your Next
            <span className="mx-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Career
            </span>
            Opportunity
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty leading-relaxed">
            Browse open positions and apply to join our growing team. We are always looking for talented individuals to help us achieve our goals.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4 text-red-600" />
              World-class HSE standards
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur px-3 py-1.5 rounded-full">
              <Globe className="h-4 w-4 text-red-600" />
              Middle East onshore projects
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur px-3 py-1.5 rounded-full">
              <Briefcase className="h-4 w-4 text-red-600" />
              Competitive packages
            </div>
          </div>

          {/* LinkedIn CTA */}
          <div className="mt-8">
            <Button size="lg" className="bg-[#0077B5] hover:bg-[#005582] rounded-xl text-lg">
              <Linkedin className="mr-2 h-5 w-5" />
              Apply with LinkedIn
            </Button>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <CareersSearch 
          departments={departments || []} 
          currentSearch={search}
          currentDepartment={department}
        />

        {filteredJobs.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-6 text-lg font-medium">No positions found</p>
              <p className="mt-2 text-center text-muted-foreground">
                {search || department
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new opportunities'}
              </p>
              {(search || department) && (
                <Button variant="outline" className="mt-6" asChild>
                  <Link href="/careers">Clear Filters</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}
            </p>
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/careers/${job.id}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-red-600/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader className="relative pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold group-hover:text-red-600 transition-colors">
                          {job.title}
                        </h2>
                        {job.department?.name && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {job.department.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.employment_type && (
                          <Badge variant="secondary" className="shrink-0">
                            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-red-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                        </span>
                      )}
                      {formatSalary(job.salary_min, job.salary_max) && (
                        <span className="flex items-center gap-1.5">
                          <Banknote className="h-4 w-4" />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {job.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why Join Us */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Why Join Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-600/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Middle East Projects</h3>
                <p className="text-sm text-muted-foreground">Work on major onshore oil & gas projects across the Middle East region</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-600/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Team</h3>
                <p className="text-sm text-muted-foreground">Collaborate with industry-leading engineers and project professionals</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-600/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Safety First</h3>
                <p className="text-sm text-muted-foreground">Industry-leading HSE standards and commitment to employee wellbeing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Image
                src="/images/talenttrack-logo.png"
                alt="TalentTrack ATS"
                width={140}
                height={45}
                className="h-10 w-auto bg-white rounded-lg p-2"
              />
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0077B5] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            <p className="mb-2">TalentTrack ATS</p>
            <p>&copy; {new Date().getFullYear()} TalentTrack ATS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
