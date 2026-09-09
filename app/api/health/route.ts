import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'fintoke', templatePack: 'saved-sites' });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
