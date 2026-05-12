'use client'

import { CandidateApplicationActions } from './candidate-application-actions'
import type { Application, Profile } from '@/lib/types'

interface CandidateApplicationActionsWrapperProps {
  application: Application & {
    candidate?: { 
      email: string
      full_name: string 
      current_salary?: number | null
      current_salary_currency?: string | null
      expected_salary?: number | null
      expected_salary_currency?: string | null
      notice_period_days?: number | null
      nationality?: string | null
    }
    job?: { 
      id?: string
      title: string
      department?: { id: string; name: string } | null
      salary_min?: number | null
      salary_max?: number | null
      salary_currency?: string
      created_by?: string | null
      hiring_manager?: { email: string; full_name: string } | null
    }
  }
  currentUser: Profile
}

export function CandidateApplicationActionsWrapper({ application, currentUser }: CandidateApplicationActionsWrapperProps) {
  return (
    <CandidateApplicationActions
      application={application}
      currentUser={currentUser}
    />
  )
}
