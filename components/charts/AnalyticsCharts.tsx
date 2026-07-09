'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
} from 'recharts'

interface Application {
  status: string
  created_at: string
  applied_date: string | null
}

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved', applied: 'Applied', phone_screen: 'Phone Screen',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
}

const BAR_COLORS = ['#7C3AED','#A78BFA','#F59E0B','#F97316','#10B981','#F43F5E','#A1A1AA']

export function AnalyticsCharts({ applications }: { applications: Application[] }) {
  const statusCounts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const weeklyMap: Record<string, number> = {}
  applications.forEach(a => {
    const date = new Date(a.created_at)
    const day = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    const key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    weeklyMap[key] = (weeklyMap[key] ?? 0) + 1
  })
  const weeklyData = Object.entries(weeklyMap).map(([week, count]) => ({ week, count }))

  const barData = Object.entries(STATUS_LABELS)
    .map(([status, label]) => ({ label, count: statusCounts[status] ?? 0 }))
    .filter(d => d.count > 0)

  const total     = applications.length
  const applied   = statusCounts['applied'] ?? 0
  const interview = statusCounts['interview'] ?? 0
  const offer     = statusCounts['offer'] ?? 0

  const rates = [
    { label: 'Applied Rate',   value: total     ? Math.round((applied   / total)     * 100) : 0, color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
    { label: 'Interview Rate', value: applied   ? Math.round((interview / applied)   * 100) : 0, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
    { label: 'Offer Rate',     value: interview ? Math.round((offer     / interview) * 100) : 0, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ]

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E4E4E7',
    borderRadius: 10,
    color: '#18181B',
    fontSize: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {rates.map(r => (
          <div key={r.label} className={`bg-white border ${r.border} rounded-2xl p-5 text-center shadow-sm`}>
            <p className={`text-3xl font-bold ${r.color} tabular-nums`}>{r.value}%</p>
            <p className="text-zinc-500 text-sm mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      {weeklyData.length > 1 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-zinc-900 font-semibold mb-6">Applications Per Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
              <XAxis dataKey="week" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" name="Applications" stroke="#7C3AED" strokeWidth={2.5}
                dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6, fill: '#6D28D9' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {barData.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-zinc-900 font-semibold mb-6">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F4F4F5' }} />
              <Bar dataKey="count" name="Applications" radius={[0, 6, 6, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {applications.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="font-medium text-zinc-500">Add some applications to see your analytics</p>
        </div>
      )}
    </div>
  )
}
