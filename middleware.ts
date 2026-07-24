import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { applyRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rateLimit';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // ─── 1. CORS Origin Locking on API Routes ─────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const siteUrl = process.env.SITE_URL || request.nextUrl.origin;

    if (origin && origin !== siteUrl && origin !== 'http://localhost:8080') {
      return NextResponse.json(
        { error: 'CORS policy: Access denied for origin' },
        { status: 403 }
      );
    }
  }

  // ─── 2. Rate Limiting Middleware ──────────────────────────────────────────
  if (pathname.startsWith('/api/auth/')) {
    // Strict rate limit on Auth endpoints: 5 attempts per 15 min per IP
    const authBlocked = applyRateLimit(`auth_ip:${clientIp}`, RATE_LIMIT_PRESETS.AUTH);
    if (authBlocked) return authBlocked;
  } else if (pathname.startsWith('/api/')) {
    // Baseline global IP rate limit across all API endpoints: 100 req / 1 min
    const globalBlocked = applyRateLimit(`global_ip:${clientIp}`, RATE_LIMIT_PRESETS.GLOBAL_IP);
    if (globalBlocked) return globalBlocked;
  }

  // ─── 3. Supabase Auth Session Validation ──────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    user = null;
  }

  // Per-user rate limiting if session exists
  if (user && pathname.startsWith('/api/')) {
    const userBlocked = applyRateLimit(`user_api:${user.id}`, RATE_LIMIT_PRESETS.STANDARD);
    if (userBlocked) return userBlocked;
  }

  // Define protected & auth route rules
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/medical-records') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/vitals') ||
    pathname.startsWith('/appointments') ||
    pathname.startsWith('/admin');

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages and root landing to /dashboard
  if ((isAuthRoute || pathname === '/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
