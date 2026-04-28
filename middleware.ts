import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

// Get the preferred locale, similar to above or using a library
function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && (locales as ReadonlyArray<string>).includes(cookieLocale)) {
    return cookieLocale;
  }

  // Very basic Accept-Language checking
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude API routes, next internal files, public files, and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||   // ← Auth callback must not get a locale prefix
    pathname.includes('.') || 
    pathname === '/favicon.ico'
  ) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const localeInPath = pathname.split('/')[1];
    const response = NextResponse.next();
    
    // Set cookie if missing or different
    const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (currentCookie !== localeInPath) {
      response.cookies.set('NEXT_LOCALE', localeInPath, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    }
    return response;
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /property
  // The new URL is now /en/property
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
