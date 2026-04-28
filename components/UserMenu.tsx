'use client'

import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface UserMenuProps {
  avatarUrl: string | null
  email: string | null
  logoutLabel: string
  profileLabel: string
  locale: string
}

export default function UserMenu({ avatarUrl, email, logoutLabel, profileLabel, locale }: UserMenuProps) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const initial = email?.charAt(0).toUpperCase() || 'U'
  const src = avatarUrl || `https://ui-avatars.com/api/?name=${initial}&background=19322F&color=fff&bold=true`

  return (
    <div className="relative pl-2 border-l border-nordic-dark/10 ml-2" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 group"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-mosque transition-all">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Profile" className="w-full h-full object-cover" src={src} />
        </div>
        <span className="material-icons text-nordic-dark/50 text-sm transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-nordic-dark/8 py-1 z-50 animate-fadeIn overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-nordic-dark/6">
            <p className="text-xs text-nordic-muted truncate">{email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-icons text-base">logout</span>
            {logoutLabel}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.15s ease; }
      `}</style>
    </div>
  )
}
