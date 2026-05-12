'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Upload, FileText, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Candidate } from '@/lib/types'

const COUNTRY_CODES = [
  { value: '+971', label: '+971 (UAE)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+968', label: '+968 (Oman)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
]

const CURRENCIES = ['AED', 'SAR', 'USD', 'INR', 'PKR', 'PHP', 'EGP', 'GBP', 'EUR']

interface CandidateProfileEditFormProps {
  candidate: Candidate
}

export function CandidateProfileEditForm({ candidate }: CandidateProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    full_name: candidate.full_name || '',
    country_code: candidate.country_code || '+971',
    phone: candidate.phone || '',
    whatsapp_number: candidate.whatsapp_number || '',
    home_country_code: candidate.home_country_code || '+91',
    home_country_phone: candidate.home_country_phone || '',
    nationality: candidate.nationality || '',
    current_location: candidate.current_location || '',
    current_company: candidate.current_company || '',
    current_job_title: candidate.current_job_title || '',
    current_salary: candidate.current_salary?.toString() || '',
    current_salary_currency: candidate.current_salary_currency || 'AED',
    expected_salary: candidate.expected_salary?.toString() || '',
    expected_salary_currency: candidate.expected_salary_currency || 'AED',
    notice_period_days: candidate.notice_period_days?.toString() || '30',
    linkedin_url: candidate.linkedin_url || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setCvFile(file)
  }

  const handleRemoveCv = () => {
    setCvFile(null)
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
    setSuccess(false)

    const supabase = createClient()

    try {
      let newCvUrl = candidate.resume_url
      let cvFilename = candidate.cv_filename
      let cvSize = candidate.cv_size_bytes

      // Upload new CV if provided
      if (cvFile) {
        setIsUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('cv', cvFile)
        
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
        newCvUrl = uploadResult.url
        cvFilename = cvFile.name
        cvSize = cvFile.size
        setIsUploading(false)
      }

      // Update candidate record
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          full_name: formData.full_name,
          country_code: formData.country_code,
          phone: formData.phone,
          whatsapp_number: formData.whatsapp_number,
          home_country_code: formData.home_country_code,
          home_country_phone: formData.home_country_phone,
          nationality: formData.nationality,
          current_location: formData.current_location,
          current_company: formData.current_company,
          current_job_title: formData.current_job_title,
          current_salary: formData.current_salary ? parseFloat(formData.current_salary) : null,
          current_salary_currency: formData.current_salary_currency,
          expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : null,
          expected_salary_currency: formData.expected_salary_currency,
          notice_period_days: formData.notice_period_days ? parseInt(formData.notice_period_days) : null,
          linkedin_url: formData.linkedin_url,
          resume_url: newCvUrl,
          cv_filename: cvFilename,
          cv_size_bytes: cvSize,
          cv_uploaded_at: cvFile ? new Date().toISOString() : candidate.cv_uploaded_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidate.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/candidate/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidate/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Edit Your Profile</h1>
          <p className="text-muted-foreground">Update your personal information and CV</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name (as per Passport) *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Numbers */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.country_code}
                      onValueChange={(v) => handleSelectChange('country_code', v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              {/* Home Country Phone */}
              <div className="space-y-2">
                <Label>Home Country Phone</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.home_country_code}
                    onValueChange={(v) => handleSelectChange('home_country_code', v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((code) => (
                        <SelectItem key={code.value} value={code.value}>
                          {code.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    name="home_country_phone"
                    value={formData.home_country_phone}
                    onChange={handleChange}
                    placeholder="Home country phone"
                  />
                </div>
              </div>

              {/* Location & Nationality */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_location">Current Location *</Label>
                  <Input
                    id="current_location"
                    name="current_location"
                    value={formData.current_location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your current employment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Company & Title */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current_company">Current Company</Label>
                  <Input
                    id="current_company"
                    name="current_company"
                    value={formData.current_company}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_job_title">Current Job Title</Label>
                  <Input
                    id="current_job_title"
                    name="current_job_title"
                    value={formData.current_job_title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Salary */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Salary</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.current_salary_currency}
                      onValueChange={(v) => handleSelectChange('current_salary_currency', v)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      name="current_salary"
                      type="number"
                      value={formData.current_salary}
                      onChange={handleChange}
                      placeholder="Monthly salary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expected Salary</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.expected_salary_currency}
                      onValueChange={(v) => handleSelectChange('expected_salary_currency', v)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      name="expected_salary"
                      type="number"
                      value={formData.expected_salary}
                      onChange={handleChange}
                      placeholder="Expected monthly salary"
                    />
                  </div>
                </div>
              </div>

              {/* Notice Period */}
              <div className="space-y-2">
                <Label htmlFor="notice_period_days">Notice Period (Days)</Label>
                <Input
                  id="notice_period_days"
                  name="notice_period_days"
                  type="number"
                  value={formData.notice_period_days}
                  onChange={handleChange}
                  placeholder="30"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resume / CV</CardTitle>
              <CardDescription>
                {candidate.resume_url 
                  ? 'Upload a new CV to replace your existing one'
                  : 'Upload your CV for job applications'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current CV */}
              {candidate.cv_filename && !cvFile && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{candidate.cv_filename}</p>
                      <p className="text-xs text-muted-foreground">Current CV</p>
                    </div>
                  </div>
                </div>
              )}

              {/* New CV Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleCvSelect}
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
                      Click to upload a new CV
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX (Max 5MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {cvFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(cvFile.size)} - New CV
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCv}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
              <p className="text-sm text-green-600">Profile updated successfully! Redirecting...</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/candidate/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading CV...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}
