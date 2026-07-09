import type { JobApplication, Resume, ApplicationTimeline } from '@/types'

export const DEMO_PROFILE = {
  id: 'demo',
  full_name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1 555 123 4567',
  location: 'San Francisco, CA',
  headline: 'Full Stack Engineer',
  bio: 'Passionate engineer with 5 years of experience building scalable web applications.',
  avatar_url: null,
  linkedin_url: 'https://linkedin.com/in/alexjohnson',
  github_url: 'https://github.com/alexjohnson',
  portfolio_url: 'https://alexjohnson.dev',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const DEMO_RESUMES: Resume[] = [
  {
    id: 'r1',
    user_id: 'demo',
    title: 'SWE Resume 2025',
    file_url: null,
    is_default: true,
    ats_score: 82,
    resume_feedback: JSON.stringify({
      improvements: [
        { title: 'Add metrics to achievements', description: 'Quantify your impact with numbers.', example: '"Reduced load time by 40%"' },
        { title: 'Include more ATS keywords', description: 'Add role-specific keywords from job descriptions.', example: 'TypeScript, CI/CD, Kubernetes' },
        { title: 'Strengthen summary', description: 'Lead with your most impressive achievement.', example: '"Engineer with 5 years shipping products used by 1M+ users"' },
      ]
    }),
    content: {
      summary: 'Full Stack Engineer with 5+ years building scalable web apps with React, Node.js, and PostgreSQL.',
      experience: [
        { company: 'Acme Corp', title: 'Senior Software Engineer', start_date: '2022-01', current: true, bullets: ['Led migration to microservices, reducing deploy time by 60%', 'Mentored 3 junior engineers', 'Built real-time dashboard serving 50k users'] },
        { company: 'Startup Inc', title: 'Software Engineer', start_date: '2020-06', end_date: '2021-12', current: false, bullets: ['Built React component library used across 4 products', 'Improved test coverage from 40% to 85%'] },
      ],
      education: [
        { institution: 'UC Berkeley', degree: 'B.S.', field: 'Computer Science', graduation_year: 2020 },
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Next.js', 'GraphQL'],
    },
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'r2',
    user_id: 'demo',
    title: 'Frontend Developer Resume',
    file_url: null,
    is_default: false,
    ats_score: 64,
    resume_feedback: null,
    content: {
      summary: 'Frontend engineer specializing in React and design systems.',
      experience: [
        { company: 'Acme Corp', title: 'Frontend Engineer', start_date: '2021-03', current: true, bullets: ['Built design system with 40+ components', 'Improved Core Web Vitals score from 65 to 95'] },
      ],
      education: [
        { institution: 'UC Berkeley', degree: 'B.S.', field: 'Computer Science', graduation_year: 2020 },
      ],
      skills: ['React', 'TypeScript', 'Figma', 'CSS', 'Tailwind', 'Storybook'],
    },
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

export const DEMO_APPLICATIONS: JobApplication[] = [
  { id: 'a1', user_id: 'demo', resume_id: 'r1', company_name: 'Google',    job_title: 'Senior Software Engineer',   status: 'interview',    work_type: 'hybrid',  location: 'Mountain View, CA',  salary_min: 180000, salary_max: 250000, job_url: '#', applied_date: '2025-06-15', notes: 'Spoke with recruiter Sarah. Loop interview scheduled for next week.', cover_letter: null, created_at: new Date(Date.now() - 86400000 * 20).toISOString(), updated_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'a2', user_id: 'demo', resume_id: 'r1', company_name: 'Stripe',    job_title: 'Full Stack Engineer',        status: 'applied',      work_type: 'remote',  location: 'Remote',             salary_min: 160000, salary_max: 220000, job_url: '#', applied_date: '2025-06-20', notes: null, cover_letter: null, created_at: new Date(Date.now() - 86400000 * 15).toISOString(), updated_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'a3', user_id: 'demo', resume_id: 'r2', company_name: 'Vercel',    job_title: 'Frontend Engineer',          status: 'phone_screen', work_type: 'remote',  location: 'Remote',             salary_min: 140000, salary_max: 190000, job_url: '#', applied_date: '2025-06-18', notes: 'Phone screen with engineering manager on Friday.', cover_letter: null, created_at: new Date(Date.now() - 86400000 * 18).toISOString(), updated_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'a4', user_id: 'demo', resume_id: 'r1', company_name: 'Airbnb',    job_title: 'Software Engineer II',       status: 'saved',        work_type: 'hybrid',  location: 'San Francisco, CA',  salary_min: 150000, salary_max: 200000, job_url: '#', applied_date: null, notes: null, cover_letter: null, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'a5', user_id: 'demo', resume_id: 'r1', company_name: 'Linear',    job_title: 'Product Engineer',           status: 'offer',        work_type: 'remote',  location: 'Remote',             salary_min: 170000, salary_max: 230000, job_url: '#', applied_date: '2025-06-01', notes: 'Offer received! Deadline to accept is July 15.', cover_letter: null, created_at: new Date(Date.now() - 86400000 * 35).toISOString(), updated_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'a6', user_id: 'demo', resume_id: 'r2', company_name: 'Meta',      job_title: 'Frontend Software Engineer', status: 'rejected',     work_type: 'hybrid',  location: 'Menlo Park, CA',     salary_min: 175000, salary_max: 240000, job_url: '#', applied_date: '2025-05-20', notes: 'Rejected after final round. Feedback: need more system design experience.', cover_letter: null, created_at: new Date(Date.now() - 86400000 * 45).toISOString(), updated_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'a7', user_id: 'demo', resume_id: 'r1', company_name: 'Notion',    job_title: 'Software Engineer',          status: 'applied',      work_type: 'hybrid',  location: 'San Francisco, CA',  salary_min: null,   salary_max: null,   job_url: '#', applied_date: '2025-06-22', notes: null, cover_letter: null, created_at: new Date(Date.now() - 86400000 * 13).toISOString(), updated_at: new Date(Date.now() - 86400000 * 13).toISOString() },
  { id: 'a8', user_id: 'demo', resume_id: 'r1', company_name: 'Figma',     job_title: 'TypeScript Engineer',        status: 'saved',        work_type: 'onsite',  location: 'San Francisco, CA',  salary_min: 155000, salary_max: 210000, job_url: '#', applied_date: null, notes: null, cover_letter: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), updated_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]

export const DEMO_TIMELINE: ApplicationTimeline[] = [
  { id: 't1', application_id: 'a1', status: 'saved',        note: null,                         changed_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 't2', application_id: 'a1', status: 'applied',      note: 'Submitted via LinkedIn',     changed_at: new Date(Date.now() - 86400000 * 18).toISOString() },
  { id: 't3', application_id: 'a1', status: 'phone_screen', note: 'Call with recruiter Sarah',  changed_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 't4', application_id: 'a1', status: 'interview',    note: 'Technical loop scheduled',   changed_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]
