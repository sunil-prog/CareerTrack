'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ResumeCardActions({ resumeId, isDefault }: { resumeId: string; isDefault: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  async function setDefault() {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('resumes').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('resumes').update({ is_default: true }).eq('id', resumeId)
    router.refresh()
  }

  async function deleteResume() {
    if (!confirm('Delete this resume? This cannot be undone.')) return
    await supabase.from('resumes').delete().eq('id', resumeId)
    router.refresh()
  }

  return (
    <>
      {!isDefault && (
        <button onClick={setDefault} title="Set as default"
          className="text-slate-400 hover:text-indigo-500 text-sm px-2 cursor-pointer transition">
          ★
        </button>
      )}
      <button onClick={deleteResume} title="Delete"
        className="text-slate-400 hover:text-red-400 text-sm px-2 cursor-pointer transition">
        ✕
      </button>
    </>
  )
}
