'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import type { Resume } from '@/types'

type Tab = 'builder' | 'ats'

type ATSResult = {
  score: number
  summary: string
  strengths: { title: string; detail: string }[]
  improvements: { priority: 'high' | 'medium' | 'low'; title: string; description: string; suggestion: string }[]
  keywords_missing: string[]
  keywords_found: string[]
  sections_check: Record<string, boolean>
}

const PRIORITY_STYLE: Record<string, string> = {
  high:   'bg-[#EBF3FA] border-[#C7DEEE] text-[#1C3A6B]',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-zinc-50 border-zinc-200 text-zinc-600',
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' as const } } }

export default function ResumesPage() {
  const { userId } = useUser()
  const [tab, setTab] = useState<Tab>('builder')

  // Builder tab state
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  // ATS tab state
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc]       = useState('')
  const [analyzing, setAnalyzing]   = useState(false)
  const [atsResult, setAtsResult]   = useState<ATSResult | null>(null)
  const [atsError, setAtsError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('resumes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setResumes(data ?? []); setLoading(false) })
  }, [userId])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = ev => setResumeText(ev.target?.result as string ?? '')
      reader.readAsText(file)
    } else {
      setAtsError('Upload a .txt file, or open your PDF → Ctrl+A → Ctrl+C → paste below.')
    }
  }

  async function handleAnalyze() {
    if (resumeText.trim().length < 50) { setAtsError('Add more resume content before analyzing.'); return }
    setAnalyzing(true); setAtsError(''); setAtsResult(null)
    const res = await fetch('/api/resumes/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
    })
    const data = await res.json()
    if (data.error) { setAtsError(data.error); setAnalyzing(false); return }
    setAtsResult(data)
    setAnalyzing(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Resumes</h1>
        <p className="text-zinc-500 text-sm">Build your resume or check your ATS score</p>
      </motion.div>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button onClick={() => setTab('builder')}
          className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer
            ${tab === 'builder'
              ? 'border-[#2B79C2] bg-[#EBF3FA] shadow-lg shadow-violet-100'
              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${tab === 'builder' ? 'bg-[#1C3A6B]' : 'bg-zinc-100 group-hover:bg-[#EBF3FA]'}`}>
            <svg className={`w-6 h-6 ${tab === 'builder' ? 'text-white' : 'text-zinc-400 group-hover:text-[#2B79C2]'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className={`font-bold text-sm ${tab === 'builder' ? 'text-[#1C3A6B]' : 'text-zinc-800'}`}>Resume Creator</p>
            <p className={`text-xs mt-0.5 ${tab === 'builder' ? 'text-[#2B79C2]' : 'text-zinc-400'}`}>Build step-by-step from scratch</p>
          </div>
          {tab === 'builder' && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1C3A6B]" />
          )}
        </button>

        <button onClick={() => setTab('ats')}
          className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer
            ${tab === 'ats'
              ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100'
              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${tab === 'ats' ? 'bg-emerald-600' : 'bg-zinc-100 group-hover:bg-emerald-50'}`}>
            <svg className={`w-6 h-6 ${tab === 'ats' ? 'text-white' : 'text-zinc-400 group-hover:text-emerald-500'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className={`font-bold text-sm ${tab === 'ats' ? 'text-emerald-800' : 'text-zinc-800'}`}>ATS Score Calculator</p>
            <p className={`text-xs mt-0.5 ${tab === 'ats' ? 'text-emerald-600' : 'text-zinc-400'}`}>Upload resume · get AI score &amp; fixes</p>
          </div>
          {tab === 'ats' && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Panel content */}
      <AnimatePresence mode="wait">

        {/* ── RESUME CREATOR ── */}
        {tab === 'builder' && (
          <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-500 text-sm">
                {loading ? '…' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} saved`}
              </p>
              <Link href="/resumes/new"
                className="bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#1C3A6B]/15 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Resume
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <svg className="w-6 h-6 animate-spin text-[#2B79C2]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map(resume => (
                  <motion.div key={resume.id} variants={item} whileHover={{ y: -2, transition: { duration: 0.15 } }}>
                    <ResumeCard resume={resume} />
                  </motion.div>
                ))}

                {/* Create new card */}
                <motion.div variants={item} whileHover={{ y: -2, transition: { duration: 0.15 } }}>
                  <Link href="/resumes/new"
                    className="group flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-zinc-200 hover:border-[#2B79C2] rounded-2xl p-8 min-h-[180px] transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 group-hover:bg-[#EBF3FA] border border-zinc-200 group-hover:border-[#C7DEEE] flex items-center justify-center transition-all">
                      <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#2B79C2] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 group-hover:text-zinc-900 font-semibold text-sm transition-colors">Create new resume</p>
                      <p className="text-zinc-400 text-xs mt-0.5">Step-by-step builder</p>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── ATS SCORE CALCULATOR ── */}
        {tab === 'ats' && (
          <motion.div key="ats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
            className="space-y-5">

            {/* Input card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-zinc-900">Paste Your Resume</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Our AI will score it and give improvement tips</p>
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs text-[#2B79C2] hover:text-[#1C3A6B] font-semibold border border-[#C7DEEE] hover:border-[#C7DEEE] bg-[#EBF3FA] px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload .txt
                </button>
                <input ref={fileRef} type="file" accept=".txt,.text" className="hidden" onChange={handleFileUpload} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="font-semibold">For PDF resume:</span> Open PDF → Select All (Ctrl+A) → Copy (Ctrl+C) → paste below. Or save as .txt and upload.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Resume Text *</label>
                <textarea rows={12} value={resumeText} onChange={e => setResumeText(e.target.value)}
                  placeholder={`Paste your full resume here…\n\nJohn Doe\njohn@email.com | +91 98765 43210 | Bangalore\n\nEXPERIENCE\nSoftware Engineer — Google (2022–Present)\n• Built scalable REST APIs serving 10M users\n• Reduced latency by 35% through caching\n\nEDUCATION\nB.Tech Computer Science — IIT Bombay (2022)\n\nSKILLS\nReact, Node.js, Python, AWS, Docker, PostgreSQL`}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-400 text-zinc-900 placeholder-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none font-mono" />
                <p className="text-zinc-400 text-xs mt-1.5">{resumeText.trim().split(/\s+/).filter(Boolean).length} words · minimum 50 characters needed</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  Job Description <span className="text-zinc-300 normal-case font-normal">(optional — paste for keyword matching)</span>
                </label>
                <textarea rows={4} value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here to check keyword alignment and get role-specific suggestions…"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-400 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none" />
              </div>

              {atsError && (
                <div className="bg-[#EBF3FA] border border-[#C7DEEE] text-[#1C3A6B] text-sm px-4 py-3 rounded-xl flex gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {atsError}
                </div>
              )}

              <button onClick={handleAnalyze} disabled={analyzing || resumeText.trim().length < 50}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/15 cursor-pointer flex items-center justify-center gap-2 text-sm">
                {analyzing ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing with AI…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>Calculate ATS Score</>
                )}
              </button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {atsResult && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                  {/* Score */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-5">Your ATS Score</h3>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative w-28 h-28 shrink-0">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#F4F4F5" strokeWidth="10" />
                          <circle cx="50" cy="50" r="40" fill="none"
                            stroke={atsResult.score >= 80 ? '#10B981' : atsResult.score >= 60 ? '#F59E0B' : '#F43F5E'}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${atsResult.score * 2.513} 251.3`}
                            className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-extrabold ${atsResult.score >= 80 ? 'text-emerald-600' : atsResult.score >= 60 ? 'text-amber-600' : 'text-[#1C3A6B]'}`}>
                            {atsResult.score}
                          </span>
                          <span className="text-zinc-400 text-xs font-medium">/ 100</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-xl font-bold mb-2 ${atsResult.score >= 80 ? 'text-emerald-700' : atsResult.score >= 60 ? 'text-amber-700' : 'text-[#1C3A6B]'}`}>
                          {atsResult.score >= 80 ? '🎯 Excellent' : atsResult.score >= 60 ? '👍 Good' : atsResult.score >= 40 ? '⚠️ Needs Work' : '❌ Major Issues'}
                        </p>
                        <p className="text-zinc-500 text-sm leading-relaxed">{atsResult.summary}</p>
                      </div>
                    </div>

                    {/* Sections checklist */}
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Sections Found</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.entries(atsResult.sections_check ?? {}).map(([section, present]) => (
                          <div key={section} className={`text-center py-2.5 px-1 rounded-xl border text-xs font-semibold
                            ${present ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                            <div className="text-base mb-0.5">{present ? '✓' : '✗'}</div>
                            <div className="capitalize">{section}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  {(atsResult.keywords_found?.length > 0 || atsResult.keywords_missing?.length > 0) && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-zinc-900">Keywords</h3>
                      {atsResult.keywords_found?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Found in your resume ✓</p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.keywords_found.map(k => (
                              <span key={k} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {atsResult.keywords_missing?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-[#2B79C2] uppercase tracking-wide mb-2">Missing — add these to your resume</p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.keywords_missing.map(k => (
                              <span key={k} className="bg-[#EBF3FA] border border-[#C7DEEE] text-[#1C3A6B] text-xs px-3 py-1 rounded-full font-medium">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strengths */}
                  {atsResult.strengths?.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-bold text-zinc-900 mb-4">Strengths</h3>
                      <div className="space-y-3">
                        {atsResult.strengths.map((s, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 text-sm">{s.title}</p>
                              <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {atsResult.improvements?.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-bold text-zinc-900 mb-4">Improvements</h3>
                      <div className="space-y-3">
                        {atsResult.improvements.map((imp, i) => (
                          <div key={i} className={`border rounded-2xl p-4 ${PRIORITY_STYLE[imp.priority]}`}>
                            <span className="text-xs font-bold uppercase tracking-wide opacity-60">{imp.priority} priority</span>
                            <p className="font-bold text-sm mt-1 mb-1">{imp.title}</p>
                            <p className="text-xs opacity-80 leading-relaxed mb-2">{imp.description}</p>
                            {imp.suggestion && (
                              <div className="bg-white/60 border border-current/10 rounded-xl px-3 py-2 text-xs italic">
                                💡 {imp.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Re-analyze */}
                  <button onClick={() => { setAtsResult(null); setResumeText(''); setJobDesc('') }}
                    className="w-full border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-700 text-sm font-medium py-3 rounded-xl transition cursor-pointer">
                    Analyze Another Resume
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResumeCard({ resume }: { resume: Resume }) {
  const content = resume.content as any
  const skillCount = content?.skills?.length ?? 0
  const expCount   = content?.experience?.length ?? 0
  const eduCount   = content?.education?.length ?? 0
  const score      = resume.ats_score ?? null

  return (
    <div className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md hover:shadow-zinc-100 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-zinc-900 truncate">{resume.title}</h3>
            {resume.is_default && (
              <span className="bg-[#EBF3FA] text-[#1C3A6B] border border-[#C7DEEE] text-xs px-2 py-0.5 rounded-full font-medium shrink-0">Default</span>
            )}
          </div>
          <p className="text-zinc-400 text-xs">Updated {new Date(resume.updated_at).toLocaleDateString()}</p>
        </div>
        {score !== null && (
          <div className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 border
            ${score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#EBF3FA] text-[#1C3A6B] border-[#C7DEEE]'}`}>
            ATS {score}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {[{ label: 'exp', value: expCount }, { label: 'edu', value: eduCount }, { label: 'skills', value: skillCount }].map(s => (
          <div key={s.label} className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-center">
            <p className="text-zinc-900 font-bold text-xl tabular-nums">{s.value}</p>
            <p className="text-zinc-400 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {score !== null && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-500">ATS Score</span>
            <span className="text-xs text-zinc-400">{score}/100</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : 'bg-[#2B79C2]'}`} />
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <Link href={`/resumes/${resume.id}`}
          className="flex-1 text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-semibold py-2.5 rounded-xl transition-colors">
          Edit
        </Link>
        <Link href={`/resumes/${resume.id}`}
          className="flex-1 text-center bg-[#EBF3FA] hover:bg-[#D5E6F5] border border-[#C7DEEE] text-[#1C3A6B] text-xs font-semibold py-2.5 rounded-xl transition-all">
          View
        </Link>
      </div>
    </div>
  )
}
