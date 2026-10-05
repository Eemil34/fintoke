import { NextResponse } from 'next/server';

const RELEASE = '2026-10-05-landing-only';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'fintoke',
      release: RELEASE,
      landingOnly: true,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
