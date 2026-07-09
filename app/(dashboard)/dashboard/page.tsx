'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import type { JobApplication } from '@/types'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } }

// Navy #1C3A6B · Blue #2B79C2 · Orange #E8681E
const NAVY   = '#1C3A6B'
const BLUE   = '#2B79C2'
const ORANGE = '#E8681E'

const quickCards = [
  { href: '/resumes/new',  label: 'Build Resume',    desc: 'AI-powered, ATS-ready',  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/jobs',         label: 'Search Jobs',     desc: 'Browse live listings',   icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { href: '/applications', label: 'Kanban Board',    desc: 'Drag & drop tracking',   icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
  { href: '/analytics',   label: 'Analytics',       desc: 'Funnel & trends',        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/profile',     label: 'Your Profile',    desc: 'Update info & links',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { href: '/resumes',     label: 'ATS Checker',     desc: 'Score your resume',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

export default function DashboardPage() {
  const { firstName, userId } = useUser()
  const [apps, setApps]       = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('job_applications').select('*').eq('user_id', userId).then(({ data }) => {
      setApps(data ?? [])
      setLoading(false)
    })
  }, [userId])

  const total     = apps.length
  const applied   = apps.filter(a => a.status === 'applied').length
  const interview = apps.filter(a => a.status === 'interview' || a.status === 'phone_screen').length
  const offers    = apps.filter(a => a.status === 'offer').length
  const rejected  = apps.filter(a => a.status === 'rejected').length

  const statCards = [
    { label: 'Total',      value: total,     accent: NAVY },
    { label: 'Applied',    value: applied,   accent: BLUE },
    { label: 'Interviews', value: interview, accent: ORANGE },
    { label: 'Offers',     value: offers,    accent: NAVY },
    { label: 'Rejected',   value: rejected,  accent: '#9BBAD8' },
  ]

  const pipelineSegments = total === 0 ? [] : [
    { pct: (apps.filter(a => a.status === 'saved').length / total) * 100,        color: '#D5E6F5' },
    { pct: (applied / total) * 100,                                               color: BLUE },
    { pct: (apps.filter(a => a.status === 'phone_screen').length / total) * 100, color: '#5BA0D8' },
    { pct: (interview / total) * 100,                                             color: ORANGE },
    { pct: (offers / total) * 100,                                                color: NAVY },
    { pct: (rejected / total) * 100,                                              color: '#C5D8EC' },
  ].filter(b => b.pct > 0)

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#9BBAD8' }}>Here's your job search overview</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}>
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-blue-50">
              <p className="text-3xl font-black tabular-nums" style={{ color: s.accent }}>
                {loading ? '—' : s.value}
              </p>
              <p className="text-xs font-semibold mt-1.5 uppercase tracking-wide" style={{ color: '#9BBAD8' }}>{s.label}</p>
              <div className="mt-3 w-8 h-1 rounded-full" style={{ background: s.accent }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-white border border-blue-50 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-sm" style={{ color: NAVY }}>Application Pipeline</p>
          <p className="text-xs" style={{ color: '#9BBAD8' }}>{total} total</p>
        </div>
        {total === 0 ? (
          <div className="h-2.5 rounded-full" style={{ background: '#EBF3FA' }} />
        ) : (
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            {pipelineSegments.map((bar, i) => (
              <motion.div key={i} className="rounded-full"
                style={{ backgroundColor: bar.color }}
                initial={{ width: 0 }} animate={{ width: `${bar.pct}%` }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: 'easeOut' }} />
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-3 flex-wrap">
          {[
            { label: 'Saved',     color: '#D5E6F5' },
            { label: 'Applied',   color: BLUE },
            { label: 'Interview', color: ORANGE },
            { label: 'Offer',     color: NAVY },
            { label: 'Rejected',  color: '#C5D8EC' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: '#9BBAD8' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Empty state */}
      {!loading && total === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl p-6 mb-8 text-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 70% 120%, white, transparent)' }} />
          <p className="text-white font-black text-lg mb-1">Start your job search!</p>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Find and track your applications all in one place</p>
          <Link href="/jobs" className="inline-flex items-center gap-2 bg-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition shadow-lg"
            style={{ color: NAVY }}>
            Browse Jobs
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* Quick actions */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9BBAD8' }}>Quick Actions</p>
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickCards.map((card) => (
          <motion.div key={card.href} variants={item} whileHover={{ y: -2, transition: { duration: 0.15 } }} whileTap={{ scale: 0.98 }}>
            <Link href={card.href}
              className="group flex items-center gap-4 bg-white border border-blue-50 hover:border-blue-200 rounded-2xl p-4 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm transition-colors group-hover:text-blue-700" style={{ color: NAVY }}>{card.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9BBAD8' }}>{card.desc}</p>
              </div>
              <svg className="w-4 h-4 ml-auto shrink-0 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ color: '#C7D9EE' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
