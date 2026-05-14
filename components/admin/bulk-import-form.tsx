'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle, XCircle, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

interface Department {
  id: string
  name: string
}

interface BulkImportFormProps {
  departments: Department[]
}

interface ImportResult {
  email: string
  name: string
  role: string
  status: 'success' | 'error'
  message: string
}

export function BulkImportForm({ departments }: BulkImportFormProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const users: { name: string; email: string; role: string }[] = []
    
    for (const line of lines) {
      // Support formats:
      // name, email, role
      // name | email | role
      // name; email; role
      const parts = line.split(/[,|;]/).map(p => p.trim())
      
      if (parts.length >= 3) {
        const [name, email, roleInput] = parts
        const role = roleInput.toLowerCase()
        
        // Validate role
        const validRoles = ['recruiter', 'hrbp', 'recruiter/hrbp', 'hiring_manager', 'hiring manager']
        const normalizedRole = validRoles.includes(role) 
          ? (role === 'recruiter' || role === 'hrbp' || role === 'recruiter/hrbp' ? 'recruiter' : 'hiring_manager')
          : null
        
        if (normalizedRole && email.includes('@')) {
          users.push({ name, email, role: normalizedRole })
        }
      }
    }
    
    return users
  }

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    setResults([])
    
    const users = parseInput(input)
    
    if (users.length === 0) {
      setError('No valid users found. Please check the format: Name, Email, Role (one per line)')
      setLoading(false)
      return
    }
    
    const importResults: ImportResult[] = []
    
    for (const user of users) {
      try {
        // Create user via Supabase Auth Admin API
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            full_name: user.name,
            role: user.role
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          importResults.push({
            email: user.email,
            name: user.name,
            role: user.role,
            status: 'success',
            message: 'User created and approved. Password reset email sent.'
          })
        } else {
          importResults.push({
            email: user.email,
            name: user.name,
            role: user.role,
            status: 'error',
            message: data.error || 'Failed to create user'
          })
        }
      } catch (err: any) {
        importResults.push({
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'error',
          message: err.message || 'Unknown error'
        })
      }
    }
    
    setResults(importResults)
    setLoading(false)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Import Users
          </CardTitle>
          <CardDescription>
            Paste a list of users to import. Each line should contain: Name, Email, Role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="users">User List</Label>
            <Textarea
              id="users"
              placeholder={`Example format (one user per line):
John Smith, john.smith@company.com, Recruiter
Jane Doe, jane.doe@company.com, Hiring Manager
Ahmed Khan, ahmed.khan@company.com, HRBP`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supported roles: Recruiter, HRBP, Recruiter/HRBP, Hiring Manager
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={loading || !input.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Link href="/dashboard/users">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              {successCount} successful, {errorCount} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    result.status === 'success' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.email} • {result.role}</p>
                    <p className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
