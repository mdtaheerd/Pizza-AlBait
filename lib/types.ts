export type UserRole = 'admin' | 'recruiter' | 'hiring_manager'
export type JobStatus = 'draft' | 'open' | 'paused' | 'closed'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
export type ApplicationStage = 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'assessment' | 'offered' | 'hired' | 'rejected'
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'panel'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type CandidateSource = 'career_page' | 'linkedin' | 'referral' | 'agency' | 'other'
export type LockStatus = 'available' | 'locked' | 'in_process' | 'completed' | 'released'
export type SalaryCurrency = 'USD' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'EUR' | 'GBP' | 'CNY'
export type HistoryActionType = 'applied' | 'screened' | 'interviewed' | 'assessed' | 'offered' | 'hired' | 'rejected' | 'offer_declined' | 'withdrawn' | 'locked' | 'unlocked' | 'reassigned' | 'note_added'

export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  department_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  department?: Department | null
}

export interface Job {
  id: string
  title: string
  description: string | null
  requirements: string | null
  department_id: string | null
  location: string | null
  employment_type: EmploymentType | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: SalaryCurrency
  status: JobStatus
  created_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  department?: Department | null
  creator?: Profile | null
  _count?: {
    applications: number
  }
}

export interface Candidate {
  id: string
  email: string
  full_name: string
  phone: string | null
  resume_url: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  source: CandidateSource | null
  notes: string | null
  cv_uploaded_at: string | null
  cv_filename: string | null
  cv_size_bytes: number | null
  is_globally_locked: boolean
  global_locked_by: string | null
  global_locked_at: string | null
  global_lock_job_id: string | null
  created_at: string
  updated_at: string
  applications?: Application[]
  global_locker?: Profile | null
  locked_job?: Job | null
}

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  stage: ApplicationStage
  rating: number | null
  notes: string | null
  assigned_to: string | null
  locked_by: string | null
  locked_at: string | null
  lock_status: LockStatus
  applied_at: string
  updated_at: string
  candidate?: Candidate
  job?: Job
  assignee?: Profile | null
  locker?: Profile | null
  interviews?: Interview[]
}

export interface CandidateHistory {
  id: string
  candidate_id: string
  application_id: string | null
  job_id: string | null
  action_by: string | null
  action_type: HistoryActionType
  previous_stage: string | null
  new_stage: string | null
  notes: string | null
  rejection_reason: string | null
  interview_feedback: string | null
  created_at: string
  actor?: Profile | null
  job?: Job | null
}

export interface Interview {
  id: string
  application_id: string
  interviewer_id: string | null
  interview_type: InterviewType | null
  scheduled_at: string
  duration_minutes: number
  location: string | null
  meeting_link: string | null
  notes: string | null
  feedback: string | null
  status: InterviewStatus
  created_at: string
  updated_at: string
  interviewer?: Profile | null
  application?: Application
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown> | null
  created_at: string
  user?: Profile | null
}

// Stats types
export interface DashboardStats {
  totalJobs: number
  openJobs: number
  totalCandidates: number
  totalApplications: number
  applicationsByStage: Record<ApplicationStage, number>
  recentApplications: Application[]
  upcomingInterviews: Interview[]
}

// Pipeline column for Kanban
export interface PipelineColumn {
  id: ApplicationStage
  title: string
  applications: Application[]
}

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  assessment: 'Assessment',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
  }

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: 'bg-slate-100 text-slate-800',
  screening: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-cyan-100 text-cyan-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  assessment: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-emerald-100 text-emerald-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  }

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  remote: 'Remote',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  paused: 'Paused',
  closed: 'Closed',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  open: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  closed: 'bg-red-100 text-red-700',
}

export const LOCK_STATUS_LABELS: Record<LockStatus, string> = {
  available: 'Available',
  locked: 'Locked',
  in_process: 'In Process',
  completed: 'Completed',
  released: 'Released',
}

export const LOCK_STATUS_COLORS: Record<LockStatus, string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  locked: 'bg-red-100 text-red-700 border-red-200',
  in_process: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  released: 'bg-slate-100 text-slate-700 border-slate-200',
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

export const HISTORY_ACTION_LABELS: Record<HistoryActionType, string> = {
  applied: 'Applied',
  screened: 'Screened',
  interviewed: 'Interviewed',
  assessed: 'Assessed',
  offered: 'Offer Extended',
  hired: 'Hired',
  rejected: 'Rejected',
  offer_declined: 'Offer Declined',
  withdrawn: 'Withdrawn',
  locked: 'Locked by Recruiter',
  unlocked: 'Released',
  reassigned: 'Reassigned',
  note_added: 'Note Added',
}

export const CURRENCY_OPTIONS: { value: SalaryCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { value: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
  { value: 'QAR', label: 'Qatari Riyal', symbol: 'ر.ق' },
  { value: 'KWD', label: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { value: 'BHD', label: 'Bahraini Dinar', symbol: 'د.ب' },
  { value: 'OMR', label: 'Omani Rial', symbol: 'ر.ع' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
]

export const CURRENCY_SYMBOLS: Record<SalaryCurrency, string> = {
  USD: '$',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  BHD: 'د.ب',
  OMR: 'ر.ع',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
}

export const COUNTRY_CODES: { code: string; name: string; dial_code: string }[] = [
  { code: 'AE', name: 'United Arab Emirates', dial_code: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966' },
  { code: 'QA', name: 'Qatar', dial_code: '+974' },
  { code: 'KW', name: 'Kuwait', dial_code: '+965' },
  { code: 'BH', name: 'Bahrain', dial_code: '+973' },
  { code: 'OM', name: 'Oman', dial_code: '+968' },
  { code: 'IN', name: 'India', dial_code: '+91' },
  { code: 'PK', name: 'Pakistan', dial_code: '+92' },
  { code: 'PH', name: 'Philippines', dial_code: '+63' },
  { code: 'BD', name: 'Bangladesh', dial_code: '+880' },
  { code: 'NP', name: 'Nepal', dial_code: '+977' },
  { code: 'LK', name: 'Sri Lanka', dial_code: '+94' },
  { code: 'EG', name: 'Egypt', dial_code: '+20' },
  { code: 'JO', name: 'Jordan', dial_code: '+962' },
  { code: 'LB', name: 'Lebanon', dial_code: '+961' },
  { code: 'SY', name: 'Syria', dial_code: '+963' },
  { code: 'IQ', name: 'Iraq', dial_code: '+964' },
  { code: 'YE', name: 'Yemen', dial_code: '+967' },
  { code: 'US', name: 'United States', dial_code: '+1' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44' },
  { code: 'CA', name: 'Canada', dial_code: '+1' },
  { code: 'AU', name: 'Australia', dial_code: '+61' },
  { code: 'DE', name: 'Germany', dial_code: '+49' },
  { code: 'FR', name: 'France', dial_code: '+33' },
  { code: 'CN', name: 'China', dial_code: '+86' },
]

export const COUNTRIES: { value: string; label: string }[] = [
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'OM', label: 'Oman' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PH', label: 'Philippines' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'NP', label: 'Nepal' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'EG', label: 'Egypt' },
  { value: 'JO', label: 'Jordan' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'SY', label: 'Syria' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'YE', label: 'Yemen' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'CN', label: 'China' },
]
