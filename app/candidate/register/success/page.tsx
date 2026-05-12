'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Home, LogIn, Briefcase, Upload, FileText, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function RegistrationSuccessPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setCvFile(file)
  }

  const handleRemoveFile = () => {
    setCvFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleUploadCV = async () => {
    if (!cvFile) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login to upload your CV')
        setIsUploading(false)
        return
      }

      // Upload CV
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

      // Update candidate record with CV info
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_url: uploadResult.url,
          cv_uploaded_at: new Date().toISOString(),
          cv_filename: cvFile.name,
          cv_size_bytes: cvFile.size,
          is_cv_only: true,
        })
        .eq('email', user.email)

      if (updateError) {
        console.error('[v0] CV update error:', updateError)
        throw new Error('Failed to save CV information')
      }

      setUploadSuccess(true)
    } catch (err) {
      console.error('[v0] CV upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload CV')
    } finally {
      setIsUploading(false)
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

      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Pqwbqzr1lnrsrOSmNqst4Fcmq5AyS.png"
                alt="CPECC"
                width={70}
                height={70}
                className="h-16 w-auto"
              />
            </Link>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl text-green-700">Registration Successful!</CardTitle>
              <CardDescription className="mt-2">
                Your candidate account has been created. Please check your email to verify your account, then login to start applying for jobs.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CV Upload Section - Optional */}
            {!uploadSuccess && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Upload Your CV (Optional)</p>
                <p className="text-xs text-muted-foreground">
                  Upload your CV now to be added to our CV pool. Our recruiters can reach out to you for suitable positions.
                </p>
                
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
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Click to upload
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX (Max 5MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{cvFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(cvFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                {cvFile && (
                  <Button 
                    onClick={handleUploadCV} 
                    className="w-full"
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CV
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {uploadSuccess && (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">CV Uploaded Successfully!</p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your CV has been added to our pool. Our recruiters will reach out if there are suitable positions.
                </p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button asChild className="w-full">
                <Link href="/candidate/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login to Your Account
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/careers" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Browse Open Positions
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
