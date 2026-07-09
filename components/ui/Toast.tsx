'use client'

interface ToastProps {
  message: string
  show: boolean
}

export function Toast({ message, show }: ToastProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3
      bg-slate-900 dark:bg-slate-800 border border-slate-700
      text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl
      transition-all duration-300
      ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      {message}
    </div>
  )
}
