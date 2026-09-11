import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPassword,
  adminUsername,
  signAdminToken,
} from '@/lib/admin-auth';

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function tooManyAttempts(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) return false;
  return current.count >= 8;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  current.count += 1;
}

async function sha256Hex(value: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ success: false, error: 'Too many sign-in attempts. Try again later.' }, { status: 429 });
  }

  const expectedPassword = adminPassword();
  const body = (await request.json().catch(() => ({}))) as { password?: string; username?: string };
  const password = typeof body.password === 'string' ? body.password : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const userOk = timingSafeEqualHex(await sha256Hex(username), await sha256Hex(adminUsername()));
  const passOk = timingSafeEqualHex(await sha256Hex(password), await sha256Hex(expectedPassword));
  if (!userOk || !passOk) {
    recordFailure(ip);
    return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, redirect: '/studio' });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: await signAdminToken(),
    ...adminCookieOptions({ maxAge: 60 * 60 * 24 * 7 }),
  });
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
