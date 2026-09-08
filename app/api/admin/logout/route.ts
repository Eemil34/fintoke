import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/admin-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: ADMIN_COOKIE, value: '', ...adminCookieOptions({ maxAge: 0 }) });
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
