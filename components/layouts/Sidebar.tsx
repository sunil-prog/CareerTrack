'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from '@/lib/supabase/auth'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: GridIcon },
  { href: '/profile',      label: 'Profile',      icon: UserIcon },
  { href: '/resumes',      label: 'Resumes',      icon: DocumentIcon },
  { href: '/jobs',         label: 'Job Search',   icon: SearchIcon },
  { href: '/applications', label: 'Applications', icon: BriefcaseIcon },
  { href: '/analytics',    label: 'Analytics',    icon: ChartIcon },
]

interface SidebarProps { open: boolean; onClose: () => void }

export function Sidebar({ open, onClose }: SidebarProps) {
  const path = usePathname()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between border-b border-blue-100">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <img src="/careertrack.png" alt="CareerTrack" className="h-8 w-auto" />
        </motion.div>
        <button onClick={onClose} className="lg:hidden cursor-pointer transition p-1 rounded-lg hover:bg-blue-50"
          style={{ color: '#9BBAD8' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }, i) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <motion.div key={href}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}>
              <Link href={href} onClick={onClose}
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer overflow-hidden"
                style={{ color: active ? '#1C3A6B' : '#7A9BBF' }}>

                {/* Active pill */}
                {active && (
                  <motion.div layoutId="activeNav"
                    className="absolute inset-0 rounded-xl border"
                    style={{ background: 'linear-gradient(135deg, #EBF3FA 0%, #FEF0E7 100%)', borderColor: '#C7DEEE' }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }} />
                )}

                {/* Hover */}
                {!active && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#F0F6FC' }} />
                )}

                {/* Icon */}
                <span className="relative flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all"
                  style={active
                    ? { background: 'linear-gradient(135deg, #1C3A6B 0%, #2B79C2 100%)', color: 'white' }
                    : { color: '#9BBAD8' }}>
                  <Icon className="w-4 h-4" />
                </span>

                <span className="relative flex-1">{label}</span>

                {active && (
                  <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: '#E8681E' }} />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 mt-4 border-t border-blue-50">
        <form action={signOut}>
          <button type="submit"
            className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer hover:bg-orange-50"
            style={{ color: '#9BBAD8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E8681E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9BBAD8')}>
            <SignOutIcon className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 backdrop-blur-sm lg:hidden" style={{ background: 'rgba(28,58,107,0.25)' }} onClick={onClose} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 z-40 h-full w-64 lg:hidden bg-white shadow-2xl" style={{ boxShadow: '4px 0 24px rgba(28,58,107,0.10)' }}>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-blue-100">
        {sidebarContent}
      </aside>
    </>
  )
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function DocumentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
}
function BriefcaseIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
}
function ChartIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
}
function SignOutIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
}
