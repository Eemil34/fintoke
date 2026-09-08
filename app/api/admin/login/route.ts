import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, adminPassword, signAdminToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { password?: string; username?: string };
  const password = typeof body.password === 'string' ? body.password : '';
  const username = typeof body.username === 'string' ? body.username.trim() : 'admin';
  if (username && username.toLowerCase() !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unknown user' }, { status: 401 });
  }
  if (password !== adminPassword()) {
    return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true, redirect: '/studio' });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: await signAdminToken(),
    ...adminCookieOptions({ maxAge: 60 * 60 * 24 * 30 }),
  });
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
