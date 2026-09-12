import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { projectsDir, volumeDataDir, volumeHeartbeat, writableDataDir } from '@/lib/server/paths';
import { getServiceToken } from '@/lib/services/tokens';
import { loadMailSettings } from '@/lib/services/mail';
import { listEmails, listPeople } from '@/lib/services/workspace';

const RELEASE = '2026-09-12-emails-json';

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

  let github = false;
  let vercel = false;
  let resend = false;
  let smtp = false;
  try {
    github = Boolean((await getServiceToken('github'))?.token);
    vercel = Boolean((await getServiceToken('vercel'))?.token);
    const mail = await loadMailSettings();
    resend = Boolean(mail.resendApiKey);
    smtp = Boolean(mail.smtp.host && mail.smtp.user && mail.smtp.password);
  } catch (error) {
    console.error('[health] Could not read saved secrets:', error);
  }

  let emailCount = 0;
  let peopleCount = 0;
  try {
    emailCount = (await listEmails()).length;
    peopleCount = (await listPeople()).length;
  } catch (error) {
    console.error('[health] Could not read saved emails:', error);
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
        railwayVolumeMountPath: process.env['RAILWAY_VOLUME_MOUNT_PATH'] || null,
        railwayVolumeName: process.env['RAILWAY_VOLUME_NAME'] || null,
        volumeSince: volumeHeartbeat(),
        dataDir,
        projectsDir: projects,
        projectCount,
        emailCount,
        peopleCount,
        volumeTemplates,
        databaseUrl: (process.env.DATABASE_URL || '').replace(/\/\/.*@/, '//***@'),
        secrets: {
          github,
          vercel,
          resend,
          smtp,
        },
        files: {
          workspace: fs.existsSync(path.join(dataDir, 'workspace.json')),
          emails: fs.existsSync(path.join(dataDir, 'emails.json')),
          people: fs.existsSync(path.join(dataDir, 'people.json')),
          emailTemplates: fs.existsSync(path.join(dataDir, 'email-templates.json')),
          leads: fs.existsSync(path.join(dataDir, 'leads.json')),
          mail: fs.existsSync(path.join(dataDir, 'mail.json')),
          templates: fs.existsSync(path.join(dataDir, 'templates.json')),
          userTemplates: fs.existsSync(path.join(dataDir, 'templates-user.json')),
          serviceTokens: fs.existsSync(path.join(dataDir, 'service-tokens.json')),
        },
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
