'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layouts/Sidebar'
import { TopBar } from '@/components/layouts/TopBar'
import { LayoutTransition } from '@/components/providers/LayoutTransition'
import { UserProvider, useUser } from '@/contexts/UserContext'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const { setUser } = useUser()
  const router = useRouter()
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (!profile?.full_name) { router.push('/onboarding'); return }

      setUser(user.id, profile.full_name.split(' ')[0])
      setReady(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFD' }}>
      <svg className="w-6 h-6 animate-spin" style={{ color: '#2B79C2' }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <LayoutTransition>{children}</LayoutTransition>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  )
}
