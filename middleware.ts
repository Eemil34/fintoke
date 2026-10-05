import { NextRequest, NextResponse } from 'next/server';

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  if (pathname === '/api/health' || pathname === '/api/contact') return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname === '/favicon.ico' || pathname === '/fintoke-icon.png' || pathname === '/robots.txt') return true;
  if (/\.(?:png|jpe?g|gif|svg|ico|webp|txt|xml|woff2?)$/i.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
