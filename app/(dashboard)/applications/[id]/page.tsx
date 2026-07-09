import { DEMO_APPLICATIONS, DEMO_TIMELINE, DEMO_RESUMES } from '@/lib/demo-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ApplicationStatus, ApplicationTimeline } from '@/types'

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved:        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  applied:      'bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400',
  phone_screen: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  interview:    'bg-[#FEF0E7] dark:bg-[#E8681E]/20 text-[#E8681E] dark:text-[#E8681E]',
  offer:        'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
  rejected:     'bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400',
  withdrawn:    'bg-slate-100 dark:bg-slate-700 text-slate-400',
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved', applied: 'Applied', phone_screen: 'Phone Screen',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const app = DEMO_APPLICATIONS.find(a => a.id === params.id) ?? DEMO_APPLICATIONS[0]
  if (!app) notFound()

  const resume = DEMO_RESUMES.find(r => r.id === app.resume_id)
  const timeline = DEMO_TIMELINE.filter(t => t.application_id === app.id)

  const salary = app.salary_min && app.salary_max
    ? `$${Math.round(app.salary_min / 1000)}k – $${Math.round(app.salary_max / 1000)}k`
    : null

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/applications" className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm transition">
        ← Applications
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{app.job_title}</h1>
            <p className="text-indigo-500 font-medium text-lg">{app.company_name}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
              {app.location   && <span>📍 {app.location}</span>}
              {app.work_type  && <span className="capitalize">🏢 {app.work_type}</span>}
              {salary         && <span>💰 {salary}</span>}
              {app.applied_date && <span>📅 Applied {new Date(app.applied_date).toLocaleDateString()}</span>}
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[app.status as ApplicationStatus]}`}>
            {STATUS_LABELS[app.status as ApplicationStatus]}
          </span>
        </div>
      </div>

      {/* Status selector (visual only in demo) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).filter(s => s !== 'withdrawn').map(s => (
            <button key={s}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer
                ${app.status === s ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {app.notes && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Notes</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{app.notes}</p>
        </div>
      )}

      {resume && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Resume Used</h2>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-300 text-sm">{resume.title}</p>
            <Link href={`/resumes/${resume.id}`} className="text-indigo-500 hover:text-indigo-400 text-xs transition">View →</Link>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Activity Timeline</h2>
        {timeline.length > 0 ? (
          <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-6 ml-3">
            {timeline.map((entry: ApplicationTimeline) => (
              <li key={entry.id} className="ml-5">
                <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
                    {STATUS_LABELS[entry.status]}
                  </span>
                  <time className="text-slate-400 text-xs">{new Date(entry.changed_at).toLocaleString()}</time>
                </div>
                {entry.note && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{entry.note}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-400 text-sm">No status changes recorded yet.</p>
        )}
      </div>
    </div>
  )
}
