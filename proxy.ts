import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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

export async function proxy(request: NextRequest) {
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

  // ── 2. Locale redirect ────────────────────────────────────────────────────
  // Admin auth/role protection is handled inside the admin layout (server component),
  // which can properly read and refresh the Supabase session.
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
