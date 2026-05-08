'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Building2,
  Linkedin,
  ArrowRight,
  CheckCircle,
  Globe,
  Shield,
  Calculator,
  FileText,
  HardHat,
  ShieldCheck,
  Package,
  Wrench,
  Cog,
  UserCircle,
  UserCog,
  ChevronDown,
  LogIn
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* TalentTrack ATS Logo */}
            <Link href="/" className="flex items-center">
              <Logo size="lg" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Open Positions
              </Link>
              <Link href="#departments" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Departments
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

      {/* Hero Section */}
      <section className="relative pt-20 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cpecc-hero.jpg"
            alt="Modern Workplace"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-600 text-sm font-medium mb-6">
              <Globe className="h-4 w-4" />
              Applicant Tracking System
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                TalentTrack
              </span>{' '}
              ATS
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              A modern applicant tracking system to streamline your recruitment process. Manage candidates, track applications, and make data-driven hiring decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 rounded-xl text-lg px-8 py-6">
                <Link href="/careers">
                  Explore Opportunities
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
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Jobs Posted</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Hiring Success</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/team-hiring-3d.jpg"
                  alt="Modern Recruitment Team"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-600/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Smart Hiring</p>
                    <p className="text-sm text-muted-foreground">Efficient & Modern</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Streamline Your Hiring Process
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                TalentTrack ATS is a modern applicant tracking system designed to help organizations manage their recruitment process efficiently. From job posting to candidate management, interview scheduling, and offer letters - we have got you covered.
              </p>
              <div className="space-y-4">
                {[
                  'Full recruitment lifecycle management',
                  'Automated candidate screening and tracking',
                  'Interview scheduling and feedback management',
                  'Analytics and reporting dashboard'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
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
              Career Departments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our team of experts across various disciplines
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Engineering', icon: Building2, openings: 15, description: 'Technical & design' },
              { name: 'Project Planning & Control', icon: FileText, openings: 12, description: 'Planning & scheduling' },
              { name: 'Quality Control', icon: ShieldCheck, openings: 8, description: 'QA/QC assurance' },
              { name: 'HSE', icon: Shield, openings: 10, description: 'Health, Safety & Environment' },
              { name: 'Procurement', icon: Package, openings: 9, description: 'Materials & equipment' },
              { name: 'Construction', icon: HardHat, openings: 20, description: 'Site construction' },
              { name: 'Commissioning', icon: Cog, openings: 7, description: 'Plant startup' },
              { name: 'Commercial and Finance', icon: Calculator, openings: 10, description: 'Finance & contracts' },
              { name: 'Marketing', icon: BarChart3, openings: 5, description: 'Brand & communications' },
              { name: 'HR & Administration', icon: Users, openings: 6, description: 'People operations' }
            ].map((dept) => (
              <Card key={dept.name} className="border border-border/50 hover:border-red-600/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all duration-300">
                      <dept.icon className="h-5 w-5 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
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
            <Button size="lg" asChild className="rounded-xl bg-red-600 hover:bg-red-700">
              <Link href="/careers">
                View All Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Capabilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Delivering integrated EPC solutions across the energy value chain
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="/images/construction-site.jpg"
                  alt="Engineering"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <CardContent className="p-6 relative -mt-8">
                <div className="h-14 w-14 rounded-xl bg-red-600/10 flex items-center justify-center mb-4 border border-red-600/20">
                  <Building2 className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Engineering</h3>
                <p className="text-muted-foreground">
                  Advanced engineering solutions with cutting-edge technology and experienced professionals delivering innovative designs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="/images/middle-east-construction.jpg"
                  alt="Procurement"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <CardContent className="p-6 relative -mt-8">
                <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
                  <Globe className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Procurement</h3>
                <p className="text-muted-foreground">
                  Global supply chain management ensuring quality materials and equipment delivery on time and within budget.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="/images/oil-pipeline.jpg"
                  alt="Construction"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <CardContent className="p-6 relative -mt-8">
                <div className="h-14 w-14 rounded-xl bg-red-600/10 flex items-center justify-center mb-4 border border-red-600/20">
                  <Shield className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Construction</h3>
                <p className="text-muted-foreground">
                  World-class construction execution with stringent safety standards and proven project management methodologies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* LinkedIn Integration CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0077B5] to-[#005582] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 mb-6">
            <Linkedin className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Connect with Us on LinkedIn
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Follow our company page for the latest job openings, industry insights, and company news. Apply directly using your LinkedIn profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0077B5] hover:bg-white/90 rounded-xl text-lg px-8">
              <Linkedin className="mr-2 h-5 w-5" />
              Follow Our Company
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl text-lg px-8">
              Import Your Profile
            </Button>
          </div>
        </div>
      </section>

      {/* Recruiter CTA */}
      <section className="py-20">
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
                    { icon: Linkedin, label: 'LinkedIn Import', desc: 'Import candidates' }
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
              {/* TalentTrack ATS Footer Logo */}
              <div className="mb-4">
                <Image
                  src="/images/talenttrack-logo.png"
                  alt="TalentTrack ATS"
                  width={160}
                  height={50}
                  className="h-12 w-auto bg-white rounded-lg p-2"
                />
              </div>
              <p className="text-white/60 text-sm max-w-sm">
                TalentTrack ATS - A modern applicant tracking system to streamline your recruitment process.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/careers" className="block text-white/60 hover:text-white text-sm">Open Positions</Link>
                <Link href="#departments" className="block text-white/60 hover:text-white text-sm">Departments</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Departments</h4>
              <div className="space-y-2">
                <span className="block text-white/60 text-sm">Marketing</span>
                <span className="block text-white/60 text-sm">Project Planning & Control</span>
                <span className="block text-white/60 text-sm">Commercial and Finance</span>
                <span className="block text-white/60 text-sm">HR & Administration</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm font-medium mb-1">TalentTrack ATS</p>
              <p className="text-white/40 text-sm">
                &copy; {new Date().getFullYear()} TalentTrack ATS. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-white/40 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
