'use client'

import { useState } from 'react'
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
import { Loader2, Home, Check, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRY_CODES, COUNTRIES, CURRENCY_OPTIONS, SalaryCurrency } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function CandidateRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nationalityOpen, setNationalityOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    country_code: '+971',
    phone: '',
    nationality: '',
    current_salary: '',
    current_salary_currency: 'AED' as SalaryCurrency,
    expected_salary: '',
    expected_salary_currency: 'AED' as SalaryCurrency,
    notice_period_days: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name || !formData.phone) {
      setError('Please fill in all required fields')
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
      // 1. Sign up the user
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

      // 3. Create the candidate record
      const { error: candidateError } = await supabase
        .from('candidates')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          country_code: formData.country_code,
          phone: formData.phone,
          nationality: formData.nationality || null,
          current_salary: parseFloat(formData.current_salary),
          current_salary_currency: formData.current_salary_currency,
          expected_salary: parseFloat(formData.expected_salary),
          expected_salary_currency: formData.expected_salary_currency,
          notice_period_days: parseInt(formData.notice_period_days),
          user_id: authData.user.id,
          source: 'career_page',
        })

      if (candidateError) {
        console.error('[v0] Candidate creation error:', candidateError)
        throw new Error('Failed to create candidate profile')
      }

      // Redirect to candidate dashboard or success page
      router.push('/candidate/register/success')
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hdNTqit9D9oEqOX2PeHJoQmOeK7S4W.png"
                alt="CPECC - China Petroleum Engineering & Construction Corporation"
                width={280}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <div>
              <CardTitle className="text-xl">Create Candidate Account</CardTitle>
              <CardDescription>
                Register to apply for jobs at CPECC
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
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

              {/* Nationality - Searchable Combobox */}
              <div className="space-y-2">
                <Label>Nationality (Optional)</Label>
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
                              key={country}
                              value={country}
                              onSelect={() => {
                                setFormData({ ...formData, nationality: country })
                                setNationalityOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.nationality === country ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
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
