'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Linkedin, 
  Link2, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  FileText,
  ExternalLink
} from 'lucide-react'

interface ParsedProfile {
  full_name: string
  email: string
  phone: string
  linkedin_url: string
  headline: string
  summary: string
}

export default function LinkedInImportPage() {
  const router = useRouter()
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  
  const [profile, setProfile] = useState<ParsedProfile>({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    headline: '',
    summary: '',
  })

  const extractLinkedInUsername = (url: string) => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/)
    return match ? match[1] : null
  }

  const handleImportFromUrl = async () => {
    if (!linkedinUrl) {
      setError('Please enter a LinkedIn profile URL')
      return
    }

    const username = extractLinkedInUsername(linkedinUrl)
    if (!username) {
      setError('Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username)')
      return
    }

    setIsLoading(true)
    setError(null)

    // In production, this would call a backend API that uses LinkedIn's API
    // For now, we'll show the manual entry form with the URL pre-filled
    setTimeout(() => {
      setProfile({
        ...profile,
        linkedin_url: linkedinUrl,
      })
      setManualMode(true)
      setIsLoading(false)
    }, 1000)
  }

  const handleSaveCandidate = async () => {
    if (!profile.full_name || !profile.email) {
      setError('Name and email are required')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase
        .from('candidates')
        .insert({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone || null,
          linkedin_url: profile.linkedin_url || null,
          source: 'linkedin',
          notes: profile.headline ? `${profile.headline}\n\n${profile.summary}` : profile.summary || null,
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/candidates')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save candidate')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Candidate Added!</h2>
            <p className="mt-2 text-muted-foreground">
              {profile.full_name} has been added to your candidate database.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">LinkedIn Import</h1>
        <p className="text-muted-foreground">
          Import candidate profiles directly from LinkedIn
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Card */}
        <Card className="border-linkedin/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linkedin text-white">
                <Linkedin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Import from LinkedIn</CardTitle>
                <CardDescription>Paste a LinkedIn profile URL to import</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="linkedin-url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleImportFromUrl} 
                  disabled={isLoading}
                  className="bg-linkedin hover:bg-linkedin/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Import'
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setManualMode(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Enter Details Manually
            </Button>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle>How LinkedIn Import Works</CardTitle>
            <CardDescription>Quick and easy candidate import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                1
              </div>
              <div>
                <p className="font-medium">Copy the LinkedIn URL</p>
                <p className="text-sm text-muted-foreground">
                  Find the candidate on LinkedIn and copy their profile URL
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                2
              </div>
              <div>
                <p className="font-medium">Paste and Import</p>
                <p className="text-sm text-muted-foreground">
                  Paste the URL above and click Import to start
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                3
              </div>
              <div>
                <p className="font-medium">Review and Save</p>
                <p className="text-sm text-muted-foreground">
                  Review the imported data and save to your database
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-linkedin/20 bg-linkedin/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-linkedin">
                <Linkedin className="h-4 w-4" />
                Pro Tip
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                The candidate&apos;s LinkedIn URL will be automatically saved, making it easy to reference their full profile later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Entry Form */}
      {manualMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Candidate Details
                </CardTitle>
                <CardDescription>
                  Enter or review the candidate&apos;s information
                </CardDescription>
              </div>
              {profile.linkedin_url && (
                <Badge variant="secondary" className="gap-1">
                  <Linkedin className="h-3 w-3" />
                  LinkedIn Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      type="url"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline / Current Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="headline"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    placeholder="Senior Software Engineer at Company"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary / Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="summary"
                    value={profile.summary}
                    onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                    placeholder="Add any notes about this candidate..."
                    rows={4}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveCandidate} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add to Candidates
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setManualMode(false)
                    setProfile({
                      full_name: '',
                      email: '',
                      phone: '',
                      linkedin_url: '',
                      headline: '',
                      summary: '',
                    })
                  }}
                >
                  Cancel
                </Button>
                {profile.linkedin_url && (
                  <Button variant="ghost" asChild>
                    <a 
                      href={profile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
