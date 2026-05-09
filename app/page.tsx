'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Building2,
  ArrowRight,
  CheckCircle,
  Clock,
  Heart
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                ATS
              </div>
              <span className="text-xl font-bold text-slate-800">ATS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Open Positions
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                About Us
              </Link>
              <Link href="#departments" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Departments
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Link href="/careers">View Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-sm font-medium mb-6">
              <Briefcase className="h-4 w-4" />
              Applicant Tracking System
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Streamline Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Hiring Process
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              A modern applicant tracking system to manage your recruitment pipeline, track candidates, and hire the best talent efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl text-lg px-8 py-6">
                <Link href="/careers">
                  View Open Positions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl text-lg px-8 py-6 border-2">
                <Link href="/auth/login">
                  Recruiter Portal
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
              <div>
                <p className="text-3xl font-bold text-foreground">100+</p>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Users className="h-32 w-32 text-blue-600/30" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Trusted Platform</p>
                    <p className="text-sm text-muted-foreground">Reliable & Secure</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Modern Recruitment Made Simple
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our applicant tracking system helps organizations streamline their hiring process. From job posting to candidate onboarding, manage everything in one place.
              </p>
              <div className="space-y-4">
                {[
                  'Track candidates through every stage',
                  'Collaborate with your hiring team',
                  'Schedule interviews effortlessly',
                  'Generate insightful reports'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse by Department
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find opportunities across different teams and functions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Engineering', icon: Building2, openings: 15, description: 'Software & hardware' },
              { name: 'Product', icon: Briefcase, openings: 8, description: 'Product management' },
              { name: 'Design', icon: Heart, openings: 6, description: 'UX & visual design' },
              { name: 'Marketing', icon: BarChart3, openings: 5, description: 'Growth & brand' },
              { name: 'Sales', icon: Users, openings: 10, description: 'Business development' },
              { name: 'Operations', icon: Clock, openings: 7, description: 'Business ops' },
              { name: 'HR', icon: Users, openings: 4, description: 'People operations' },
              { name: 'Finance', icon: BarChart3, openings: 3, description: 'Accounting & finance' }
            ].map((dept) => (
              <Card key={dept.name} className="border border-border/50 hover:border-blue-600/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                      <dept.icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {dept.openings} jobs
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-0.5 leading-tight">{dept.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{dept.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button size="lg" asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
              <Link href="/careers">
                View All Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recruiter CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-muted/50 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Recruiter Dashboard
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Access our powerful recruitment platform to manage candidates, track applications through the hiring pipeline, schedule interviews, and make data-driven hiring decisions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" asChild className="rounded-xl bg-red-600 hover:bg-red-700">
                      <Link href="/auth/login">
                        Access Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="rounded-xl">
                      <Link href="/auth/sign-up">
                        Create Account
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: 'Candidate Pipeline', desc: 'Track all applicants' },
                    { icon: Briefcase, label: 'Job Management', desc: 'Create & manage postings' },
                    { icon: BarChart3, label: 'Analytics', desc: 'Hiring metrics & reports' },
                    { icon: Clock, label: 'Scheduling', desc: 'Interview scheduling' }
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <item.icon className="h-6 w-6 text-red-600 mb-2" />
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/pizza-albait-logo.jpg"
                  alt="Pizza Al-Bait Logo"
                  width={50}
                  height={50}
                  className="rounded"
                />
                <span className="text-xl font-bold">Pizza Al-Bait</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Join our growing family of pizza lovers. We are committed to delivering excellence in every slice and creating opportunities for passionate individuals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/careers" className="hover:text-white transition-colors">Open Positions</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Recruiter Login</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li>careers@pizzaalbait.com</li>
                <li>+971 XX XXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Pizza Al-Bait. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
