'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Application, Profile } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Star, Linkedin, ExternalLink, Lock, Unlock, AlertCircle, History } from 'lucide-react'

interface PipelineCardProps {
  application: Application
  isDragging?: boolean
  currentUser?: Profile | null
  onLock?: (applicationId: string) => void
  onUnlock?: (applicationId: string) => void
}

export function PipelineCard({ 
  application, 
  isDragging, 
  currentUser,
  onLock,
  onUnlock
}: PipelineCardProps) {
  const isLocked = application.lock_status === 'locked' || application.lock_status === 'in_process'
  const isLockedByMe = application.locked_by === currentUser?.id
  const isAdmin = currentUser?.role === 'admin'
  const canUnlock = isLockedByMe || isAdmin
  const isLockedByOther = isLocked && !isLockedByMe && !isAdmin
  const wasRejectedOrDeclined = application.stage === 'rejected'
  const canReconsider = wasRejectedOrDeclined && application.lock_status === 'released'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: application.id,
    disabled: isLockedByOther,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const initials = application.candidate?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  const hasLinkedIn = !!application.candidate?.linkedin_url

  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked && canUnlock) {
      // Admin can unlock any lock, users can unlock their own
      onUnlock?.(application.id)
    } else if (!isLocked) {
      onLock?.(application.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isSortableDragging && 'opacity-50',
        isDragging && 'rotate-3 shadow-lg',
        isLockedByOther && 'cursor-not-allowed opacity-75'
      )}
    >
      <Card className={cn(
        "group overflow-hidden transition-all",
        isLockedByMe && "ring-2 ring-primary border-primary",
        isLockedByOther && "ring-2 ring-red-500 border-red-500 bg-red-50/50",
        canReconsider && "ring-2 ring-amber-500 border-amber-500 bg-amber-50/50",
        !isLocked && !canReconsider && "hover:shadow-md hover:border-primary/30"
      )}>
        <CardContent className="p-3">
          {/* Lock Status Banner */}
          {(isLocked || canReconsider) && (
            <div className={cn(
              "flex items-center gap-2 text-xs font-medium px-2 py-1 rounded mb-2 -mx-1 -mt-1",
              isLockedByMe && "bg-primary/10 text-primary",
              isLockedByOther && "bg-red-100 text-red-700",
              canReconsider && "bg-amber-100 text-amber-700"
            )}>
              {isLockedByMe && (
                <>
                  <Lock className="h-3 w-3" />
                  Locked by you
                </>
              )}
              {isLockedByOther && (
                <>
                  <Lock className="h-3 w-3" />
                  Locked by {application.locker?.full_name || 'another recruiter'}
                </>
              )}
              {canReconsider && (
                <>
                  <History className="h-3 w-3" />
                  Previously rejected - Can reconsider
                </>
              )}
            </div>
          )}

          <Link
            href={`/dashboard/candidates/${application.candidate_id}`}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm truncate hover:underline">
                    {application.candidate?.full_name}
                  </p>
                  {hasLinkedIn && (
                    <Linkedin className="h-3.5 w-3.5 text-linkedin flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {application.job?.title}
                </p>
              </div>
            </div>
          </Link>

          <div className="mt-3 flex items-center justify-between">
            {application.rating ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3 transition-colors',
                      i < application.rating!
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No rating</div>
            )}
            <Badge variant="outline" className="text-xs">
              {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
            </Badge>
          </div>

          {/* Actions Row */}
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            {hasLinkedIn && (
              <a
                href={application.candidate?.linkedin_url || ''}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-linkedin hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                LinkedIn
              </a>
            )}
            
            <div className="ml-auto flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 p-0",
                        isLockedByMe && "text-primary hover:text-primary",
                        (isLocked && !canUnlock) && "text-red-500 cursor-not-allowed",
                        (isLocked && isAdmin && !isLockedByMe) && "text-orange-500 hover:text-orange-600"
                      )}
                      onClick={handleLockToggle}
                      disabled={isLocked && !canUnlock}
                    >
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLockedByMe && "Click to release candidate"}
                    {isLocked && isAdmin && !isLockedByMe && `Click to unlock (locked by ${application.locker?.full_name || 'another recruiter'})`}
                    {isLocked && !canUnlock && `Locked by ${application.locker?.full_name || 'another recruiter'}`}
                    {!isLocked && "Click to lock candidate for processing"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/dashboard/candidates/${application.candidate_id}?tab=history`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <History className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>View candidate history</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Warning for reconsidering */}
          {canReconsider && (
            <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>This candidate was previously rejected. Check history before processing.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
