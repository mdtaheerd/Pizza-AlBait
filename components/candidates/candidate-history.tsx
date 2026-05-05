'use client'

import { formatDistanceToNow } from 'date-fns'
import { CandidateHistory, HISTORY_ACTION_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  MessageSquare,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'

interface CandidateHistoryTimelineProps {
  history: CandidateHistory[]
}

const actionIcons: Record<string, React.ElementType> = {
  applied: FileText,
  screened: CheckCircle,
  interviewed: User,
  assessed: FileText,
  offered: CheckCircle,
  hired: CheckCircle,
  rejected: XCircle,
  offer_declined: AlertTriangle,
  withdrawn: XCircle,
  locked: Lock,
  unlocked: Unlock,
  reassigned: ArrowRight,
  note_added: MessageSquare,
}

const actionColors: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-600 border-slate-200',
  screened: 'bg-blue-100 text-blue-600 border-blue-200',
  interviewed: 'bg-amber-100 text-amber-600 border-amber-200',
  assessed: 'bg-purple-100 text-purple-600 border-purple-200',
  offered: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  hired: 'bg-green-100 text-green-600 border-green-200',
  rejected: 'bg-red-100 text-red-600 border-red-200',
  offer_declined: 'bg-orange-100 text-orange-600 border-orange-200',
  withdrawn: 'bg-gray-100 text-gray-600 border-gray-200',
  locked: 'bg-red-100 text-red-600 border-red-200',
  unlocked: 'bg-green-100 text-green-600 border-green-200',
  reassigned: 'bg-blue-100 text-blue-600 border-blue-200',
  note_added: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function CandidateHistoryTimeline({ history }: CandidateHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Candidate History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No history records found for this candidate.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Candidate History
          <Badge variant="secondary" className="ml-auto">
            {history.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {history.map((event, index) => {
              const Icon = actionIcons[event.action_type] || FileText
              const colorClass = actionColors[event.action_type] || 'bg-slate-100 text-slate-600'
              
              return (
                <div key={event.id} className="relative pl-8">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="font-medium text-sm">
                          {HISTORY_ACTION_LABELS[event.action_type]}
                        </span>
                        {event.job && (
                          <span className="text-muted-foreground text-sm ml-1">
                            for {event.job.title}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {event.actor && (
                      <p className="text-xs text-muted-foreground mb-1">
                        By: {event.actor.full_name || event.actor.email}
                      </p>
                    )}
                    
                    {event.previous_stage && event.new_stage && (
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <Badge variant="outline" className="text-xs">
                          {event.previous_stage}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {event.new_stage}
                        </Badge>
                      </div>
                    )}
                    
                    {event.notes && (
                      <p className="text-sm text-muted-foreground bg-background rounded p-2 mt-2">
                        {event.notes}
                      </p>
                    )}
                    
                    {event.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="font-medium text-red-700">Rejection Reason: </span>
                        <span className="text-red-600">{event.rejection_reason}</span>
                      </div>
                    )}
                    
                    {event.interview_feedback && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="font-medium text-blue-700">Feedback: </span>
                        <span className="text-blue-600">{event.interview_feedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
