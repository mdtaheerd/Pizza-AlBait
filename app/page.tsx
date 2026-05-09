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
  UtensilsCrossed,
  ChefHat,
  Truck,
  Store,
  Clock,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/pizza-albait-logo.jpg"
                alt="Pizza Al-Bait"
                width={50}
                height={50}
                className="rounded"
                priority
              />
              <span className="text-xl font-bold text-slate-800">Pizza Al-Bait</span>
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
              <Button asChild className="bg-red-600 hover:bg-red-700 rounded-xl">
                <Link href="/careers">View Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 min-h-[90vh] flex items-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-600 text-sm font-medium mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              Now Hiring Across All Locations
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                Pizza Al-Bait
              </span>{' '}
              - Where Passion Meets Pizza
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Be part of a growing family that serves delicious, authentic pizza with love. We are looking for passionate individuals to join our team across multiple locations.
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
                <p className="text-3xl font-bold text-foreground">10+</p>
                <p className="text-sm text-muted-foreground">Locations</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">5+</p>
                <p className="text-sm text-muted-foreground">Years of Excellence</p>
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
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                <ChefHat className="h-32 w-32 text-red-600/30" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-600/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Made with Love</p>
                    <p className="text-sm text-muted-foreground">Quality & Care</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Family of Pizza Lovers
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Pizza Al-Bait is more than just a restaurant - it is a family committed to serving the best pizza experience. We believe in fresh ingredients, authentic recipes, and creating memorable moments for our customers.
              </p>
              <div className="space-y-4">
                {[
                  'Competitive salaries and benefits',
                  'Career growth and advancement opportunities',
                  'Fun and friendly work environment',
                  'Training and development programs'
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
              Career Opportunities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our team in various roles across our locations
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Kitchen Staff', icon: ChefHat, openings: 15, description: 'Pizza makers & cooks' },
              { name: 'Delivery', icon: Truck, openings: 12, description: 'Delivery drivers' },
              { name: 'Store Operations', icon: Store, openings: 8, description: 'Cashiers & servers' },
              { name: 'Management', icon: Building2, openings: 5, description: 'Store managers' },
              { name: 'Customer Service', icon: Users, openings: 10, description: 'Support team' },
              { name: 'Shift Leaders', icon: Clock, openings: 7, description: 'Team supervisors' },
              { name: 'Marketing', icon: BarChart3, openings: 3, description: 'Brand & promotions' },
              { name: 'HR & Admin', icon: Briefcase, openings: 4, description: 'People operations' }
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
