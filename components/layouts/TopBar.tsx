'use client'

interface TopBarProps { onMenuClick: () => void }

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center gap-4 px-4 h-14
      bg-white/95 backdrop-blur-md border-b border-blue-100">
      <button onClick={onMenuClick} className="cursor-pointer transition p-1" aria-label="Open menu"
        style={{ color: '#9BBAD8' }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <img src="/careertrack.png" alt="CareerTrack" className="h-7 w-auto" />
    </header>
  )
}
