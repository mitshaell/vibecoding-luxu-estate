import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'

// Supported locales — keep in sync with lib/i18n.ts
const LOCALES = ['en', 'es'] as const
const DEFAULT_LOCALE = 'en'

function getLocaleFromRequest(request: Request): string {
  // 1. Try the NEXT_LOCALE cookie (set by the middleware on every page visit)
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/NEXT_LOCALE=([^;]+)/)
  if (match) {
    const val = match[1].trim()
    if ((LOCALES as ReadonlyArray<string>).includes(val)) return val
  }
  // 2. Fall back to Accept-Language
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return (LOCALES as ReadonlyArray<string>).includes(preferred) ? preferred : DEFAULT_LOCALE
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // ── Fetch the user's role from user_roles ──────────────────────────────
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.session.user.id)
        .single()

      const role = roleRow?.role ?? 'user'

      // ── Determine where to send the user ──────────────────────────────────
      // If a specific `next` destination was requested, respect it.
      // Otherwise, admins go to their panel; regular users go to home.
      let destination = next
      if (next === '/') {
        if (role === 'admin') {
          const locale = getLocaleFromRequest(request)
          destination = `/${locale}/admin`
        }
        // Regular users: stay on '/' — middleware will add the locale prefix
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const baseOrigin = isLocalEnv
        ? origin
        : forwardedHost
        ? `https://${forwardedHost}`
        : origin

      const response = NextResponse.redirect(`${baseOrigin}${destination}`)

      // ── Persist role as httpOnly cookie ───────────────────────────────────
      response.cookies.set('luxe_role', role, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: !isLocalEnv,
      })

      return response
    }
  }

  // Error fallback
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
