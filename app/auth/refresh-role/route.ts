import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

/**
 * /auth/refresh-role
 * Re-reads the user's role from user_roles and refreshes the luxe_role cookie.
 * Called by the middleware when a session exists but the role cookie is stale or missing.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No session at all — send to login
    return NextResponse.redirect(`${origin}/auth/callback`)
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const role = roleRow?.role ?? 'user'
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const response = NextResponse.redirect(`${origin}${next}`)
  response.cookies.set('luxe_role', role, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    secure: !isLocalEnv,
  })

  return response
}
