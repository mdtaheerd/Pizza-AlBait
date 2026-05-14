'use client'

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, Home, Check, ChevronsUpDown, Upload, FileText, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRY_CODES, COUNTRIES, CURRENCY_OPTIONS, SalaryCurrency } from '@/lib/types'
import { cn } from '@/lib/utils'

function CandidateRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nationalityOpen, setNationalityOpen] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    gender: '',
    country_code: '+971',
    phone: '',
    whatsapp_number: '',
    home_country_code: '+91',
    home_country_phone: '',
    nationality: '',
    current_location: '',
    current_company: '',
    current_job_title: '',
    referral_type: '' as 'cpecc_employee' | 'adnoc' | 'none' | '',
    referral_name: '',
    current_salary: '',
    current_salary_currency: 'AED' as SalaryCurrency,
    expected_salary: '',
    expected_salary_currency: 'AED' as SalaryCurrency,
    notice_period_days: '',
  })

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
    setCvUrl(null)
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

    // Validate CV is uploaded
    if (!cvFile) {
      setError('Please upload your CV/Resume')
      setIsLoading(false)
      return
    }

    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name || !formData.phone || !formData.gender || !formData.nationality) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    // Validate new mandatory fields
    if (!formData.whatsapp_number || !formData.current_location || !formData.current_company || !formData.current_job_title || !formData.referral_type) {
      setError('Please fill in all required fields including WhatsApp, current location, company, job title and referral')
      setIsLoading(false)
      return
    }

    // Validate referral name if referral type is not 'none'
    if (formData.referral_type !== 'none' && !formData.referral_name) {
      setError('Please provide the referral name')
      setIsLoading(false)
      return
    }

    // Validate home country phone (mandatory)
    if (!formData.home_country_phone) {
      setError('Home country contact number is required')
      setIsLoading(false)
      return
    }

    // Validate mandatory salary and notice period fields
    if (!formData.current_salary || !formData.expected_salary || !formData.notice_period_days) {
      setError('Current salary, expected salary, and notice period are required')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // 1. Upload CV first
      setIsUploading(true)
      let uploadedCvUrl: string | null = null
      let cvFilename: string | null = null
      let cvSize: number | null = null
      
      if (cvFile) {
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
        cvFilename = cvFile.name
        cvSize = cvFile.size
      }
      setIsUploading(false)

      // 2. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'candidate',
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // 2. Create the candidate profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: 'candidate',
          approval_status: 'approved', // Candidates don't need approval
        })

      if (profileError) {
        console.error('[v0] Profile creation error:', profileError)
      }

      // 4. Create the candidate record with CV info
      const { error: candidateError } = await supabase
        .from('candidates')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          gender: formData.gender,
          country_code: formData.country_code,
          phone: formData.phone,
          whatsapp_number: formData.whatsapp_number,
          home_country_code: formData.home_country_code,
          home_country_phone: formData.home_country_phone,
          nationality: formData.nationality,
          current_location: formData.current_location,
          current_company: formData.current_company,
          current_job_title: formData.current_job_title,
          referral_type: formData.referral_type,
          referral_name: formData.referral_type !== 'none' ? formData.referral_name : null,
          current_salary: parseFloat(formData.current_salary),
          current_salary_currency: formData.current_salary_currency,
          expected_salary: parseFloat(formData.expected_salary),
          expected_salary_currency: formData.expected_salary_currency,
          notice_period_days: parseInt(formData.notice_period_days),
          user_id: authData.user.id,
          source: 'career_page',
          resume_url: uploadedCvUrl,
          cv_filename: cvFilename,
          cv_size_bytes: cvSize,
          cv_uploaded_at: uploadedCvUrl ? new Date().toISOString() : null,
        })

      if (candidateError) {
        console.error('[v0] Candidate creation error:', candidateError)
        throw new Error('Failed to create candidate profile')
      }

      // Redirect to candidate dashboard or success page
      redirectUrl ? window.location.href = redirectUrl : router.push('/candidate/register/success')
    } catch (err) {
      console.error('[v0] Registration error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-6 md:p-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      
      {/* Home Button */}
      <div className="absolute top-6 left-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-lg">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={200}
                height={60}
                className="h-14 w-auto"
              />
            </Link>
            <div>
              <CardTitle className="text-xl">Create Candidate Account</CardTitle>
              <CardDescription>
                Register to apply for jobs
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              {/* Phone - Current Location */}
              <div className="space-y-2">
                <Label htmlFor="phone">Current Location Phone *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.country_code}
                    onValueChange={(value) => setFormData({ ...formData, country_code: value })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code}
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

              {/* WhatsApp Number */}
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

              {/* Home Country Phone - Mandatory */}
              <div className="space-y-2">
                <Label htmlFor="home_country_phone">Home Country Contact Number *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.home_country_code}
                    onValueChange={(value) => setFormData({ ...formData, home_country_code: value })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="home_country_phone"
                    type="tel"
                    value={formData.home_country_phone}
                    onChange={(e) => setFormData({ ...formData, home_country_phone: e.target.value })}
                    placeholder="9876543210"
                    className="flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your permanent home country contact number
                </p>
              </div>

              {/* Nationality - Searchable Combobox */}
              <div className="space-y-2">
                <Label>Nationality *</Label>
                <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nationalityOpen}
                      className="w-full justify-between font-normal"
                    >
                      {formData.nationality || "Select nationality..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Type to search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {COUNTRIES.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.name}
                              onSelect={() => {
                                setFormData({ ...formData, nationality: country.name })
                                setNationalityOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.nationality === country.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country.flag} {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Current Location */}
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

              {/* Current Company & Job Title */}
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
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2 pt-2">
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

              {/* Salary & Notice Period - Mandatory */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium pt-2">Salary & Notice Period *</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current_salary">Current Salary (Monthly) *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.current_salary_currency}
                        onValueChange={(value) => setFormData({ ...formData, current_salary_currency: value as SalaryCurrency })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="current_salary"
                        type="number"
                        value={formData.current_salary}
                        onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                        placeholder="Amount"
                        className="flex-1"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">Expected Salary (Monthly) *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.expected_salary_currency}
                        onValueChange={(value) => setFormData({ ...formData, expected_salary_currency: value as SalaryCurrency })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="expected_salary"
                        type="number"
                        value={formData.expected_salary}
                        onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                        placeholder="Amount"
                        className="flex-1"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice_period_days">Notice Period (Days) *</Label>
                  <Input
                    id="notice_period_days"
                    type="number"
                    min="0"
                    value={formData.notice_period_days}
                    onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
                    placeholder="e.g., 30, 60, 90"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 0 if you can join immediately
                  </p>
                </div>
              </div>

              {/* CV Upload Section */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium pt-2">Resume / CV *</p>
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
                        Click to upload your CV
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX (Max 5MB)
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {cvFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(cvFile.size)}
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
                <p className="text-xs text-muted-foreground">
                  Your CV will be used for all job applications. You can update it anytime.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/candidate/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CandidateRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CandidateRegisterForm />
    </Suspense>
  )
}
