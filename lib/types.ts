export type UserRole = 'admin' | 'recruiter' | 'hiring_manager' | 'candidate'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type JobStatus = 'draft' | 'open' | 'paused' | 'closed'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
export type ApplicationStage = 'applied' | 'new' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'panel'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type CandidateSource = 'career_page' | 'linkedin' | 'referral' | 'agency' | 'other'
export type LockStatus = 'available' | 'locked' | 'in_process' | 'completed' | 'released'
export type SalaryCurrency = 'AED'
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
  home_country_code: string | null
  home_country_phone: string | null
  alternate_country_code: string | null
  alternate_phone: string | null
  nationality: string | null
  gender: string | null
  date_of_birth: string | null
  qualification: string | null
  current_salary: number | null
  current_salary_currency: SalaryCurrency | null
  expected_salary: number | null
  expected_salary_currency: SalaryCurrency | null
  notice_period_days: number | null
  user_id: string | null
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
  // Workflow fields
  interview_date: string | null
  interview_location: string | null
  interviewer_email: string | null
  interviewer_name: string | null
  screening_notes: string | null
  interview_notes: string | null
  rejection_reason: string | null
  rejection_comments: string | null
  offer_sent_at: string | null
  hired_at: string | null
  rejected_at: string | null
  shortlisted_at: string | null
  shortlisted_by: string | null
  interviewed_at: string | null
  interviewed_by: string | null
  hiring_manager_comments: string | null
  recruiter_comments: string | null
  // Screening notes fields
  screening_summary: string | null
  salary_expectation: string | null
  benefits_expectation: string | null
  notice_period: string | null
  // Multiple interviewers and scheduling fields
  interviewer_emails: string[] | null
  interview_status: 'pending' | 'accepted' | 'rescheduled' | null
  interview_accepted_at: string | null
  interview_accepted_by: string | null
  original_interview_date: string | null
  rescheduled_at: string | null
  rescheduled_by: string | null
  interview_notification_sent_at: string | null
  candidate?: Candidate
  job?: Job
  assignee?: Profile | null
  locker?: Profile | null
  interviews?: Interview[]
  shortlister?: Profile | null
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
  new: 'New',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  interviewed: 'Interviewed',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: 'bg-slate-100 text-slate-700',
  new: 'bg-slate-100 text-slate-700',
  screening: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-indigo-100 text-indigo-700',
  interview_scheduled: 'bg-amber-100 text-amber-700',
  interviewed: 'bg-purple-100 text-purple-700',
  offered: 'bg-emerald-100 text-emerald-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
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
  { value: 'AED', label: 'UAE Dirham', symbol: 'AED' },
]

export const CURRENCY_SYMBOLS: Record<SalaryCurrency, string> = {
  AED: 'AED',
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

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]
