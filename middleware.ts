import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth';

function isProtectedPath(pathname: string) {
  if (pathname === '/studio' || pathname.startsWith('/studio/')) return true;
  if (pathname.startsWith('/dashboard')) return true;
  if (pathname.startsWith('/preview/')) return true;
  if (/^\/[^/]+\/chat(?:\/|$)/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();
  if (await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();
  const login = new URL('/login', request.url);
  login.searchParams.set('next', pathname);
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
    '/preview/:path*',
  ],
};
