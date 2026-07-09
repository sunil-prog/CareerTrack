'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import type { JobApplication, ApplicationStatus } from '@/types'
import Link from 'next/link'

const COLUMNS: { status: ApplicationStatus; label: string; border: string; dot: string; bg: string }[] = [
  { status: 'saved',        label: 'Saved',        border: 'border-zinc-300',    dot: 'bg-zinc-400',    bg: 'bg-zinc-50' },
  { status: 'applied',      label: 'Applied',      border: 'border-[#2B79C2]',  dot: 'bg-[#1C3A6B]',  bg: 'bg-[#EBF3FA]' },
  { status: 'phone_screen', label: 'Phone Screen', border: 'border-amber-400',   dot: 'bg-amber-500',   bg: 'bg-amber-50' },
  { status: 'interview',    label: 'Interview',    border: 'border-orange-400',  dot: 'bg-[#E8681E]',  bg: 'bg-[#FEF0E7]' },
  { status: 'offer',        label: 'Offer',        border: 'border-emerald-400', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  { status: 'rejected',     label: 'Rejected',     border: 'border-[#2B79C2]',    dot: 'bg-[#1C3A6B]',    bg: 'bg-[#EBF3FA]' },
]

type Board = Record<ApplicationStatus, JobApplication[]>

function buildBoard(apps: JobApplication[]): Board {
  const board = {} as Board
  COLUMNS.forEach(c => { board[c.status] = [] })
  apps.forEach(a => { if (board[a.status]) board[a.status].push(a) })
  return board
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'text-zinc-500', applied: 'text-[#2B79C2]', phone_screen: 'text-amber-600',
  interview: 'text-[#E8681E]', offer: 'text-emerald-600', rejected: 'text-[#1C3A6B]', withdrawn: 'text-zinc-400',
}
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved', applied: 'Applied', phone_screen: 'Phone Screen',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
}
const STATUS_DOT: Record<ApplicationStatus, string> = {
  saved: 'bg-zinc-400', applied: 'bg-[#1C3A6B]', phone_screen: 'bg-amber-500',
  interview: 'bg-[#E8681E]', offer: 'bg-emerald-500', rejected: 'bg-[#1C3A6B]', withdrawn: 'bg-zinc-300',
}

export default function ApplicationsPage() {
  const { userId } = useUser()
  const [board, setBoard] = useState<Board>(() => buildBoard([]))
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('job_applications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => {
        const apps = (data ?? []) as JobApplication[]
        setBoard(buildBoard(apps))
        setTotal(apps.length)
        setLoading(false)
      })
  }, [userId])

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcStatus = source.droppableId as ApplicationStatus
    const dstStatus = destination.droppableId as ApplicationStatus
    const srcItems = [...board[srcStatus]]
    const dstItems = srcStatus === dstStatus ? srcItems : [...board[dstStatus]]
    const [moved] = srcItems.splice(source.index, 1)
    dstItems.splice(destination.index, 0, { ...moved, status: dstStatus })
    setBoard(prev => ({ ...prev, [srcStatus]: srcStatus === dstStatus ? dstItems : srcItems, [dstStatus]: dstItems }))

    // Save to Supabase
    const supabase = createClient()
    await supabase.from('job_applications').update({ status: dstStatus }).eq('id', draggableId)
  }

  const allApps = Object.values(board).flat()

  return (
    <div className="p-6 max-w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Applications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{loading ? '…' : `${total} total`} · drag cards to update status</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-zinc-200 rounded-xl p-1 flex gap-1">
            {(['kanban', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="relative px-4 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer capitalize">
                {view === v && (
                  <motion.div layoutId="viewTab"
                    className="absolute inset-0 bg-zinc-100 rounded-lg border border-zinc-200"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }} />
                )}
                <span className={`relative ${view === v ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>{v}</span>
              </button>
            ))}
          </div>
          <Link href="/jobs"
            className="bg-gradient-to-r from-[#1C3A6B] to-[#2B79C2] hover:from-[#152E55] hover:to-[#1C3A6B] text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-[#1C3A6B]/15">
            + Find Jobs
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <svg className="w-6 h-6 animate-spin text-[#2B79C2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'kanban' ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {COLUMNS.map((col, colIdx) => (
                    <motion.div key={col.status}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: colIdx * 0.05, duration: 0.3 }}
                      className="shrink-0 w-[264px]">
                      <div className={`flex items-center justify-between mb-3 pb-2.5 border-b-2 ${col.border}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <span className="text-zinc-800 font-semibold text-sm">{col.label}</span>
                        </div>
                        <span className="text-zinc-400 text-xs bg-zinc-100 px-2 py-0.5 rounded-full font-medium">
                          {board[col.status].length}
                        </span>
                      </div>
                      <Droppable droppableId={col.status}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}
                            className={`min-h-28 space-y-2.5 rounded-2xl transition-all duration-200 p-2 -m-2
                              ${snapshot.isDraggingOver ? `${col.bg} ring-1 ring-[#C7DEEE]` : ''}`}>
                            {board[col.status].map((app, index) => (
                              <Draggable key={app.id} draggableId={app.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style}
                                    className={`group bg-white border rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-all duration-150
                                      ${snapshot.isDragging
                                        ? 'border-[#2B79C2] shadow-xl shadow-[#EBF3FA] scale-105 rotate-1 z-50'
                                        : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-100'}`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <p className="text-zinc-900 font-semibold text-sm leading-tight line-clamp-2">{app.job_title}</p>
                                    </div>
                                    <p className="text-[#2B79C2] text-xs font-semibold mb-2">{app.company_name}</p>
                                    <div className="flex items-center justify-between">
                                      {app.location && <p className="text-zinc-400 text-xs truncate">{app.location}</p>}
                                      {app.salary_min && (
                                        <p className="text-emerald-600 text-xs font-semibold ml-auto shrink-0">
                                          ${Math.round(app.salary_min / 1000)}k+
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {board[col.status].length === 0 && (
                              <div className="flex items-center justify-center h-20 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                                Drop here
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </motion.div>
                  ))}
                </div>
              </DragDropContext>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                {allApps.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400">
                    <p className="font-medium">No applications yet</p>
                    <Link href="/jobs" className="text-[#2B79C2] text-sm mt-2 inline-block hover:underline">Find Jobs →</Link>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50">
                        {['Company', 'Role', 'Location', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left text-zinc-400 font-semibold px-5 py-3.5 text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {allApps.map((app, i) => (
                        <motion.tr key={app.id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className="hover:bg-zinc-50 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-zinc-900">{app.company_name}</td>
                          <td className="px-5 py-3.5 text-zinc-600">{app.job_title}</td>
                          <td className="px-5 py-3.5 text-zinc-400 text-xs">{app.location ?? '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_COLORS[app.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[app.status]}`} />
                              {STATUS_LABELS[app.status]}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400 text-xs">
                            {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
