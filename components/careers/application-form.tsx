'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle2, Upload, FileText, X, Loader2, User, Mail, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ApplicationFormProps {
  jobId: string
  jobTitle: string
}

interface CandidateData {
  id: string
  full_name: string
  email: string
  phone: string
  resume_url: string | null
  cv_filename: string | null
  cv_size_bytes: number | null
  cv_uploaded_at: string | null
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingCandidate, setIsFetchingCandidate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [candidate, setCandidate] = useState<CandidateData | null>(null)
  
  // CV selection state
  const [cvOption, setCvOption] = useState<'existing' | 'new'>('existing')
  const [newCvFile, setNewCvFile] = useState<File | null>(null)

  // Fetch candidate data on mount
  useEffect(() => {
    const fetchCandidate = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please login to apply')
        setIsFetchingCandidate(false)
        return
      }

      // Get candidate record by email
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('id, full_name, email, phone, resume_url, cv_filename, cv_size_bytes, cv_uploaded_at')
        .eq('email', user.email)
        .single()

      if (candidateError || !candidateData) {
        setError('Candidate profile not found. Please complete your registration first.')
        setIsFetchingCandidate(false)
        return
      }

      setCandidate(candidateData)
      
      // If no existing CV, default to new upload
      if (!candidateData.resume_url) {
        setCvOption('new')
      }
      
      setIsFetchingCandidate(false)
    }

    fetchCandidate()
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF or Word document.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setError(null)
    setNewCvFile(file)
    setCvOption('new')
  }

  const handleRemoveFile = () => {
    setNewCvFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // If they had an existing CV, switch back to it
    if (candidate?.resume_url) {
      setCvOption('existing')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!candidate) {
      setError('Candidate profile not found')
      return
    }

    // Validate CV selection
    if (cvOption === 'new' && !newCvFile) {
      setError('Please upload a new CV or select your existing CV')
      return
    }

    if (cvOption === 'existing' && !candidate.resume_url) {
      setError('No existing CV found. Please upload a new CV.')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', candidate.id)
        .eq('job_id', jobId)
        .single()

      if (existingApplication) {
        setError('You have already applied for this position.')
        setIsLoading(false)
        return
      }

      let finalCvUrl = candidate.resume_url
      let finalCvFilename = candidate.cv_filename
      let finalCvSize = candidate.cv_size_bytes

      // If uploading new CV, upload it and delete old one
      if (cvOption === 'new' && newCvFile) {
        setIsUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('cv', newCvFile)
        
        // Pass old URL to delete it
        if (candidate.resume_url) {
          formDataUpload.append('oldUrl', candidate.resume_url)
        }
        
        const uploadResponse = await fetch('/api/upload-cv', {
          method: 'POST',
          body: formDataUpload,
        })
        
        const uploadResult = await uploadResponse.json()
        if (!uploadResponse.ok || uploadResult.error) {
          throw new Error(uploadResult.error || 'Failed to upload CV')
        }
        
        finalCvUrl = uploadResult.url
        finalCvFilename = newCvFile.name
        finalCvSize = newCvFile.size
        setIsUploading(false)

        // Update candidate record with new CV
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            resume_url: finalCvUrl,
            cv_filename: finalCvFilename,
            cv_size_bytes: finalCvSize,
            cv_uploaded_at: new Date().toISOString(),
          })
          .eq('id', candidate.id)

        if (updateError) {
          console.error('[v0] Failed to update candidate CV:', updateError)
        }
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidate.id,
          job_id: jobId,
          stage: 'applied',
        })

      if (applicationError) throw applicationError

      setIsSubmitted(true)
    } catch (err) {
      console.error('Application submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      if (errorMessage.includes('violates row-level security policy')) {
        setError('Unable to submit application. Please try again or contact support.')
      } else if (errorMessage.includes('duplicate key')) {
        setError('You have already applied for this position.')
      } else {
        setError('Unable to submit application. Please try again.')
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

  if (isFetchingCandidate) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </CardContent>
      </Card>
    )
  }

  if (!candidate) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-destructive">{error || 'Unable to load candidate profile'}</p>
            <Button className="mt-4" asChild>
              <a href="/candidate/register">Complete Registration</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Info Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Your Profile</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* CV Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select CV for this application *</Label>
            
            <RadioGroup
              value={cvOption}
              onValueChange={(value) => setCvOption(value as 'existing' | 'new')}
              className="space-y-3"
            >
              {/* Existing CV Option */}
              {candidate.resume_url && (
                <div className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${cvOption === 'existing' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                  <RadioGroupItem value="existing" id="existing-cv" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="existing-cv" className="block cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Use existing CV</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {candidate.cv_filename || 'Previously uploaded CV'}
                          </p>
                          {candidate.cv_uploaded_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              Uploaded {format(new Date(candidate.cv_uploaded_at), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Upload New CV Option */}
              <div className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${cvOption === 'new' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                <RadioGroupItem value="new" id="new-cv" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="new-cv" className="block cursor-pointer">
                    <p className="font-medium text-sm">Upload new CV</p>
                    <p className="text-xs text-muted-foreground">
                      {candidate.resume_url 
                        ? 'This will replace your existing CV' 
                        : 'Upload your CV to apply'}
                    </p>
                  </label>
                  
                  {cvOption === 'new' && (
                    <div className="mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="cv-upload"
                      />
                      
                      {!newCvFile ? (
                        <label
                          htmlFor="cv-upload"
                          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        >
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX (Max 5MB)
                          </span>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-[180px]">
                                {newCvFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(newCvFile.size)}
                              </p>
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
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isUploading || (cvOption === 'new' && !newCvFile)}
          >
            {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading CV...' : isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you confirm that your profile information is accurate.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
