'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      const { data, error } = await supabase.auth.signUp({ email, password })
      console.log('signUp data:', data)
      console.log('signUp error:', error)
      console.log('error message:', error?.message)
      console.log('error status:', error?.status)
      if (error) {
        setError(`${error.status ?? ''} ${error.message || 'Unknown error — check browser console (F12)'}`.trim())
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Check your Supabase keys in .env.local')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-violet-100 rounded-full blur-3xl pointer-events-none opacity-50" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-fuchsia-100 rounded-full blur-3xl pointer-events-none opacity-40" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-10 text-center shadow-xl shadow-zinc-100"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Check your email</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="text-zinc-900 font-semibold">{email}</span>.
            </p>
            <Link href="/login"
              className="inline-flex items-center gap-1.5 mt-6 text-violet-600 hover:text-violet-700 text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full max-w-md"
          >
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <img src="/careertrack.png" alt="CareerTrack" className="h-10 w-auto mx-auto" />
              </Link>
              <p className="text-zinc-500 text-sm mt-2">Create your free account</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl shadow-zinc-100">
              <h1 className="text-xl font-bold text-zinc-900 mb-6">Get started</h1>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-5"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-violet-400 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Password</label>
                  <input
                    type="password" required minLength={6} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-violet-400 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-violet-600/20 cursor-pointer flex items-center justify-center gap-2 mt-2">
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
                <p className="text-zinc-500 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
