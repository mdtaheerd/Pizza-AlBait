import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Cog,
  Heart,
  Target,
  Lightbulb,
  Handshake,
  Award,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LandingNavigation } from '@/components/landing/landing-navigation'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get active job count
  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <LandingNavigation />

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
              Career Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                CPECC Abu Dhabi Branch
              </span>{' '}
              Today
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Build your career with China Petroleum Engineering & Construction Corporation Abu Dhabi Branch. Join a global leader in EPC projects for the oil & gas industry.
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
                <p className="text-3xl font-bold text-foreground">3000+</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{jobCount || 0}</p>
                <p className="text-sm text-muted-foreground">Open Positions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Hiring Success</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              The principles that guide our actions and define who we are as CPECC Abu Dhabi Branch
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-red-600/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Safety First</h3>
                <p className="text-white/60 text-sm">
                  Zero compromise on health, safety, and environmental standards in all our operations
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Excellence</h3>
                <p className="text-white/60 text-sm">
                  Commitment to delivering world-class quality in every project we undertake
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Integrity</h3>
                <p className="text-white/60 text-sm">
                  Building trust through honesty, transparency, and ethical business practices
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
                <p className="text-white/60 text-sm">
                  Embracing new technologies and methods to drive continuous improvement
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-2xl mx-auto">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Teamwork</h3>
                <p className="text-white/60 text-sm">
                  Collaborating across cultures and disciplines to achieve shared goals
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Customer Focus</h3>
                <p className="text-white/60 text-sm">
                  Dedicated to exceeding client expectations and delivering value
                </p>
              </CardContent>
            </Card>
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
                Why Choose CPECC Abu Dhabi Branch?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                CPECC Abu Dhabi Branch is a leading EPC contractor with over 40 years of experience in onshore oil & gas projects. We offer competitive compensation, career development opportunities, and the chance to work on world-class projects across the Middle East and beyond.
              </p>
              <div className="space-y-4">
                {[
                  'Career development and training opportunities',
                  'Work on major international projects',
                  'Diverse and inclusive work environment',
                  'Competitive salary and benefits package'
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Engineering', icon: Building2, description: 'Technical & design' },
              { name: 'Planning & Control', icon: FileText, description: 'Planning & scheduling' },
              { name: 'QAQC', icon: ShieldCheck, description: 'Quality Assurance & Control' },
              { name: 'HSE', icon: Shield, description: 'Health, Safety & Environment' },
              { name: 'Procurement', icon: Package, description: 'Materials & equipment' },
              { name: 'Construction', icon: HardHat, description: 'Site construction' },
              { name: 'Commissioning', icon: Cog, description: 'Plant startup' },
              { name: 'Interface', icon: Layers, description: 'Interface management' },
              { name: 'Finance', icon: Calculator, description: 'Financial operations' },
              { name: 'Commercials & Contracts', icon: Briefcase, description: 'Contracts management' },
              { name: 'Human Resources', icon: Users, description: 'People operations' },
              { name: 'Administration', icon: BarChart3, description: 'Admin services' }
            ].map((dept) => (
              <Card key={dept.name} className="border border-border/50 hover:border-red-600/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all duration-300">
                      <dept.icon className="h-5 w-5 text-red-600 group-hover:text-white transition-colors" />
                    </div>
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
                      <Link href="/careers">
                        View Open Positions
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
              {/* CPECC Footer Logo */}
              <div className="mb-4">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                  alt="CPECC Abu Dhabi Branch"
                  width={80}
                  height={80}
                  className="h-16 w-auto bg-white rounded-lg p-2"
                />
              </div>
              <p className="text-white/60 text-sm max-w-sm">
                China Petroleum Engineering & Construction Corporation Abu Dhabi Branch - A leading EPC contractor for onshore oil & gas projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/careers" className="block text-white/60 hover:text-white text-sm">Open Positions</Link>
                <Link href="/about" className="block text-white/60 hover:text-white text-sm">About Us</Link>
                <Link href="#departments" className="block text-white/60 hover:text-white text-sm">Departments</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Departments</h4>
              <div className="space-y-2">
                <span className="block text-white/60 text-sm">Engineering</span>
                <span className="block text-white/60 text-sm">Planning & Control</span>
                <span className="block text-white/60 text-sm">Commercials & Contracts</span>
                <span className="block text-white/60 text-sm">Human Resources</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm font-medium mb-1">CPECC Abu Dhabi Branch Careers</p>
              <p className="text-white/40 text-sm">
                &copy; {new Date().getFullYear()} CPECC Abu Dhabi Branch. All rights reserved.
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
