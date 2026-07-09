'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import type { Resume } from '@/types'

type ATSResult = {
  score: number
  summary: string
  strengths: { title: string; detail: string }[]
  improvements: { priority: 'high' | 'medium' | 'low'; title: string; description: string; suggestion: string }[]
  keywords_missing: string[]
  keywords_found: string[]
  sections_check: Record<string, boolean>
}

const PRIORITY_STYLE = {
  high:   'bg-[#EBF3FA] border-[#C7DEEE] text-[#1C3A6B]',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-zinc-50 border-zinc-200 text-zinc-600',
}

export default function ResumeDetailPage() {
  const { userId } = useUser()
  const { id } = useParams<{ id: string }>()
  const [resume, setResume]       = useState<Resume | null>(null)
  const [loading, setLoading]     = useState(true)

  // ATS analyzer state
  const [tab, setTab]             = useState<'view' | 'analyze'>('view')
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc]     = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null)
  const [atsError, setAtsError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    async function load() {
      const { data } = await supabase.from('resumes').select('*').eq('id', id).eq('user_id', userId).single()
      setResume(data)
      setLoading(false)

      // Pre-fill text from saved content if available
      if (data?.content) {
        const c = data.content as any
        const lines: string[] = []
        if (c.summary) lines.push(c.summary)
        c.experience?.forEach((e: any) => {
          lines.push(`${e.title} at ${e.company}`)
          e.bullets?.forEach((b: string) => lines.push(b))
        })
        c.education?.forEach((e: any) => lines.push(`${e.degree} in ${e.field} from ${e.institution}`))
        if (c.skills?.length) lines.push('Skills: ' + c.skills.join(', '))
        setResumeText(lines.join('\n'))
      }
    }
    load()
  }, [id, userId])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = ev => setResumeText(ev.target?.result as string ?? '')
      reader.readAsText(file)
    } else {
      setAtsError('Please upload a .txt file or paste your resume text below. For PDF: open it, select all (Ctrl+A), copy (Ctrl+C), then paste here.')
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setAtsError('Please add more resume content before analyzing.')
      return
    }
    setAnalyzing(true)
    setAtsError('')
    setAtsResult(null)

    const res = await fetch('/api/resumes/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
    })
    const data = await res.json()
    if (data.error) { setAtsError(data.error); setAnalyzing(false); return }

    setAtsResult(data)

    // Save ATS score back to Supabase
    if (data.score && resume) {
      const supabase = createClient()
      await supabase.from('resumes').update({
        ats_score: data.score,
        resume_feedback: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }).eq('id', resume.id)
    }
    setAnalyzing(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <svg className="w-6 h-6 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  if (!resume) return (
    <div className="max-w-2xl mx-auto p-6 text-center py-20">
      <p className="text-zinc-500 mb-4">Resume not found.</p>
      <Link href="/resumes" className="text-violet-600 hover:underline text-sm">← Back to Resumes</Link>
    </div>
  )

  const content = resume.content as any
  const score = atsResult?.score ?? resume.ats_score

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{resume.title}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Updated {new Date(resume.updated_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {score !== null && score !== undefined && (
            <div className={`text-sm font-bold px-3 py-1.5 rounded-xl border
              ${score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : score >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-[#EBF3FA] border-[#C7DEEE] text-[#1C3A6B]'}`}>
              ATS {score}/100
            </div>
          )}
          <Link href="/resumes" className="border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-700 text-sm px-4 py-2 rounded-xl transition">
            ← Back
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-1 flex gap-1 mb-6 w-fit shadow-sm">
        {([['view', 'View Resume'], ['analyze', 'ATS Score & Analysis']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-5 py-2 text-sm font-semibold rounded-xl transition cursor-pointer
              ${tab === t ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-800'}`}>
            {label}
            {t === 'analyze' && score !== null && score !== undefined && (
              <span className={`absolute -top-1.5 -right-1.5 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold text-white
                ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-[#1C3A6B]'}`}>
                {score}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW TAB */}
        {tab === 'view' && (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {content?.summary && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-zinc-900 mb-3 text-sm">Summary</h2>
                <p className="text-zinc-600 text-sm leading-relaxed">{content.summary}</p>
              </div>
            )}

            {content?.experience?.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-zinc-900 mb-4 text-sm">Work Experience</h2>
                <div className="space-y-5">
                  {content.experience.map((exp: any, i: number) => (
                    <div key={i} className="border-l-2 border-violet-200 pl-4">
                      <div className="flex justify-between items-start flex-wrap gap-1">
                        <div>
                          <p className="font-semibold text-zinc-900 text-sm">{exp.title}</p>
                          <p className="text-violet-600 text-xs font-semibold mt-0.5">{exp.company}</p>
                        </div>
                        <p className="text-zinc-400 text-xs">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</p>
                      </div>
                      {exp.bullets?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.map((b: string, j: number) => (
                            <li key={j} className="text-zinc-500 text-xs flex gap-2">
                              <span className="text-zinc-300 shrink-0">•</span>{b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content?.education?.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-zinc-900 mb-4 text-sm">Education</h2>
                <div className="space-y-3">
                  {content.education.map((edu: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{edu.degree} in {edu.field}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">{edu.institution}</p>
                      </div>
                      {edu.graduation_year && <p className="text-zinc-400 text-xs shrink-0">{edu.graduation_year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content?.skills?.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-zinc-900 mb-4 text-sm">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-zinc-100 text-zinc-700 text-xs px-3 py-1.5 rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYZE TAB */}
        {tab === 'analyze' && (
          <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Upload / Paste */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 text-sm">Resume Content</h2>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs text-violet-600 hover:text-violet-700 font-semibold border border-violet-200 hover:border-violet-300 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload .txt
                </button>
                <input ref={fileRef} type="file" accept=".txt,.text" className="hidden" onChange={handleFileUpload} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <span className="font-semibold">For PDF: </span>Open your PDF → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste below
              </div>

              <textarea rows={10} value={resumeText} onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here…&#10;&#10;John Doe&#10;john@example.com | +91 98765 43210 | Bangalore&#10;&#10;EXPERIENCE&#10;Software Engineer at Company Name (2022 – Present)&#10;• Built scalable REST APIs using Node.js&#10;…"
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-violet-400 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition resize-none font-mono" />

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                  Target Job Description <span className="text-zinc-300 normal-case font-normal">(optional — improves accuracy)</span>
                </label>
                <textarea rows={3} value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here to get keyword-specific analysis…"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-violet-400 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition resize-none" />
              </div>

              {atsError && (
                <div className="bg-[#EBF3FA] border border-[#C7DEEE] text-[#1C3A6B] text-sm px-4 py-3 rounded-xl">
                  {atsError}
                </div>
              )}

              <button onClick={handleAnalyze} disabled={analyzing || resumeText.trim().length < 50}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-violet-600/15 cursor-pointer flex items-center justify-center gap-2">
                {analyzing ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing with AI…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>Analyze ATS Score</>
                )}
              </button>
            </div>

            {/* ATS Results */}
            {atsResult && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Score card */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-6 mb-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#F4F4F5" strokeWidth="10" />
                        <circle cx="50" cy="50" r="40" fill="none"
                          stroke={atsResult.score >= 80 ? '#10B981' : atsResult.score >= 60 ? '#F59E0B' : '#F43F5E'}
                          strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={`${atsResult.score * 2.513} 251.3`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${atsResult.score >= 80 ? 'text-emerald-600' : atsResult.score >= 60 ? 'text-amber-600' : 'text-[#1C3A6B]'}`}>
                          {atsResult.score}
                        </span>
                        <span className="text-zinc-400 text-xs">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <p className={`text-lg font-bold mb-1 ${atsResult.score >= 80 ? 'text-emerald-700' : atsResult.score >= 60 ? 'text-amber-700' : 'text-[#1C3A6B]'}`}>
                        {atsResult.score >= 80 ? 'Excellent' : atsResult.score >= 60 ? 'Good' : atsResult.score >= 40 ? 'Needs Work' : 'Major Issues'}
                      </p>
                      <p className="text-zinc-500 text-sm leading-relaxed">{atsResult.summary}</p>
                    </div>
                  </div>

                  {/* Sections check */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.entries(atsResult.sections_check ?? {}).map(([section, present]) => (
                      <div key={section} className={`text-center py-2 px-1 rounded-xl border text-xs font-medium
                        ${present ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                        <div className="text-base mb-0.5">{present ? '✓' : '✗'}</div>
                        <div className="capitalize">{section}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                {(atsResult.keywords_found?.length > 0 || atsResult.keywords_missing?.length > 0) && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900 text-sm mb-4">Keywords</h3>
                    {atsResult.keywords_found?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Found ✓</p>
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.keywords_found.map(k => (
                            <span key={k} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {atsResult.keywords_missing?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#2B79C2] uppercase tracking-wide mb-2">Missing — Add These</p>
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.keywords_missing.map(k => (
                            <span key={k} className="bg-[#EBF3FA] border border-[#C7DEEE] text-[#1C3A6B] text-xs px-2.5 py-1 rounded-full font-medium">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths */}
                {atsResult.strengths?.length > 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900 text-sm mb-4">Strengths</h3>
                    <div className="space-y-3">
                      {atsResult.strengths.map((s, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-zinc-900 font-semibold text-sm">{s.title}</p>
                            <p className="text-zinc-500 text-xs mt-0.5">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {atsResult.improvements?.length > 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900 text-sm mb-4">Improvements</h3>
                    <div className="space-y-3">
                      {atsResult.improvements.map((imp, i) => (
                        <div key={i} className={`border rounded-2xl p-4 ${PRIORITY_STYLE[imp.priority]}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wide opacity-70">{imp.priority} priority</span>
                          </div>
                          <p className="font-semibold text-sm mb-1">{imp.title}</p>
                          <p className="text-xs opacity-80 mb-2">{imp.description}</p>
                          {imp.suggestion && (
                            <div className="bg-white/60 rounded-lg px-3 py-2 text-xs italic border border-current/10">
                              💡 {imp.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
