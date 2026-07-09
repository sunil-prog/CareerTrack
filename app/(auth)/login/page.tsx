'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-violet-100 rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-fuchsia-100 rounded-full blur-3xl pointer-events-none opacity-50" />

      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/careertrack.png" alt="CareerTrack" className="h-10 w-auto mx-auto" />
          </Link>
          <p className="text-zinc-500 text-sm mt-2">Sign in to continue</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl shadow-zinc-100">
          <h1 className="text-xl font-bold text-zinc-900 mb-6">Welcome back</h1>

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

          <form onSubmit={handleLogin} className="space-y-4">
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
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <p className="text-zinc-500 text-sm">
              No account?{' '}
              <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-zinc-400 text-xs mt-5"
        >
          In demo mode?{' '}
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-700 underline transition-colors">
            Go to dashboard →
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
