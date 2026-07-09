'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const NAVY   = '#1C3A6B'
const BLUE   = '#2B79C2'
const ORANGE = '#E8681E'

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId]     = useState<string | null>(null)
  const [email, setEmail]       = useState('')
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      // If profile already complete, go straight to dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) { router.push('/dashboard'); return }

      setUserId(user.id)
      setEmail(user.email ?? '')
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (!userId) return

    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      headline:  headline.trim() || null,
      location:  location.trim() || null,
      phone:     phone.trim()    || null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/dashboard')
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFD' }}>
      <svg className="w-6 h-6 animate-spin" style={{ color: BLUE }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: '#F8FAFD',
        backgroundImage: `radial-gradient(ellipse 70% 50% at 10% 0%, rgba(43,121,194,0.07) 0%, transparent 60%),
                          radial-gradient(ellipse 55% 45% at 90% 100%, rgba(232,104,30,0.05) 0%, transparent 55%)`
      }}>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <img src="/careertrack.png" alt="CareerTrack" className="h-10 w-auto" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden"
        style={{ boxShadow: '0 20px 48px rgba(28,58,107,0.10)' }}>

        {/* Header stripe */}
        <div className="px-8 py-7 border-b border-blue-50">
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Welcome! Let's set up your profile</h1>
          <p className="text-sm mt-1" style={{ color: '#9BBAD8' }}>
            {email ? `Signed in as ${email}` : 'Just a few details to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

          {/* Full name — required */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9BBAD8' }}>
              Full Name <span style={{ color: ORANGE }}>*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Sunil Mothukuri"
              autoFocus
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
              style={{ background: '#F5F9FE', border: `1.5px solid #D5E6F5`, color: NAVY }}
              onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
              onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9BBAD8' }}>
              Job Title / Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Full Stack Engineer"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
              style={{ background: '#F5F9FE', border: '1.5px solid #D5E6F5', color: NAVY }}
              onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
              onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9BBAD8' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Bengaluru, India"
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                style={{ background: '#F5F9FE', border: '1.5px solid #D5E6F5', color: NAVY }}
                onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
                onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9BBAD8' }}>
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                style={{ background: '#F5F9FE', border: '1.5px solid #D5E6F5', color: NAVY }}
                onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(43,121,194,0.12)` }}
                onBlur={e => { e.target.style.borderColor = '#D5E6F5'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium" style={{ color: ORANGE }}>{error}</p>
          )}

          <button type="submit" disabled={saving}
            className="w-full text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`, boxShadow: `0 4px 14px rgba(43,121,194,0.3)` }}>
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : 'Get Started'}
          </button>

          <p className="text-center text-xs" style={{ color: '#B0C8E0' }}>
            You can update these details anytime from your profile page.
          </p>
        </form>
      </motion.div>
    </div>
  )
}
