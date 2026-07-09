'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { AnalyticsCharts } from '@/components/charts/AnalyticsCharts'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } }

export default function AnalyticsPage() {
  const { userId } = useUser()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('job_applications').select('status, created_at, applied_date').eq('user_id', userId)
      .then(({ data }) => { setApplications(data ?? []); setLoading(false) })
  }, [userId])

  const total = applications.length
  const interviews = applications.filter(a => a.status === 'interview' || a.status === 'phone_screen').length
  const offers = applications.filter(a => a.status === 'offer').length
  const interviewRate = total ? Math.round((interviews / total) * 100) : 0
  const offerRate = total ? Math.round((offers / total) * 100) : 0

  const topStats = [
    { label: 'Total Applications', value: total,         suffix: '',  color: 'text-zinc-900',    border: 'border-zinc-200',    accent: 'bg-zinc-200' },
    { label: 'Interview Rate',      value: interviewRate, suffix: '%', color: 'text-amber-700',   border: 'border-amber-200',   accent: 'bg-amber-400' },
    { label: 'Offer Rate',          value: offerRate,     suffix: '%', color: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-400' },
    { label: 'Avg / Week',          value: total ? Math.ceil(total / 4) : 0, suffix: '', color: 'text-[#1C3A6B]', border: 'border-[#C7DEEE]', accent: 'bg-[#2B79C2]' },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Analytics</h1>
        <p className="text-zinc-500 text-sm">Your job search at a glance</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {topStats.map((s) => (
          <motion.div key={s.label} variants={item}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`relative bg-white border ${s.border} rounded-2xl p-5 overflow-hidden transition-all hover:shadow-md hover:shadow-zinc-100`}>
            <div className={`absolute top-0 right-0 w-20 h-20 ${s.accent} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
            <p className={`text-3xl font-bold tabular-nums ${s.color}`}>
              {loading ? '—' : `${s.value}${s.suffix}`}
            </p>
            <p className="text-zinc-500 text-xs mt-1.5 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-6 h-6 animate-spin text-[#2B79C2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <AnalyticsCharts applications={applications} />
        </motion.div>
      )}
    </div>
  )
}
