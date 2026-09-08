import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const ok = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ success: true, authenticated: ok });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
