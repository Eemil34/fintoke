import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
