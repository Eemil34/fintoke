import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { projectsDir, volumeDataDir, writableDataDir } from '@/lib/server/paths';

const RELEASE = '2026-09-10-github-contents';

export async function GET() {
  const seed = path.join(process.cwd(), 'seed', 'templates', 'snapshots');
  const volume = volumeDataDir();
  const dataDir = writableDataDir();
  const projects = projectsDir();

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

  let volumeTemplates: string[] = [];
  try {
    volumeTemplates = fs
      .readdirSync(path.join(dataDir, 'templates', 'snapshots'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    volumeTemplates = [];
  }

  let projectCount = 0;
  try {
    projectCount = fs.readdirSync(projects).filter((name) => !name.startsWith('.')).length;
  } catch {
    projectCount = 0;
  }

  return NextResponse.json(
    {
      ok: true,
      service: 'fintoke',
      release: RELEASE,
      templatePack: 'saved-sites',
      savedTemplates,
      persistence: {
        volumeMounted: Boolean(volume),
        dataDir,
        projectsDir: projects,
        projectCount,
        volumeTemplates,
        databaseUrl: (process.env.DATABASE_URL || '').replace(/\/\/.*@/, '//***@'),
      },
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
