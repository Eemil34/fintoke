import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { npmInstallEnv, reclaimVolumeSpaceSync, volumeIsLow } from '@/lib/server/volumeCleanup';
import { GENERATED_IMAGES_CONFIG } from './siteImages';
import { STATIC_EXPORT_DIR, STATIC_EXPORT_VERSION } from './staticSite';

export const AGENT_PREVIEW_MARK = '.fintoke-agent';

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
    if (entry.name === 'instrumentation-client.ts' || entry.name === 'instrumentation-client.js') continue;
    if (entry.name.startsWith('.') && entry.name !== '.fintoke-from') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) await copyTree(src, dest);
    else await fs.copyFile(src, dest);
  }
}

async function stripImagePatchers(work: string): Promise<void> {
  await fs.rm(path.join(work, 'instrumentation-client.ts'), { force: true });
  await fs.rm(path.join(work, 'instrumentation-client.js'), { force: true });
  for (const rel of ['app/layout.tsx', 'app/layout.jsx', 'src/app/layout.tsx', 'src/app/layout.jsx']) {
    const file = path.join(work, rel);
    try {
      const original = await fs.readFile(file, 'utf8');
      const next = original
        .replace(/import\s+[^;]*ImageGuard[^;]*;?\s*/g, '')
        .replace(/<ImageGuard\s*\/>/g, '');
      if (next !== original) await fs.writeFile(file, next);
    } catch {
      // layout may not exist
    }
  }
}
export async function exportSnapshotStatic(snapshotPath: string): Promise<string> {
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'fintoke-static-'));
  try {
    await copyTree(snapshotPath, work);
    await stripImagePatchers(work);
    await fs.writeFile(path.join(work, 'next.config.js'), EXPORT_CONFIG);
    reclaimVolumeSpaceSync([], { aggressive: true });
    const exportEnv = npmInstallEnv({
      ...process.env,
      TMPDIR: os.tmpdir(),
      NEXT_TELEMETRY_DISABLED: '1',
    });
    let hasModules = false;
    try {
      await fs.access(path.join(snapshotPath, 'node_modules', 'next', 'package.json'));
      await fs.symlink(path.join(snapshotPath, 'node_modules'), path.join(work, 'node_modules'));
      hasModules = true;
    } catch {
      hasModules = false;
    }
    if (!hasModules) {
      await run('npm', ['install', '--include=dev', '--no-audit', '--no-fund'], work, {
        ...exportEnv,
        NODE_ENV: 'development',
      });
    }
    await run('npx', ['next', 'build'], work, {
      ...exportEnv,
      NODE_ENV: 'production',
    });
    const generated = path.join(work, 'out');
    await fs.access(path.join(generated, 'index.html'));
    const dest = path.join(snapshotPath, STATIC_EXPORT_DIR);
    await fs.rm(dest, { recursive: true, force: true });
    await fs.cp(generated, dest, { recursive: true });
    await fs.writeFile(path.join(dest, '.fintoke-export'), `${STATIC_EXPORT_VERSION}\n`);
    return dest;
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function hasAppPage(dir: string): Promise<boolean> {
  for (const rel of ['app/page.tsx', 'app/page.jsx', 'src/app/page.tsx', 'src/app/page.jsx']) {
    try {
      await fs.access(path.join(dir, rel));
      return true;
    } catch {
      // try next
    }
  }
  return false;
}

export async function resolveSiteRoot(dir: string): Promise<string> {
  const repo = path.join(dir, 'repo');
  if (await hasAppPage(repo)) return repo;
  if (await hasAppPage(dir)) return dir;
  return dir;
}

export async function markAgentPreview(projectPath: string): Promise<void> {
  const root = await resolveSiteRoot(projectPath);
  await fs.writeFile(path.join(root, AGENT_PREVIEW_MARK), `${Date.now()}\n`).catch(() => undefined);
  if (root !== projectPath) {
    await fs.writeFile(path.join(projectPath, AGENT_PREVIEW_MARK), `${Date.now()}\n`).catch(() => undefined);
  }
}

export async function hasAgentPreviewMark(projectPath: string): Promise<boolean> {
  for (const dir of [projectPath, path.join(projectPath, 'repo')]) {
    try {
      await fs.access(path.join(dir, AGENT_PREVIEW_MARK));
      return true;
    } catch {
      // keep looking
    }
  }
  return false;
}

export async function freezeProjectPreview(projectPath: string): Promise<string | null> {
  const root = await resolveSiteRoot(projectPath);
  if (!(await hasAppPage(root))) return null;
  const key = `proj:${root}`;
  const existing = inFlight.get(key);
  if (existing) {
    await existing.catch(() => false);
    const dest = path.join(root, STATIC_EXPORT_DIR, 'index.html');
    try {
      await fs.access(dest);
      return path.join(root, STATIC_EXPORT_DIR);
    } catch {
      return null;
    }
  }
  const work = (async () => {
    try {
      await exportSnapshotStatic(root);
      lastFailAt.delete(key);
      lastErrors.delete(key);
      return true;
    } catch (error) {
      lastFailAt.set(key, Date.now());
      lastErrors.set(key, { at: new Date().toISOString(), message: errorMessage(error) });
      console.warn('[static] Project preview freeze failed:', error);
      return false;
    }
  })();
  inFlight.set(key, work);
  try {
    const ok = await work;
    return ok ? path.join(root, STATIC_EXPORT_DIR) : null;
  } finally {
    inFlight.delete(key);
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
    const { hasStaticExport, hasCurrentStaticExport } = await import('./staticSite');
    const { resolveSnapshotDir } = await import('./snapshot');
    if (await hasCurrentStaticExport(templateId)) return true;
    if (volumeIsLow()) {
      reclaimVolumeSpaceSync([], { aggressive: true });
      if (volumeIsLow()) return false;
    }
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
