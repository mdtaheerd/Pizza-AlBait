import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building2, 
  Globe, 
  Users, 
  Award, 
  MapPin, 
  Mail,
  Phone,
  Briefcase,
  Shield,
  Target,
  ArrowRight,
  Home
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={70}
                height={70}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Home
              </Link>
              <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Careers
              </Link>
              <Link href="/about" className="text-foreground font-medium">
                About Us
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/careers">View Open Positions</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={120}
                height={120}
                className="h-28 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              China Petroleum Engineering & Construction Corporation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A leading EPC contractor specializing in onshore oil & gas projects, 
              delivering excellence in engineering, procurement, and construction across the Middle East and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Who We Are</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                CPECC (China Petroleum Engineering & Construction Corporation) is a wholly-owned subsidiary 
                of China National Petroleum Corporation (CNPC), one of the world&apos;s largest integrated energy companies.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Established with a commitment to excellence, CPECC has grown to become a trusted partner 
                for major oil and gas projects worldwide. Our expertise spans the entire project lifecycle, 
                from conceptual design to commissioning and startup.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With operations across the Middle East, Central Asia, Africa, and beyond, we bring 
                international experience combined with local expertise to deliver world-class projects 
                safely, on time, and within budget.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-red-50 border-red-100">
                <CardContent className="p-6 text-center">
                  <Globe className="h-10 w-10 text-red-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Countries Operated</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">10,000+</p>
                  <p className="text-sm text-muted-foreground">Employees Worldwide</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-6 text-center">
                  <Award className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">40+</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Projects Completed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive EPC solutions for the oil and gas industry
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-xl bg-red-100 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Engineering</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive engineering services including FEED, detailed engineering, 
                  process design, and technical consultancy for oil & gas facilities.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <Briefcase className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Procurement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Strategic sourcing and procurement of equipment, materials, and services 
                  with a global supply chain network ensuring quality and timely delivery.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Construction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  World-class construction capabilities for refineries, gas processing plants, 
                  pipelines, and petrochemical facilities with strict HSE standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Safety First</h3>
              <p className="text-sm text-muted-foreground">
                Zero tolerance for safety compromises in all our operations
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Committed to delivering the highest quality in every project
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Teamwork</h3>
              <p className="text-sm text-muted-foreground">
                Collaborative approach with clients, partners, and communities
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                Environmental responsibility in all our operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Middle East Operations */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Middle East Operations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our regional headquarters and project locations across the Middle East
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">United Arab Emirates</h3>
                    <p className="text-sm text-muted-foreground">
                      Regional headquarters with major refinery and gas processing projects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Saudi Arabia</h3>
                    <p className="text-sm text-muted-foreground">
                      Large-scale oil & gas infrastructure and petrochemical projects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Kuwait & Qatar</h3>
                    <p className="text-sm text-muted-foreground">
                      Ongoing partnerships for upstream and downstream facilities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Team</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Be part of a global team delivering world-class energy projects. 
            We offer exciting career opportunities for talented professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-red-600 hover:bg-white/90">
              <Link href="/careers" className="flex items-center gap-2">
                View Open Positions
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/candidate/register">Register as Candidate</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground">Get in touch with our team</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Address</h3>
              <p className="text-sm text-muted-foreground">
                Abu Dhabi, United Arab Emirates
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">
                careers@cpecc.ae
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">
                +971 2 XXX XXXX
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={50}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
              <div>
                <p className="font-semibold">CPECC</p>
                <p className="text-sm text-slate-400">China Petroleum Engineering & Construction Corporation</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <Link href="/careers" className="text-slate-400 hover:text-white transition-colors">
                Careers
              </Link>
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} CPECC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
