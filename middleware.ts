import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './lib/i18n';

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && (locales as ReadonlyArray<string>).includes(cookieLocale)) {
    return cookieLocale;
  }
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
    if ((locales as ReadonlyArray<string>).includes(preferredLocale)) {
      return preferredLocale;
    }
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Bypass: internals, API, static assets, and auth routes ────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ── 2. Admin route protection ─────────────────────────────────────────────
  const isAdminPath = (locales as ReadonlyArray<string>).some(
    (loc) => pathname.startsWith(`/${loc}/admin`) || pathname === `/${loc}/admin`
  );

  if (isAdminPath) {
    const roleCookie = request.cookies.get('luxe_role');

    if (roleCookie?.value === 'admin') {
      // ✅ Cookie explicitly says admin — allow through, skip to locale logic below
    } else if (roleCookie !== undefined) {
      // Cookie IS present but is NOT 'admin' (e.g. 'user').
      // We already have a definitive answer — go to login.
      const locale = getLocale(request);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      // Cookie is ABSENT — might be a stale session before the cookie was introduced.
      // Check if a Supabase session exists before deciding what to do.
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll() { /* read-only in middleware */ },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No active session at all → send to login
        const locale = getLocale(request);
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Has a session but no role cookie → refresh the cookie and come back
      const refreshUrl = new URL('/auth/refresh-role', request.url);
      refreshUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(refreshUrl);
    }
  }

  // ── 3. Locale redirect ────────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const localeInPath = pathname.split('/')[1];
    const response = NextResponse.next();
    const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (currentCookie !== localeInPath) {
      response.cookies.set('NEXT_LOCALE', localeInPath, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  }

  // Redirect root paths to locale-prefixed version
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
