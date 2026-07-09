'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary_min: number | null
  salary_max: number | null
}

const JOB_SUGGESTIONS = [
  'Software Engineer', 'Senior Software Engineer', 'Junior Software Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'Next.js Developer', 'Vue.js Developer', 'Angular Developer',
  'Node.js Developer', 'Python Developer', 'Java Developer', 'Go Developer',
  'TypeScript Developer', 'PHP Developer', 'Ruby on Rails Developer',
  'Mobile Developer', 'iOS Developer', 'Android Developer', 'Flutter Developer',
  'React Native Developer', 'Data Scientist', 'Data Analyst', 'Data Engineer',
  'Machine Learning Engineer', 'AI Engineer', 'NLP Engineer', 'Computer Vision Engineer',
  'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Platform Engineer',
  'AWS Engineer', 'Azure Engineer', 'GCP Engineer', 'Kubernetes Engineer',
  'Security Engineer', 'Cybersecurity Analyst', 'Penetration Tester',
  'QA Engineer', 'Test Automation Engineer', 'SDET',
  'Systems Administrator', 'Network Engineer', 'Database Administrator',
  'Software Architect', 'Solutions Architect', 'Technical Lead', 'Engineering Manager',
  'Product Manager', 'Product Designer', 'UX Designer', 'UI Designer',
  'Graphic Designer', 'Motion Designer', 'Brand Designer',
  'Scrum Master', 'Agile Coach', 'Project Manager', 'Program Manager',
  'Business Analyst', 'Systems Analyst', 'Operations Manager',
  'Marketing Manager', 'Digital Marketing Specialist', 'SEO Specialist',
  'Content Writer', 'Technical Writer', 'Copywriter',
  'Sales Engineer', 'Account Executive', 'Customer Success Manager',
  'Recruiter', 'HR Manager', 'Finance Analyst', 'Accountant',
  'CTO', 'VP of Engineering', 'Director of Engineering',
]

const CITY_SUGGESTIONS = [
  // India
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Indore', 'Noida', 'Gurugram', 'Navi Mumbai', 'Thane',
  'Coimbatore', 'Mysore', 'Kochi', 'Chandigarh', 'Nagpur', 'Bhopal', 'Vadodara', 'Patna',
  'Gurgaon', 'Visakhapatnam', 'Bhubaneswar', 'Thiruvananthapuram', 'Guwahati', 'Srinagar',
  'Mohali', 'Faridabad', 'Ghaziabad', 'Agra', 'Nashik', 'Rajkot', 'Varanasi', 'Ranchi',
  // International
  'Remote', 'New York', 'San Francisco', 'London', 'Austin', 'Seattle', 'Chicago', 'Boston',
  'Toronto', 'Sydney', 'Singapore', 'Dubai', 'Berlin', 'Paris', 'Amsterdam', 'Dublin',
  'Tokyo', 'Hong Kong', 'São Paulo', 'Cape Town', 'Bangalore (Remote)', 'Anywhere',
]

const COUNTRIES = [
  { code: 'in', label: '🇮🇳 India',          currency: '₹',  sym: 'in' },
  { code: 'us', label: '🇺🇸 United States',  currency: '$',  sym: 'us' },
  { code: 'gb', label: '🇬🇧 United Kingdom', currency: '£',  sym: 'gb' },
  { code: 'au', label: '🇦🇺 Australia',      currency: 'A$', sym: 'au' },
  { code: 'ca', label: '🇨🇦 Canada',         currency: 'C$', sym: 'ca' },
  { code: 'de', label: '🇩🇪 Germany',        currency: '€',  sym: 'de' },
  { code: 'sg', label: '🇸🇬 Singapore',      currency: 'S$', sym: 'sg' },
]

const LOCATION_PILLS = ['Remote', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Delhi', 'Noida']

function fmtSalary(n: number, country: string): string {
  if (country === 'in') {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
    if (n >= 100000)   return `₹${(n / 100000).toFixed(0)} L`
    return `₹${n.toLocaleString('en-IN')}`
  }
  const syms: Record<string, string> = { gb: '£', de: '€', fr: '€', au: 'A$', ca: 'C$', sg: 'S$' }
  return `${syms[country] ?? '$'}${Math.round(n / 1000)}k`
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' as const } } }

export default function JobSearchPage() {
  const { userId } = useUser()
  const [searchTerm, setSearchTerm]   = useState('')
  const [location, setLocation]       = useState('')
  const [country, setCountry]         = useState('in')
  const [jobs, setJobs]               = useState<Job[]>([])
  const [loading, setLoading]         = useState(false)
  const [saved, setSaved]             = useState<Set<string>>(new Set())
  const [saving, setSaving]           = useState<string | null>(null)
  const [total, setTotal]             = useState(0)
  const [error, setError]             = useState('')
  const [searched, setSearched]       = useState(false)

  // Autocomplete state
  const [showJobSugg, setShowJobSugg] = useState(false)
  const [showCitySugg, setShowCitySugg] = useState(false)
  const [activeJobSugg, setActiveJobSugg] = useState(-1)
  const [activeCitySugg, setActiveCitySugg] = useState(-1)
  const jobInputRef  = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const jobSuggRef   = useRef<HTMLDivElement>(null)
  const citySuggRef  = useRef<HTMLDivElement>(null)

  // Easy Apply state
  const [easyApplyJob, setEasyApplyJob] = useState<Job | null>(null)
  const [applyName, setApplyName]   = useState('')
  const [applyEmail, setApplyEmail] = useState('')
  const [applyPhone, setApplyPhone] = useState('')
  const [applyNote, setApplyNote]   = useState('')
  const [applying, setApplying]     = useState(false)
  const [applied, setApplied]       = useState<Set<string>>(new Set())

  const jobSuggestions  = searchTerm.length >= 1
    ? JOB_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8) : []
  const citySuggestions = location.length >= 1
    ? CITY_SUGGESTIONS.filter(c => c.toLowerCase().includes(location.toLowerCase())).slice(0, 7) : []

  // Auto-load jobs on mount
  useEffect(() => {
    async function loadDefault() {
      setLoading(true)
      const params = new URLSearchParams({ search_term: 'software engineer', location: '', country: 'in' })
      const res  = await fetch(`/api/jobs/search?${params}`)
      const data = await res.json()
      if (!data.error) { setJobs(data.jobs ?? []); setTotal(data.total ?? 0) }
      setLoading(false)
    }
    loadDefault()
  }, [])

  // Load user profile for Easy Apply
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('profiles').select('full_name,phone,email').eq('id', userId).single().then(({ data }) => {
      if (data?.full_name) setApplyName(data.full_name)
      if (data?.phone) setApplyPhone(data.phone)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setApplyEmail(session.user.email)
    })
  }, [userId])

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (jobSuggRef.current && !jobSuggRef.current.contains(e.target as Node) &&
          jobInputRef.current && !jobInputRef.current.contains(e.target as Node)) {
        setShowJobSugg(false)
      }
      if (citySuggRef.current && !citySuggRef.current.contains(e.target as Node) &&
          cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCitySugg(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleJobKey(e: React.KeyboardEvent) {
    if (!showJobSugg || jobSuggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveJobSugg(i => Math.min(i + 1, jobSuggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveJobSugg(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && activeJobSugg >= 0) { e.preventDefault(); pickJob(jobSuggestions[activeJobSugg]) }
    if (e.key === 'Escape') setShowJobSugg(false)
  }

  function handleCityKey(e: React.KeyboardEvent) {
    if (!showCitySugg || citySuggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveCitySugg(i => Math.min(i + 1, citySuggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveCitySugg(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && activeCitySugg >= 0) { e.preventDefault(); pickCity(citySuggestions[activeCitySugg]) }
    if (e.key === 'Escape') setShowCitySugg(false)
  }

  function pickJob(s: string)  { setSearchTerm(s); setShowJobSugg(false); setActiveJobSugg(-1) }
  function pickCity(c: string) { setLocation(c);  setShowCitySugg(false); setActiveCitySugg(-1) }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!searchTerm.trim()) return
    setShowJobSugg(false); setShowCitySugg(false)
    setLoading(true); setError(''); setSearched(true); setJobs([])
    const params = new URLSearchParams({ search_term: searchTerm, location, country })
    const res  = await fetch(`/api/jobs/search?${params}`)
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setJobs(data.jobs ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }

  async function handleSave(job: Job) {
    if (saved.has(job.id)) return
    setSaving(job.id)
    if (!userId) return
    const supabase = createClient()
    await supabase.from('job_applications').insert({
      user_id: userId, job_title: job.title, company_name: job.company,
      location: job.location || null, salary_min: job.salary_min,
      salary_max: job.salary_max, job_url: job.url, status: 'saved',
    })
    setSaved(prev => new Set(prev).add(job.id))
    setSaving(null)
  }

  async function handleEasyApply() {
    if (!easyApplyJob) return
    setApplying(true)
    if (!userId) return
    const supabase = createClient()
    await supabase.from('job_applications').insert({
      user_id: userId, job_title: easyApplyJob.title, company_name: easyApplyJob.company,
      location: easyApplyJob.location || null, salary_min: easyApplyJob.salary_min,
      salary_max: easyApplyJob.salary_max, job_url: easyApplyJob.url,
      status: 'applied', notes: applyNote || null,
      applied_date: new Date().toISOString().slice(0, 10),
    })
    setApplied(prev => new Set(prev).add(easyApplyJob.id))
    setSaved(prev => new Set(prev).add(easyApplyJob.id))
    setApplying(false)
    window.open(easyApplyJob.url, '_blank')
    setEasyApplyJob(null)
  }

  const salaryStr = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null
    if (job.salary_min && job.salary_max) return `${fmtSalary(job.salary_min, country)} – ${fmtSalary(job.salary_max, country)}`
    if (job.salary_min) return `From ${fmtSalary(job.salary_min, country)}`
    return `Up to ${fmtSalary(job.salary_max!, country)}`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Job Search</h1>
        <p className="text-zinc-500 text-sm">Powered by Adzuna · live listings · search or browse below</p>
      </motion.div>

      {/* Search form */}
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        onSubmit={handleSearch} className="bg-white border border-zinc-200 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">

          {/* Job title autocomplete */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={jobInputRef} value={searchTerm} autoComplete="off"
              onChange={e => { setSearchTerm(e.target.value); setShowJobSugg(true); setActiveJobSugg(-1) }}
              onFocus={() => setShowJobSugg(true)} onKeyDown={handleJobKey}
              placeholder="Job title, keyword…"
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition"
            />
            <AnimatePresence>
              {showJobSugg && jobSuggestions.length > 0 && (
                <motion.div ref={jobSuggRef} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  {jobSuggestions.map((s, i) => (
                    <button key={s} type="button" onMouseDown={e => { e.preventDefault(); pickJob(s) }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors cursor-pointer
                        ${i === activeJobSugg ? 'bg-[#EBF3FA] text-[#1C3A6B]' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                      <svg className="w-3.5 h-3.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* City autocomplete */}
          <div className="relative w-full sm:w-52">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input ref={cityInputRef} value={location} autoComplete="off"
              onChange={e => { setLocation(e.target.value); setShowCitySugg(true); setActiveCitySugg(-1) }}
              onFocus={() => setShowCitySugg(true)} onKeyDown={handleCityKey}
              placeholder="City or Remote"
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition"
            />
            <AnimatePresence>
              {showCitySugg && citySuggestions.length > 0 && (
                <motion.div ref={citySuggRef} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  {citySuggestions.map((c, i) => (
                    <button key={c} type="button" onMouseDown={e => { e.preventDefault(); pickCity(c) }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors cursor-pointer
                        ${i === activeCitySugg ? 'bg-[#EBF3FA] text-[#1C3A6B]' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                      <svg className="w-3.5 h-3.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Country selector */}
          <div className="relative w-full sm:w-44">
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="w-full appearance-none bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition cursor-pointer pr-8">
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button type="submit" disabled={loading || !searchTerm.trim()}
            className="bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-[#1C3A6B]/15 whitespace-nowrap cursor-pointer flex items-center gap-2">
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Location pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-zinc-400 text-xs self-center mr-1">Quick:</span>
          {LOCATION_PILLS.map(pill => (
            <button key={pill} type="button" onClick={() => setLocation(prev => prev === pill ? '' : pill)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border
                ${location === pill ? 'bg-[#1C3A6B] text-white border-[#2B79C2]' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-[#C7DEEE] hover:text-[#2B79C2]'}`}>
              {pill}
            </button>
          ))}
        </div>
      </motion.form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-[#EBF3FA] border border-[#C7DEEE] text-[#1C3A6B] text-sm px-4 py-3 rounded-xl mb-5">
            <span className="font-semibold">Error: </span>{error}
          </motion.div>
        )}
      </AnimatePresence>

      {total > 0 && !loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm mb-5">
          <span className="text-zinc-900 font-semibold">{total.toLocaleString()}</span> jobs found
          {location && <> in <span className="text-zinc-700 font-medium">{location}</span></>}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-100 rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-zinc-100 rounded-lg w-1/2 mb-4" />
                <div className="h-3 bg-zinc-100 rounded-lg w-full mb-2" />
                <div className="h-3 bg-zinc-100 rounded-lg w-5/6 mb-6" />
                <div className="flex gap-2"><div className="flex-1 h-9 bg-zinc-100 rounded-xl" /><div className="flex-1 h-9 bg-zinc-100 rounded-xl" /><div className="flex-1 h-9 bg-zinc-100 rounded-xl" /></div>
              </div>
            ))}
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div key="results" variants={container} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => {
              const sal = salaryStr(job)
              const isApplied = applied.has(job.id)
              const isSaved   = saved.has(job.id)
              return (
                <motion.div key={job.id} variants={item} whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:shadow-zinc-100">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 text-sm leading-tight mb-1.5">{job.title}</h3>
                    <p className="text-[#2B79C2] text-sm font-semibold">{job.company}</p>
                    {job.location && (
                      <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {job.location}
                      </p>
                    )}
                  </div>

                  {sal && (
                    <p className="text-emerald-700 text-xs font-semibold bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      {sal}
                    </p>
                  )}

                  <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex gap-2 pt-1">
                    {/* Easy Apply */}
                    <button onClick={() => setEasyApplyJob(job)} disabled={isApplied}
                      className={`flex-1 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1
                        ${isApplied ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] text-white shadow-md shadow-violet-200'}`}>
                      {isApplied ? '✓ Applied' : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Easy Apply
                        </>
                      )}
                    </button>
                    {/* Save */}
                    <button onClick={() => handleSave(job)} disabled={isSaved || saving === job.id}
                      className={`flex-1 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1
                        ${isSaved ? 'bg-zinc-50 border border-zinc-200 text-zinc-500' : 'border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'}`}>
                      {saving === job.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : isSaved ? '✓ Saved' : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Save
                        </>
                      )}
                    </button>
                    {/* View */}
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 text-zinc-400 hover:text-zinc-700 transition-colors flex items-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-9 h-9 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-zinc-900 font-semibold mb-2">No jobs found</p>
            <p className="text-zinc-400 text-sm">Try different keywords, change city or switch country</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easy Apply Modal */}
      <AnimatePresence>
        {easyApplyJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setEasyApplyJob(null) }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200">

              {/* Header */}
              <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded bg-[#1C3A6B] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[#1C3A6B] uppercase tracking-wide">Easy Apply</span>
                  </div>
                  <h3 className="font-bold text-zinc-900 text-base">{easyApplyJob.title}</h3>
                  <p className="text-[#2B79C2] text-sm font-semibold">{easyApplyJob.company}</p>
                  {easyApplyJob.location && <p className="text-zinc-400 text-xs mt-0.5">{easyApplyJob.location}</p>}
                </div>
                <button onClick={() => setEasyApplyJob(null)}
                  className="text-zinc-400 hover:text-zinc-600 transition cursor-pointer mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <input value={applyName} onChange={e => setApplyName(e.target.value)} placeholder="Jane Doe"
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Phone</label>
                    <input value={applyPhone} onChange={e => setApplyPhone(e.target.value)} placeholder="+91 …"
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Email</label>
                  <input value={applyEmail} onChange={e => setApplyEmail(e.target.value)} type="email"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Cover Note <span className="text-zinc-300 normal-case font-normal">(optional)</span></label>
                  <textarea rows={3} value={applyNote} onChange={e => setApplyNote(e.target.value)}
                    placeholder="Brief note about why you're a great fit…"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition resize-none" />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                  <span className="font-semibold">What happens next:</span> Your application is saved to CareerTrack, then the job page opens so you can complete the employer's application form.
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => setEasyApplyJob(null)}
                  className="flex-1 border border-zinc-200 hover:border-zinc-300 text-zinc-600 text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleEasyApply} disabled={applying || !applyName || !applyEmail}
                  className="flex-1 bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-lg shadow-[#1C3A6B]/20 cursor-pointer flex items-center justify-center gap-2">
                  {applying ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Applying…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Apply & Track</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
