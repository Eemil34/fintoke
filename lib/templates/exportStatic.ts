import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { npmInstallEnv, reclaimVolumeSpaceSync } from '@/lib/server/volumeCleanup';
import { GENERATED_IMAGES_CONFIG } from './siteImages';
import { STATIC_EXPORT_DIR } from './staticSite';

const EXPORT_CONFIG = `const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname),
  ${GENERATED_IMAGES_CONFIG},
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
`;

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    const collect = (chunk: Buffer | string) => {
      log += chunk.toString();
      if (log.length > 20_000) log = log.slice(-12_000);
    };
    child.stderr.on('data', collect);
    child.stdout.on('data', collect);
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(log.trim() || `${command} ${args.join(' ')} failed (${code})`));
    });
  });
}

async function copyTree(from: string, to: string): Promise<void> {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out' || entry.name === STATIC_EXPORT_DIR) {
      continue;
    }
    if (entry.name.startsWith('.') && entry.name !== '.fintoke-from') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) await copyTree(src, dest);
    else await fs.copyFile(src, dest);
  }
}

export async function exportSnapshotStatic(snapshotPath: string): Promise<string> {
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'fintoke-static-'));
  try {
    await copyTree(snapshotPath, work);
    await fs.writeFile(path.join(work, 'next.config.js'), EXPORT_CONFIG);
    reclaimVolumeSpaceSync();
    const exportEnv = npmInstallEnv({
      ...process.env,
      TMPDIR: os.tmpdir(),
      NEXT_TELEMETRY_DISABLED: '1',
    });
    await run('npm', ['install', '--include=dev', '--no-audit', '--no-fund'], work, {
      ...exportEnv,
      NODE_ENV: 'development',
    });
    await run('npx', ['next', 'build'], work, {
      ...exportEnv,
      NODE_ENV: 'production',
    });
    const generated = path.join(work, 'out');
    await fs.access(path.join(generated, 'index.html'));
    const dest = path.join(snapshotPath, STATIC_EXPORT_DIR);
    await fs.rm(dest, { recursive: true, force: true });
    await fs.cp(generated, dest, { recursive: true });
    return dest;
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
  }
}

const inFlight = new Map<string, Promise<boolean>>();
const lastFailAt = new Map<string, number>();
const lastErrors = new Map<string, { at: string; message: string }>();
const FAIL_COOLDOWN_MS = 10 * 60 * 1000;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.slice(-800);
  return String(error).slice(-800);
}

export function staticFreezeStatus(): {
  running: string[];
  lastErrors: Record<string, { at: string; message: string }>;
} {
  return {
    running: [...inFlight.keys()],
    lastErrors: Object.fromEntries(lastErrors.entries()),
  };
}

export async function ensureTemplateStatic(templateId: string): Promise<boolean> {
  const existing = inFlight.get(templateId);
  if (existing) return existing;

  const work = (async () => {
    const { hasStaticExport } = await import('./staticSite');
    const { resolveSnapshotDir } = await import('./snapshot');
    if (await hasStaticExport(templateId)) return true;
    const failedAt = lastFailAt.get(templateId) || 0;
    if (failedAt && Date.now() - failedAt < FAIL_COOLDOWN_MS) return false;
    const dir = await resolveSnapshotDir(templateId);
    if (!dir) return false;
    try {
      await exportSnapshotStatic(dir);
      lastFailAt.delete(templateId);
      lastErrors.delete(templateId);
    } catch (error) {
      lastFailAt.set(templateId, Date.now());
      lastErrors.set(templateId, { at: new Date().toISOString(), message: errorMessage(error) });
      throw error;
    }
    return hasStaticExport(templateId);
  })();

  inFlight.set(templateId, work);
  try {
    return await work;
  } finally {
    inFlight.delete(templateId);
  }
}

let freezeQueue: Promise<void> = Promise.resolve();

export function scheduleMissingStaticExports(templateIds: string[]): void {
  for (const templateId of templateIds) {
    freezeQueue = freezeQueue.then(() =>
      ensureTemplateStatic(templateId).then(
        () => undefined,
        (error) => {
          console.warn(`[static] Freeze skipped for ${templateId}:`, error);
        },
      ),
    );
  }
}
