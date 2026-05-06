export type UserRole = 'admin' | 'recruiter' | 'hiring_manager'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type JobStatus = 'draft' | 'open' | 'paused' | 'closed'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected'
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
  approval_status: ApprovalStatus
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  department?: Department | null
  approver?: Profile | null
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
  closing_date: string | null
  auto_closed: boolean
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
  country_code: string | null
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
  interview: 'Interview',
  assessment: 'Assessment',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: 'bg-slate-100 text-slate-700',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  assessment: 'bg-purple-100 text-purple-700',
  offer: 'bg-emerald-100 text-emerald-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
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

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

export const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
]
