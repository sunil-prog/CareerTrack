'use client'

import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

const expSchema = z.object({
  company:    z.string().min(1, 'Company required'),
  title:      z.string().min(1, 'Job title required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date:   z.string().optional(),
  current:    z.boolean(),
  bullets:    z.array(z.object({ value: z.string() })),
})

const eduSchema = z.object({
  institution:     z.string().min(1, 'Institution required'),
  degree:          z.string().min(1, 'Degree required'),
  field:           z.string().min(1, 'Field of study required'),
  graduation_year: z.string().optional(),
})

const schema = z.object({
  title:      z.string().min(1, 'Resume title required'),
  summary:    z.string().optional(),
  experience: z.array(expSchema),
  education:  z.array(eduSchema),
  skills:     z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 0, label: 'Basics',     icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 1, label: 'Experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 2, label: 'Education',  icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 3, label: 'Skills',     icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 4, label: 'Preview',    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input {...props} className={`w-full bg-zinc-50 border ${error ? 'border-[#C7DEEE] focus:border-[#2B79C2] focus:ring-[#2B79C2]/20' : 'border-zinc-200 focus:border-[#2B79C2] focus:ring-[#2B79C2]/20'} text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition`} />
      {error && <p className="text-[#2B79C2] text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function NewResumePage() {
  const { userId } = useUser()
  const [step, setStep] = useState(0)
  const router = useRouter()
  const { register, control, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      experience: [{ company: '', title: '', start_date: '', current: false, bullets: [{ value: '' }] }],
      education:  [{ institution: '', degree: '', field: '', graduation_year: '' }],
    },
  })

  const expFields = useFieldArray({ control, name: 'experience' })
  const eduFields = useFieldArray({ control, name: 'education' })

  async function onSubmit(data: FormData) {
    if (!userId) return
    const supabase = createClient()
    const content = {
      summary:    data.summary,
      experience: data.experience.map(e => ({ ...e, bullets: e.bullets.map(b => b.value).filter(Boolean) })),
      education:  data.education.map(e => ({ ...e, graduation_year: e.graduation_year ? parseInt(e.graduation_year) : null })),
      skills:     data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    const { error } = await supabase.from('resumes').insert({ user_id: userId, title: data.title, content })
    if (!error) router.push('/resumes')
  }

  const vals = getValues()

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Resume Builder</h1>
        <p className="text-zinc-500 text-sm">Build an ATS-friendly resume step by step</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            <button type="button" onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer
                ${step === s.id ? 'bg-[#EBF3FA] text-[#1C3A6B] border border-[#C7DEEE]' : step > s.id ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${step === s.id ? 'bg-[#1C3A6B] text-white' : step > s.id ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                {step > s.id ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.id + 1}
              </div>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 mx-0.5 rounded ${step > i ? 'bg-emerald-400' : 'bg-zinc-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Basics */}
          {step === 0 && (
            <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-zinc-900 border-b border-zinc-100 pb-3">Basic Information</h2>
              <Input label="Resume Title *" placeholder="e.g. Full Stack Engineer Resume 2025" {...register('title')} error={errors.title?.message} />
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Professional Summary</label>
                <textarea rows={4} placeholder="Experienced software engineer with 3+ years building scalable web applications using React and Node.js…"
                  {...register('summary')}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition resize-none" />
                <p className="text-zinc-400 text-xs mt-1.5">2-3 sentences. Mention years of experience, top skills, and career focus.</p>
              </div>
            </motion.div>
          )}

          {/* Step 1: Experience */}
          {step === 1 && (
            <motion.div key="exp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4">
              {expFields.fields.map((field, i) => (
                <div key={field.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-900 text-sm">Experience #{i + 1}</h3>
                    {expFields.fields.length > 1 && (
                      <button type="button" onClick={() => expFields.remove(i)}
                        className="text-[#2B79C2] hover:text-[#2B79C2] text-xs font-medium cursor-pointer transition">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input label="Company *" {...register(`experience.${i}.company`)} error={errors.experience?.[i]?.company?.message} />
                    <Input label="Job Title *" {...register(`experience.${i}.title`)} error={errors.experience?.[i]?.title?.message} />
                    <Input label="Start Date *" type="month" {...register(`experience.${i}.start_date`)} error={errors.experience?.[i]?.start_date?.message} />
                    <Input label="End Date" type="month" {...register(`experience.${i}.end_date`)} disabled={watch(`experience.${i}.current`)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer mb-4">
                    <input type="checkbox" {...register(`experience.${i}.current`)} className="rounded border-zinc-300 text-[#2B79C2] focus:ring-violet-400" />
                    Currently working here
                  </label>
                  <BulletsField control={control} nestIndex={i} register={register} />
                </div>
              ))}
              <button type="button" onClick={() => expFields.append({ company: '', title: '', start_date: '', current: false, bullets: [{ value: '' }] })}
                className="w-full border border-dashed border-zinc-300 hover:border-[#2B79C2] text-zinc-400 hover:text-[#2B79C2] rounded-2xl py-3 text-sm font-medium transition cursor-pointer">
                + Add Another Experience
              </button>
            </motion.div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <motion.div key="edu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4">
              {eduFields.fields.map((field, i) => (
                <div key={field.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-900 text-sm">Education #{i + 1}</h3>
                    {eduFields.fields.length > 1 && (
                      <button type="button" onClick={() => eduFields.remove(i)}
                        className="text-[#2B79C2] hover:text-[#2B79C2] text-xs font-medium cursor-pointer transition">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Institution *" placeholder="IIT Bombay, BITS Pilani…" {...register(`education.${i}.institution`)} error={errors.education?.[i]?.institution?.message} />
                    <Input label="Degree *" placeholder="B.Tech, M.Sc, MBA…" {...register(`education.${i}.degree`)} error={errors.education?.[i]?.degree?.message} />
                    <Input label="Field of Study *" placeholder="Computer Science, Electronics…" {...register(`education.${i}.field`)} error={errors.education?.[i]?.field?.message} />
                    <Input label="Graduation Year" type="number" placeholder="2024" {...register(`education.${i}.graduation_year`)} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => eduFields.append({ institution: '', degree: '', field: '', graduation_year: '' })}
                className="w-full border border-dashed border-zinc-300 hover:border-[#2B79C2] text-zinc-400 hover:text-[#2B79C2] rounded-2xl py-3 text-sm font-medium transition cursor-pointer">
                + Add Another Education
              </button>
            </motion.div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-zinc-900 border-b border-zinc-100 pb-3 mb-5">Skills</h2>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                  Skills <span className="text-zinc-300 normal-case font-normal">(comma separated)</span>
                </label>
                <textarea rows={4} placeholder="React, TypeScript, Node.js, Python, PostgreSQL, Docker, AWS, Git, Figma…"
                  {...register('skills')}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition resize-none" />
                <p className="text-zinc-400 text-xs mt-1.5">List technical and soft skills. ATS systems scan for keywords — include role-specific tools.</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-zinc-900">Preview</h2>
                  <span className="bg-[#EBF3FA] text-[#1C3A6B] border border-[#C7DEEE] text-xs px-2.5 py-1 rounded-full font-medium">Ready to save</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{vals.title || '—'}</h3>
                {vals.summary && <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{vals.summary}</p>}

                {vals.experience?.filter(e => e.company).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Experience</p>
                    {vals.experience.filter(e => e.company).map((exp, i) => (
                      <div key={i} className="border-l-2 border-[#C7DEEE] pl-3 mb-3">
                        <p className="font-semibold text-zinc-900 text-sm">{exp.title}</p>
                        <p className="text-[#2B79C2] text-xs">{exp.company} · {exp.start_date} — {exp.current ? 'Present' : exp.end_date || '—'}</p>
                        {exp.bullets?.filter(b => b.value).map((b, j) => (
                          <p key={j} className="text-zinc-500 text-xs mt-0.5">• {b.value}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {vals.education?.filter(e => e.institution).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Education</p>
                    {vals.education.filter(e => e.institution).map((edu, i) => (
                      <div key={i} className="flex justify-between mb-2">
                        <div>
                          <p className="font-semibold text-zinc-900 text-sm">{edu.degree} in {edu.field}</p>
                          <p className="text-zinc-400 text-xs">{edu.institution}</p>
                        </div>
                        {edu.graduation_year && <p className="text-zinc-400 text-xs">{edu.graduation_year}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {vals.skills && (
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vals.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                        <span key={i} className="bg-zinc-100 text-zinc-600 text-xs px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition shadow-lg shadow-[#1C3A6B]/20 cursor-pointer flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save Resume</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 text-sm font-medium rounded-xl transition disabled:opacity-30 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {step < 4 && (
            <button type="button" onClick={() => setStep(s => Math.min(4, s + 1))}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-[#1C3A6B]/15 cursor-pointer">
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function BulletsField({ control, nestIndex, register }: any) {
  const { fields, append, remove } = useFieldArray({ control, name: `experience.${nestIndex}.bullets` })
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Key Achievements / Bullets</label>
      <div className="space-y-2">
        {fields.map((f, k) => (
          <div key={f.id} className="flex gap-2">
            <input {...register(`experience.${nestIndex}.bullets.${k}.value`)}
              placeholder="Reduced page load time by 40% using code splitting and lazy loading…"
              className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-[#2B79C2] text-zinc-900 placeholder-zinc-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B79C2]/20 transition" />
            <button type="button" onClick={() => remove(k)}
              className="text-zinc-300 hover:text-[#2B79C2] cursor-pointer transition px-1 text-lg leading-none">×</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ value: '' })}
          className="text-[#2B79C2] hover:text-[#1C3A6B] text-xs font-medium cursor-pointer transition">
          + Add bullet
        </button>
      </div>
    </div>
  )
}
