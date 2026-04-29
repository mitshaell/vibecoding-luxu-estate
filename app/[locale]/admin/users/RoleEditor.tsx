'use client'

import { createClient } from '../../../../lib/supabase/client'
import { useState } from 'react'

interface RoleEditorProps {
  userId: string
  currentRole: string
  isSelf: boolean
}

export default function RoleEditor({ userId, currentRole, isSelf }: RoleEditorProps) {
  const supabase = createClient()
  const [role, setRole] = useState(currentRole)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = async (newRole: string) => {
    setSaving(true)
    setSaved(false)
    setRole(newRole)
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving || isSelf}
        className="text-xs border rounded-lg px-2.5 py-1.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
        style={{
          borderColor: role === 'admin' ? '#8B5CF6' : '#D1D5DB',
          color: role === 'admin' ? '#8B5CF6' : '#374151',
          backgroundColor: role === 'admin' ? '#F5F3FF' : '#F9FAFB',
        }}
        title={isSelf ? 'No puedes cambiar tu propio rol' : ''}
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>

      {saving && (
        <span
          className="w-4 h-4 border-2 rounded-full animate-spin inline-block"
          style={{ borderColor: '#006655', borderTopColor: 'transparent' }}
        />
      )}
      {saved && (
        <span className="material-icons text-base" style={{ color: '#16a34a' }}>check_circle</span>
      )}
    </div>
  )
}
