'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

const NAVY   = '#1C3A6B'
const BLUE   = '#2B79C2'
const ORANGE = '#E8681E'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' as const } },
}

type ProfileData = {
  full_name: string; phone: string; location: string; headline: string
  linkedin_url: string; github_url: string; portfolio_url: string; bio: string
}

const EMPTY: ProfileData = {
  full_name: '', phone: '', location: '', headline: '',
  linkedin_url: '', github_url: '', portfolio_url: '', bio: '',
}

export default function ProfilePage() {
  const { userId } = useUser()
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name:     data.full_name     ?? '',
            phone:         data.phone         ?? '',
            location:      data.location      ?? '',
            headline:      data.headline      ?? '',
            linkedin_url:  data.linkedin_url  ?? '',
            github_url:    data.github_url    ?? '',
            portfolio_url: data.portfolio_url ?? '',
            bio:           data.bio           ?? '',
          })
        }
        setLoading(false)
      })
  }, [userId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      full_name:     profile.full_name     || null,
      phone:         profile.phone         || null,
      location:      profile.location      || null,
      headline:      profile.headline      || null,
      linkedin_url:  profile.linkedin_url  || null,
      github_url:    profile.github_url    || null,
      portfolio_url: profile.portfolio_url || null,
      bio:           profile.bio           || null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Profile saved!')
    setTimeout(() => setMessage(''), 3500)
  }

  const firstName = profile.full_name?.split(' ')[0] || 'U'

  const fields: { label: string; key: keyof ProfileData; placeholder: string; type?: string }[] = [
    { label: 'Full Name',     key: 'full_name',     placeholder: 'Jane Doe' },
    { label: 'Phone',         key: 'phone',         placeholder: '+91 98765 43210', type: 'tel' },
    { label: 'Location',      key: 'location',      placeholder: 'Bengaluru, India' },
    { label: 'Headline',      key: 'headline',      placeholder: 'Full Stack Engineer' },
    { label: 'LinkedIn URL',  key: 'linkedin_url',  placeholder: 'https://linkedin.com/in/…', type: 'url' },
    { label: 'GitHub URL',    key: 'github_url',    placeholder: 'https://github.com/…',      type: 'url' },
    { label: 'Portfolio URL', key: 'portfolio_url', placeholder: 'https://yoursite.com',       type: 'url' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <svg className="w-6 h-6 animate-spin" style={{ color: BLUE }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`, boxShadow: `0 8px 20px rgba(43,121,194,0.25)` }}>
          {firstName[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>{profile.full_name || 'Your Profile'}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9BBAD8' }}>{profile.headline || 'Add your headline below'}</p>
        </div>
      </motion.div>

      <form onSubmit={handleSave}>
        <motion.div variants={container} initial="hidden" animate="show"
          className="bg-white border border-blue-50 rounded-2xl p-6 mb-4 space-y-5 shadow-sm">
          <motion.h2 variants={item} className="font-semibold text-sm border-b border-blue-50 pb-3" style={{ color: NAVY }}>
            Personal Information
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <motion.div key={f.key} variants={item}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#9BBAD8' }}>{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  value={profile[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                  style={{ background: '#F5F9FE', border: '1.5px solid #D5E6F5', color: NAVY }}
                  onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
                  onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={item}>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#9BBAD8' }}>Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="A short professional summary about yourself…"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition resize-none"
              style={{ background: '#F5F9FE', border: '1.5px solid #D5E6F5', color: NAVY }}
              onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
              onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
            />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`, boxShadow: `0 4px 14px rgba(43,121,194,0.3)` }}>
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>

          <AnimatePresence>
            {message && (
              <motion.span
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                className="text-sm font-medium flex items-center gap-1.5"
                style={{ color: message.startsWith('Error') ? ORANGE : '#22C55E' }}>
                {!message.startsWith('Error') && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {message}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </div>
  )
}
