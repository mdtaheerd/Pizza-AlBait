'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Pencil, Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CandidateRemarksProps {
  applicationId: string
  recruiterRemarks?: string | null
  hiringManagerRemarks?: string | null
  currentUser?: {
    id: string
    role: string
  } | null
}

export function CandidateRemarks({
  applicationId,
  recruiterRemarks,
  hiringManagerRemarks,
  currentUser
}: CandidateRemarksProps) {
  const [isEditingRecruiter, setIsEditingRecruiter] = useState(false)
  const [isEditingHM, setIsEditingHM] = useState(false)
  const [recruiterText, setRecruiterText] = useState(recruiterRemarks || '')
  const [hmText, setHmText] = useState(hiringManagerRemarks || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const isRecruiter = currentUser?.role === 'admin' || currentUser?.role === 'recruiter'
  const isHiringManager = currentUser?.role === 'admin' || currentUser?.role === 'hiring_manager'

  const handleSaveRecruiter = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('applications')
        .update({ recruiter_remarks: recruiterText })
        .eq('id', applicationId)
      setIsEditingRecruiter(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to save recruiter remarks:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveHM = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('applications')
        .update({ hiring_manager_remarks: hmText })
        .eq('id', applicationId)
      setIsEditingHM(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to save hiring manager remarks:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 space-y-4 border-t pt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Processing Remarks</span>
        <span className="text-xs">Internal comments visible to recruiters, hiring managers, and admin</span>
      </div>

      {/* Recruiter/HRBP Remarks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">Recruiter/HRBP</Badge>
          {isRecruiter && !isEditingRecruiter && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('[v0] Clicked Add for Recruiter')
                setIsEditingRecruiter(true)
              }}
              className="h-7 text-xs"
            >
              <Pencil className="h-3 w-3 mr-1" />
              {recruiterRemarks ? 'Edit' : 'Add'}
            </Button>
          )}
        </div>
        {isEditingRecruiter ? (
          <div className="space-y-2">
            <Textarea
              value={recruiterText}
              onChange={(e) => setRecruiterText(e.target.value)}
              placeholder="Enter recruiter remarks..."
              className="min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveRecruiter} disabled={saving}>
                <Save className="h-3 w-3 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsEditingRecruiter(false)
                setRecruiterText(recruiterRemarks || '')
              }}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {recruiterRemarks || 'No remarks added yet'}
          </p>
        )}
      </div>

      {/* Hiring Manager Remarks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs bg-blue-50">Hiring Manager</Badge>
          {isHiringManager && !isEditingHM && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('[v0] Clicked Add for Hiring Manager')
                setIsEditingHM(true)
              }}
              className="h-7 text-xs"
            >
              <Pencil className="h-3 w-3 mr-1" />
              {hiringManagerRemarks ? 'Edit' : 'Add'}
            </Button>
          )}
        </div>
        {isEditingHM ? (
          <div className="space-y-2">
            <Textarea
              value={hmText}
              onChange={(e) => setHmText(e.target.value)}
              placeholder="Enter hiring manager remarks..."
              className="min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveHM} disabled={saving}>
                <Save className="h-3 w-3 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsEditingHM(false)
                setHmText(hiringManagerRemarks || '')
              }}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {hiringManagerRemarks || 'No remarks added yet'}
          </p>
        )}
      </div>
    </div>
  )
}
