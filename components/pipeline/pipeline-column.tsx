'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { Application, Profile } from '@/lib/types'
import { PipelineCard } from './pipeline-card'

interface PipelineColumnProps {
  id: string
  title: string
  count: number
  applications: Application[]
  currentUser?: Profile | null
  onLock?: (applicationId: string) => void
  onUnlock?: (applicationId: string) => void
}

export function PipelineColumn({ 
  id, 
  title, 
  count, 
  applications,
  currentUser,
  onLock,
  onUnlock
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Count locked applications in this column
  const lockedCount = applications.filter(
    app => app.lock_status === 'locked' || app.lock_status === 'in_process'
  ).length

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full w-72 flex-shrink-0 flex-col rounded-lg bg-muted/50',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 rounded-t-lg">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {lockedCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-medium px-2">
              {lockedCount} locked
            </span>
          )}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {count}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {applications.map((application) => (
            <PipelineCard 
              key={application.id} 
              application={application}
              currentUser={currentUser}
              onLock={onLock}
              onUnlock={onUnlock}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
