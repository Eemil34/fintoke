import fs from 'fs';
import os from 'os';
import path from 'path';
import { projectsDir, writableDataDir } from '@/lib/server/paths';

const HEAVY_DIR_NAMES = new Set([
  'node_modules',
  '.next',
  '.turbo',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.pnpm-store',
]);

const VOLUME_CACHE_DIRS = ['.npm', '.cache', '.turbo', '.pnpm-store'];

export function isNoSpaceError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException)?.code;
  if (code === 'ENOSPC') return true;
  const message = error instanceof Error ? error.message : String(error);
  return /ENOSPC|no space left on device/i.test(message);
}

export function volumeDiskInfo(dir = writableDataDir()): {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
} | null {
  try {
    const stats = fs.statfsSync(dir);
    const block = Number(stats.bsize || 0);
    const totalBytes = Number(stats.blocks) * block;
    const freeBytes = Number(stats.bavail) * block;
    return {
      totalBytes,
      freeBytes,
      usedBytes: Math.max(0, totalBytes - freeBytes),
    };
  } catch {
    return null;
  }
}

function rmDir(dir: string): boolean {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function shouldKeepProject(name: string, keepProjectIds: Set<string>): boolean {
  return keepProjectIds.has(name);
}

export function reclaimVolumeSpaceSync(keepProjectIds: string[] = []): {
  removed: string[];
  disk: ReturnType<typeof volumeDiskInfo>;
} {
  const keep = new Set(keepProjectIds.filter(Boolean));
  const removed: string[] = [];
  const dataDir = writableDataDir();
  const projects = projectsDir();

  let projectEntries: fs.Dirent[] = [];
  try {
    projectEntries = fs.readdirSync(projects, { withFileTypes: true });
  } catch {
    projectEntries = [];
  }

  for (const entry of projectEntries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const projectPath = path.join(projects, entry.name);
    if (shouldKeepProject(entry.name, keep)) continue;
    for (const heavy of HEAVY_DIR_NAMES) {
      const target = path.join(projectPath, heavy);
      if (fs.existsSync(target) && rmDir(target)) {
        removed.push(target);
      }
    }
  }

  const seedRoot = path.join(process.cwd(), 'seed', 'templates', 'snapshots');
  const volumeSnaps = path.join(dataDir, 'templates', 'snapshots');
  let snapEntries: fs.Dirent[] = [];
  try {
    snapEntries = fs.readdirSync(volumeSnaps, { withFileTypes: true });
  } catch {
    snapEntries = [];
  }
  for (const entry of snapEntries) {
    if (!entry.isDirectory()) continue;
    const volumePath = path.join(volumeSnaps, entry.name);
    const userMark = path.join(volumePath, '.fintoke-user-snapshot');
    const seedPath = path.join(seedRoot, entry.name, 'package.json');
    if (fs.existsSync(userMark)) continue;
    if (!fs.existsSync(seedPath)) continue;
    if (rmDir(volumePath)) removed.push(volumePath);
  }

  for (const name of VOLUME_CACHE_DIRS) {
    const target = path.join(dataDir, name);
    if (fs.existsSync(target) && rmDir(target)) removed.push(target);
  }

  const tmpCache = path.join(os.tmpdir(), 'fintoke-npm-cache');
  if (fs.existsSync(tmpCache) && rmDir(tmpCache)) {
    removed.push(tmpCache);
  }

  const diskNow = volumeDiskInfo(dataDir);
  if (diskNow && diskNow.freeBytes < 400_000_000) {
    const previewDeps = path.join(dataDir, 'preview-deps');
    if (fs.existsSync(previewDeps) && rmDir(previewDeps)) {
      removed.push(previewDeps);
    }
  }

  return { removed, disk: volumeDiskInfo(dataDir) };
}

export async function reclaimVolumeSpace(keepProjectIds: string[] = []) {
  return reclaimVolumeSpaceSync(keepProjectIds);
}

export function npmInstallEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const cache = path.join(os.tmpdir(), 'fintoke-npm-cache');
  return {
    ...env,
    npm_config_cache: cache,
    NPM_CONFIG_CACHE: cache,
    npm_config_update_notifier: 'false',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
  };
}
