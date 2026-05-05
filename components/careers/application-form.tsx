'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRY_CODES } from '@/lib/types'
import { CheckCircle2, Upload, FileText, X, Loader2 } from 'lucide-react'

interface ApplicationFormProps {
  jobId: string
  jobTitle: string
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country_code: '+971',
    phone: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF or Word document.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setError(null)
    setCvFile(file)
  }

  const handleRemoveFile = () => {
    setCvFile(null)
    setCvUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Check if candidate already exists
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', formData.email)
        .single()

      let candidateId: string
      let uploadedCvUrl: string | null = null

      if (existingCandidate) {
        candidateId = existingCandidate.id
        
        // Check if already applied to this job
        const { data: existingApplication } = await supabase
          .from('applications')
          .select('id')
          .eq('candidate_id', candidateId)
          .eq('job_id', jobId)
          .single()

        if (existingApplication) {
          setError('You have already applied for this position.')
          setIsLoading(false)
          return
        }

        // Upload CV if provided
        if (cvFile) {
          setIsUploading(true)
          const formDataUpload = new FormData()
          formDataUpload.append('cv', cvFile)
          formDataUpload.append('candidateId', candidateId)
          
          const uploadResponse = await fetch('/api/upload-cv', {
            method: 'POST',
            body: formDataUpload,
          })
          
          const uploadResult = await uploadResponse.json()
          if (uploadResult.error) {
            throw new Error(uploadResult.error)
          }
          uploadedCvUrl = uploadResult.url
          setIsUploading(false)
        }
      } else {
        // Create new candidate
        const { data: newCandidate, error: candidateError } = await supabase
          .from('candidates')
          .insert({
            full_name: formData.full_name,
            email: formData.email,
            country_code: formData.country_code,
            phone: formData.phone || null,
            linkedin_url: formData.linkedin_url || null,
            portfolio_url: formData.portfolio_url || null,
            source: 'career_page',
          })
          .select('id')
          .single()

        if (candidateError) throw candidateError
        candidateId = newCandidate.id

        // Upload CV if provided
        if (cvFile) {
          setIsUploading(true)
          const formDataUpload = new FormData()
          formDataUpload.append('cv', cvFile)
          formDataUpload.append('candidateId', candidateId)
          
          const uploadResponse = await fetch('/api/upload-cv', {
            method: 'POST',
            body: formDataUpload,
          })
          
          const uploadResult = await uploadResponse.json()
          if (uploadResult.error) {
            throw new Error(uploadResult.error)
          }
          uploadedCvUrl = uploadResult.url
          setIsUploading(false)
        }
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          stage: 'applied',
          notes: formData.cover_letter || null,
        })

      if (applicationError) throw applicationError

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsUploading(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Application Submitted!</h2>
          <p className="mt-2 text-muted-foreground">
            Thank you for applying for the {jobTitle} position. {"We'll review your application and get back to you soon."}
          </p>
          <Button className="mt-6" asChild>
            <a href="/careers">View More Positions</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex gap-2">
              <Select
                value={formData.country_code}
                onValueChange={(value) => setFormData({ ...formData, country_code: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="50 123 4567"
                className="flex-1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile (Optional)</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio / Website (Optional)</Label>
            <Input
              id="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              placeholder="https://johndoe.com"
            />
          </div>

          {/* CV Upload Section */}
          <div className="space-y-2">
            <Label>Resume / CV *</Label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="cv-upload"
              />
              
              {!cvFile ? (
                <label
                  htmlFor="cv-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX (Max 5MB)
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{cvFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(cvFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your CV will be stored securely and automatically deleted after 6 months.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter / Message</Label>
            <Textarea
              id="cover_letter"
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              rows={6}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full" 
            disabled={isLoading || isUploading || !cvFile}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading CV...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting this application, you agree to our privacy policy and terms of service.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
