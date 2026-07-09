export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type WorkType = 'remote' | 'hybrid' | 'onsite'

export interface Profile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  location: string | null
  headline: string | null
  bio: string | null
  avatar_url: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  title: string
  file_url: string | null
  content: ResumeContent | null
  is_default: boolean
  ats_score: number | null
  resume_feedback: string | null
  created_at: string
  updated_at: string
}

export interface ResumeContent {
  summary?: string
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skills?: string[]
  certifications?: string[]
}

export interface ExperienceItem {
  company: string
  title: string
  start_date: string
  end_date?: string
  current: boolean
  bullets: string[]
}

export interface EducationItem {
  institution: string
  degree: string
  field: string
  graduation_year: number | null
}

export interface JobApplication {
  id: string
  user_id: string
  resume_id: string | null
  company_name: string
  job_title: string
  job_url: string | null
  status: ApplicationStatus
  work_type: WorkType | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  applied_date: string | null
  notes: string | null
  cover_letter: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationTimeline {
  id: string
  application_id: string
  status: ApplicationStatus
  note: string | null
  changed_at: string
}

export interface ApplicationWithResume extends JobApplication {
  resume: Pick<Resume, 'id' | 'title'> | null
  timeline: ApplicationTimeline[]
}
