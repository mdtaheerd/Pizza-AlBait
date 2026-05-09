'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import type { Application, ApplicationStage, Profile } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/types'
import { PipelineColumn } from './pipeline-column'
import { PipelineCard } from './pipeline-card'
import { toast } from 'sonner'

interface PipelineBoardProps {
  applications: Application[]
  currentUser?: Profile | null
}

const STAGES: ApplicationStage[] = [
  'applied',
  'screening',
  'interview',
  'assessment',
  'offer',
  'hired',
  'rejected',
]

export function PipelineBoard({ applications: initialApplications, currentUser }: PipelineBoardProps) {
  const router = useRouter()
  const [applications, setApplications] = useState(initialApplications)
  const [activeApplication, setActiveApplication] = useState<Application | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const getApplicationsByStage = (stage: ApplicationStage) => {
    return applications.filter((app) => app.stage === stage)
  }

  const handleLockApplication = useCallback(async (applicationId: string) => {
    if (!currentUser) return

    const supabase = createClient()
    
    // Call the lock function
    const { data, error } = await supabase.rpc('lock_application', {
      p_application_id: applicationId,
      p_user_id: currentUser.id
    })

    if (error) {
      toast.error('Failed to lock candidate', {
        description: error.message
      })
      return
    }

    if (!data) {
      toast.error('Candidate already locked', {
        description: 'Another recruiter is already processing this candidate.'
      })
      return
    }

    // Update local state
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId 
          ? { ...app, lock_status: 'locked', locked_by: currentUser.id, locker: currentUser } 
          : app
      )
    )

    toast.success('Candidate locked', {
      description: 'You can now process this candidate exclusively.'
    })

    router.refresh()
  }, [currentUser, router])

  const handleUnlockApplication = useCallback(async (applicationId: string) => {
    if (!currentUser) return

    const supabase = createClient()
    
    // Call the release function
    const { data, error } = await supabase.rpc('release_application', {
      p_application_id: applicationId,
      p_user_id: currentUser.id,
      p_reason: 'Released by recruiter'
    })

    if (error) {
      toast.error('Failed to release candidate', {
        description: error.message
      })
      return
    }

    // Update local state
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId 
          ? { ...app, lock_status: 'released', locked_by: null, locker: null } 
          : app
      )
    )

    toast.success('Candidate released', {
      description: 'Other recruiters can now process this candidate.'
    })

    router.refresh()
  }, [currentUser, router])

  const handleDragStart = (event: DragStartEvent) => {
    const application = applications.find((app) => app.id === event.active.id)
    if (application) {
      // Check if locked by another user
      const isLockedByOther = 
        (application.lock_status === 'locked' || application.lock_status === 'in_process') && 
        application.locked_by !== currentUser?.id

      if (isLockedByOther) {
        toast.error('Cannot move candidate', {
          description: `This candidate is locked by ${application.locker?.full_name || 'another recruiter'}.`
        })
        return
      }
      setActiveApplication(application)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveApplication(null)

    if (!over) return

    const applicationId = active.id as string
    const newStage = over.id as ApplicationStage

    const application = applications.find((app) => app.id === applicationId)
    if (!application || application.stage === newStage) return

    // Check if locked by another user
    const isLockedByOther = 
      (application.lock_status === 'locked' || application.lock_status === 'in_process') && 
      application.locked_by !== currentUser?.id

    if (isLockedByOther) {
      toast.error('Cannot move candidate', {
        description: `This candidate is locked by ${application.locker?.full_name || 'another recruiter'}.`
      })
      return
    }

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, stage: newStage } : app
      )
    )

    // Update in database
    const supabase = createClient()
    const { error } = await supabase
      .from('applications')
      .update({ 
        stage: newStage,
        // Auto-lock when moving to screening or beyond
        ...(newStage !== 'applied' && !application.locked_by && currentUser ? {
          locked_by: currentUser.id,
          locked_at: new Date().toISOString(),
          lock_status: 'in_process'
        } : {})
      })
      .eq('id', applicationId)

    if (error) {
      // Revert on error
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, stage: application.stage } : app
        )
      )
      toast.error('Failed to update stage', {
        description: error.message
      })
    } else {
      toast.success('Stage updated', {
        description: `Candidate moved to ${STAGE_LABELS[newStage]}`
      })
      router.refresh()
    }
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed p-12">
        <div className="text-center">
          <p className="text-muted-foreground">
            No applications in the pipeline yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Candidates will appear here when they apply to your jobs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApplications = getApplicationsByStage(stage)
          return (
            <SortableContext
              key={stage}
              id={stage}
              items={stageApplications.map((app) => app.id)}
              strategy={verticalListSortingStrategy}
            >
              <PipelineColumn
                id={stage}
                title={STAGE_LABELS[stage]}
                count={stageApplications.length}
                applications={stageApplications}
                currentUser={currentUser}
                onLock={handleLockApplication}
                onUnlock={handleUnlockApplication}
              />
            </SortableContext>
          )
        })}
      </div>

      <DragOverlay>
        {activeApplication && (
          <PipelineCard 
            application={activeApplication} 
            isDragging 
            currentUser={currentUser}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
