import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const RELEASE = '2026-09-10-preview-stay';

export async function GET() {
  const seed = path.join(process.cwd(), 'seed', 'templates', 'snapshots');
  let savedTemplates: string[] = [];
  try {
    savedTemplates = fs
      .readdirSync(seed, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          fs.existsSync(path.join(seed, entry.name, 'app', 'page.tsx')),
      )
      .map((entry) => entry.name);
  } catch {
    savedTemplates = [];
  }

  return NextResponse.json(
    {
      ok: true,
      service: 'fintoke',
      release: RELEASE,
      templatePack: 'saved-sites',
      savedTemplates,
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
