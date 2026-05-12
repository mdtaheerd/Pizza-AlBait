'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MessageSquare, Pencil, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import type { Profile } from '@/lib/types'

interface CandidateRemarksProps {
  applicationId: string
  recruiterRemarks: string | null
  recruiterRemarksUpdatedAt: string | null
  hmRemarks: string | null
  hmRemarksUpdatedAt: string | null
  currentUser: Profile
}

export function CandidateRemarks({
  applicationId,
  recruiterRemarks,
  recruiterRemarksUpdatedAt,
  hmRemarks,
  hmRemarksUpdatedAt,
  currentUser,
}: CandidateRemarksProps) {
  const router = useRouter()
  const [isEditingRecruiter, setIsEditingRecruiter] = useState(false)
  const [isEditingHM, setIsEditingHM] = useState(false)
  const [recruiterText, setRecruiterText] = useState(recruiterRemarks || '')
  const [hmText, setHMText] = useState(hmRemarks || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRecruiter = currentUser.role === 'recruiter' || currentUser.role === 'admin'
  const isHiringManager = currentUser.role === 'hiring_manager' || currentUser.role === 'admin'

  const handleSaveRecruiterRemarks = async () => {
    if (recruiterText.length > 350) {
      setError('Recruiter remarks cannot exceed 350 characters')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          recruiter_remarks: recruiterText || null,
          recruiter_remarks_updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (updateError) throw updateError

      setIsEditingRecruiter(false)
      router.refresh()
    } catch (err) {
      console.error('[v0] Error saving recruiter remarks:', err)
      setError('Failed to save remarks')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveHMRemarks = async () => {
    if (hmText.length > 350) {
      setError('Hiring manager remarks cannot exceed 350 characters')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          hm_remarks: hmText || null,
          hm_remarks_updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (updateError) throw updateError

      setIsEditingHM(false)
      router.refresh()
    } catch (err) {
      console.error('[v0] Error saving HM remarks:', err)
      setError('Failed to save remarks')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Processing Remarks
        </CardTitle>
        <CardDescription>
          Internal comments visible to recruiters, hiring managers, and admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recruiter Remarks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Recruiter/HRBP
              </Badge>
              {recruiterRemarksUpdatedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {format(new Date(recruiterRemarksUpdatedAt), 'MMM d, yyyy h:mm a')}
                </span>
              )}
            </div>
            {isRecruiter && !isEditingRecruiter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingRecruiter(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {recruiterRemarks ? 'Edit' : 'Add'}
              </Button>
            )}
          </div>

          {isEditingRecruiter ? (
            <div className="space-y-2">
              <Textarea
                value={recruiterText}
                onChange={(e) => setRecruiterText(e.target.value)}
                placeholder="Enter your remarks about the candidate (max 350 characters)"
                maxLength={350}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {recruiterText.length}/350 characters
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingRecruiter(false)
                      setRecruiterText(recruiterRemarks || '')
                    }}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRecruiterRemarks}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-3">
              {recruiterRemarks ? (
                <p className="text-sm whitespace-pre-wrap">{recruiterRemarks}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No remarks added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Hiring Manager Remarks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Hiring Manager
              </Badge>
              {hmRemarksUpdatedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {format(new Date(hmRemarksUpdatedAt), 'MMM d, yyyy h:mm a')}
                </span>
              )}
            </div>
            {isHiringManager && !isEditingHM && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingHM(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {hmRemarks ? 'Edit' : 'Add'}
              </Button>
            )}
          </div>

          {isEditingHM ? (
            <div className="space-y-2">
              <Textarea
                value={hmText}
                onChange={(e) => setHMText(e.target.value)}
                placeholder="Enter your remarks about the candidate (max 350 characters)"
                maxLength={350}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {hmText.length}/350 characters
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingHM(false)
                      setHMText(hmRemarks || '')
                    }}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveHMRemarks}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-3">
              {hmRemarks ? (
                <p className="text-sm whitespace-pre-wrap">{hmRemarks}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No remarks added yet</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
