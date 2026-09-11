import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth';

function isPublicApi(pathname: string) {
  if (pathname === '/api/health') return true;
  if (pathname === '/api/admin/login') return true;
  if (pathname === '/api/contact') return true;
  if (pathname.startsWith('/api/v1')) return true;
  return false;
}

function isProtectedPath(pathname: string) {
  if (pathname.startsWith('/api/')) return !isPublicApi(pathname);
  if (pathname === '/studio' || pathname.startsWith('/studio/')) return true;
  if (pathname.startsWith('/dashboard')) return true;
  if (/^\/[^/]+\/chat(?:\/|$)/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();
  if (await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Sign in required' }, { status: 401 });
  }

  const login = new URL('/login', request.url);
  login.searchParams.set('next', pathname.startsWith('/preview/') ? '/studio' : pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    '/studio',
    '/studio/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/:project_id/chat',
    '/:project_id/chat/:path*',
    '/api/:path*',
  ],
};
