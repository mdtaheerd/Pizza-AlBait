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
import { CheckCircle2, Upload, FileText, X, Loader2 } from 'lucide-react'

interface ApplicationFormProps {
  jobId: string
  jobTitle: string
}

// Common nationalities for the dropdown
const NATIONALITIES = [
  'Emirati',
  'Saudi',
  'Qatari',
  'Kuwaiti',
  'Bahraini',
  'Omani',
  'Egyptian',
  'Jordanian',
  'Lebanese',
  'Syrian',
  'Iraqi',
  'Palestinian',
  'Yemeni',
  'Sudanese',
  'Moroccan',
  'Algerian',
  'Tunisian',
  'Libyan',
  'Indian',
  'Pakistani',
  'Bangladeshi',
  'Sri Lankan',
  'Nepali',
  'Filipino',
  'Indonesian',
  'Malaysian',
  'Thai',
  'Vietnamese',
  'Chinese',
  'Japanese',
  'Korean',
  'British',
  'American',
  'Canadian',
  'Australian',
  'French',
  'German',
  'Italian',
  'Spanish',
  'Dutch',
  'Russian',
  'Turkish',
  'Iranian',
  'Afghan',
  'South African',
  'Nigerian',
  'Kenyan',
  'Ghanaian',
  'Ethiopian',
  'Brazilian',
  'Mexican',
  'Colombian',
  'Argentine',
]

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [showOtherNationality, setShowOtherNationality] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
    gender: '',
    nationality: '',
    current_location: '',
    current_company: '',
    current_job_title: '',
    referral_type: '' as 'cpecc_employee' | 'adnoc' | 'none' | '',
    referral_name: '',
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

      // Upload CV first if provided (before any database operations)
      if (cvFile) {
        setIsUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('cv', cvFile)
        
        const uploadResponse = await fetch('/api/upload-cv', {
          method: 'POST',
          body: formDataUpload,
        })
        
        const uploadResult = await uploadResponse.json()
        if (!uploadResponse.ok || uploadResult.error) {
          throw new Error(uploadResult.error || 'Failed to upload CV')
        }
        uploadedCvUrl = uploadResult.url
        setIsUploading(false)
      }

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

        // Update candidate with new info (including CV, gender, nationality if provided)
        const updateData: Record<string, unknown> = {
          // Always update these fields if provided in the form
          full_name: formData.full_name,
          phone: formData.phone || null,
          whatsapp_number: formData.whatsapp_number || null,
          linkedin_url: formData.linkedin_url || null,
          portfolio_url: formData.portfolio_url || null,
          current_location: formData.current_location || null,
          current_company: formData.current_company || null,
          current_job_title: formData.current_job_title || null,
          referral_type: formData.referral_type || null,
          referral_name: formData.referral_name || null,
          gender: formData.gender || null,
          nationality: formData.nationality || null,
        }
        
        // Update CV info if uploaded
        if (uploadedCvUrl) {
          updateData.resume_url = uploadedCvUrl
          updateData.cv_uploaded_at = new Date().toISOString()
          updateData.cv_filename = cvFile?.name
          updateData.cv_size_bytes = cvFile?.size
        }

        const { error: updateError } = await supabase
          .from('candidates')
          .update(updateData)
          .eq('id', candidateId)
        
        if (updateError) {
          throw updateError
        }
      } else {
        // Create new candidate with CV info
        const { data: newCandidate, error: candidateError } = await supabase
          .from('candidates')
          .insert({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            whatsapp_number: formData.whatsapp_number || null,
            linkedin_url: formData.linkedin_url || null,
            portfolio_url: formData.portfolio_url || null,
            gender: formData.gender,
            nationality: formData.nationality,
            current_location: formData.current_location || null,
            current_company: formData.current_company || null,
            current_job_title: formData.current_job_title || null,
            referral_type: formData.referral_type || null,
            referral_name: formData.referral_name || null,
            source: 'career_page',
            resume_url: uploadedCvUrl || null,
            cv_uploaded_at: uploadedCvUrl ? new Date().toISOString() : null,
            cv_filename: cvFile?.name || null,
            cv_size_bytes: cvFile?.size || null
          })
          .select('id')
          .single()

        if (candidateError) throw candidateError
        candidateId = newCandidate.id
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
      console.error('Application submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      // Provide user-friendly error messages
      if (errorMessage.includes('violates row-level security policy')) {
        setError('Unable to submit application. Please try again or contact support.')
      } else if (errorMessage.includes('duplicate key')) {
        setError('You have already applied for this position.')
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        setError('Network error. Please check your internet connection and try again.')
      } else if (errorMessage.includes('upload') || errorMessage.includes('CV')) {
        setError('Failed to upload your CV. Please try a different file or contact support.')
      } else {
        setError('Unable to submit application. Please try again or contact support.')
      }
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
              <Label htmlFor="full_name">Full Name (as per Passport) *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value.toUpperCase() })}
                placeholder="JOHN DOE"
                className="uppercase"
                required
              />
              <p className="text-xs text-muted-foreground">Enter your name exactly as it appears on your passport</p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+971 50 123 4567"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_location">Current Location *</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="Dubai, UAE"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company *</Label>
              <Input
                id="current_company"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                placeholder="Company Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_job_title">Current Job Title *</Label>
              <Input
                id="current_job_title"
                value={formData.current_job_title}
                onChange={(e) => setFormData({ ...formData, current_job_title: e.target.value })}
                placeholder="Your current position"
                required
              />
            </div>
          </div>

          {/* Referral Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="referral_type">Referral *</Label>
              <Select
                value={formData.referral_type}
                onValueChange={(value) => setFormData({ ...formData, referral_type: value as 'cpecc_employee' | 'adnoc' | 'none', referral_name: value === 'none' ? '' : formData.referral_name })}
                required
              >
                <SelectTrigger id="referral_type">
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpecc_employee">CPECC Employee</SelectItem>
                  <SelectItem value="adnoc">ADNOC</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.referral_type === 'cpecc_employee' || formData.referral_type === 'adnoc') && (
              <div className="space-y-2">
                <Label htmlFor="referral_name">Referral Name *</Label>
                <Input
                  id="referral_name"
                  value={formData.referral_name}
                  onChange={(e) => setFormData({ ...formData, referral_name: e.target.value })}
                  placeholder={formData.referral_type === 'cpecc_employee' ? "CPECC employee's name" : "ADNOC contact's name"}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio / Website</Label>
            <Input
              id="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              placeholder="https://johndoe.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              {!showOtherNationality ? (
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => {
                    if (value === 'other') {
                      setShowOtherNationality(true)
                      setFormData({ ...formData, nationality: '' })
                    } else {
                      setFormData({ ...formData, nationality: value })
                    }
                  }}
                  required
                >
                  <SelectTrigger id="nationality">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="text-muted-foreground">
                      Other (specify)
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Enter your nationality"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setShowOtherNationality(false)
                      setFormData({ ...formData, nationality: '' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
            disabled={isLoading || isUploading || !cvFile || !formData.gender || !formData.nationality || !formData.current_location || !formData.current_company || !formData.current_job_title || !formData.referral_type || !formData.whatsapp_number || (formData.referral_type !== 'none' && !formData.referral_name)}
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
