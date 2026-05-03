'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { updateUserRole } from './actions'

interface RoleEditorProps {
  userId: string
  currentRole: string
  isSelf: boolean
}

const ROLES = [
  { value: 'admin', label: 'Administrator', icon: 'shield' },
  { value: 'agent', label: 'Agent', icon: 'support_agent' },
  { value: 'user', label: 'Viewer', icon: 'visibility' },
]

export default function RoleEditor({ userId, currentRole, isSelf }: RoleEditorProps) {
  const [role, setRole] = useState(currentRole)
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (newRole: string) => {
    if (newRole === role) {
      setOpen(false)
      return
    }
    setOpen(false)
    setErrorMsg(null)
    setSaved(false)

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        setErrorMsg(result.error)
        // Revert optimistic update
      } else {
        setRole(newRole)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    })
  }

  const btnClasses = open
    ? 'inline-flex items-center px-4 py-2 bg-primary text-white shadow-md text-xs font-medium rounded-lg hover:bg-primary-dark focus:outline-none transition-colors w-full md:w-auto justify-center'
    : 'inline-flex items-center px-4 py-2 border border-nordic/10 bg-white dark:bg-gray-800 shadow-sm text-xs font-medium rounded-lg text-nordic dark:text-white hover:bg-nordic hover:text-white dark:hover:bg-primary focus:outline-none transition-colors w-full md:w-auto justify-center'

  return (
    <div className="relative flex flex-col items-end w-full gap-1" ref={ref}>
      <div className="flex items-center gap-2">
        {isPending && (
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
        )}
        {saved && !isPending && (
          <span className="material-icons text-base text-green-500">check_circle</span>
        )}

        <button
          onClick={() => !isSelf && !isPending && setOpen((v) => !v)}
          disabled={isPending || isSelf}
          title={isSelf ? 'You cannot change your own role' : undefined}
          className={`${btnClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? 'Saving…' : 'Change Role'}
          <span className="material-icons text-[16px] ml-2">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="text-[10px] text-red-500 text-right max-w-[180px]">{errorMsg}</p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-lg bg-primary overflow-hidden z-50 origin-top-right">
          <div className="py-1" role="menu">
            {ROLES.map((r) => {
              const isActive = role === r.value
              return (
                <button
                  key={r.value}
                  onClick={() => handleChange(r.value)}
                  role="menuitem"
                  className={`group w-full flex items-center px-4 py-3 text-xs transition-colors text-left ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`material-icons text-sm mr-3 ${
                      isActive ? 'text-white' : 'text-white/50 group-hover:text-white'
                    }`}
                  >
                    {r.icon}
                  </span>
                  {r.label}
                  {isActive && (
                    <span className="material-icons text-xs ml-auto text-white">check</span>
                  )}
                </button>
              )
            })}
            <div className="border-t border-white/10 my-1" />
            <button
              role="menuitem"
              className="group w-full flex items-center px-4 py-3 text-xs text-left text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
            >
              <span className="material-icons text-sm mr-3 text-red-300 group-hover:text-red-100">
                block
              </span>
              Suspend User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
