import fs from 'fs';
import os from 'os';
import path from 'path';
import { projectsDir, writableDataDir } from '@/lib/server/paths';

const HEAVY_DIR_NAMES = [
  'node_modules',
  '.next',
  '.turbo',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.pnpm-store',
  'out',
];

const VOLUME_CACHE_DIRS = ['.npm', '.cache', '.turbo', '.pnpm-store', 'preview-deps'];

const LOW_SPACE_BYTES = 1_200_000_000;

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

export function volumeIsLow(dir = writableDataDir()): boolean {
  const disk = volumeDiskInfo(dir);
  return !disk || disk.freeBytes < LOW_SPACE_BYTES;
}

function rmPath(target: string): boolean {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function stripHeavy(root: string, skipNodeModules: boolean, removed: string[]) {
  for (const heavy of HEAVY_DIR_NAMES) {
    if (skipNodeModules && heavy === 'node_modules') continue;
    const target = path.join(root, heavy);
    if (fs.existsSync(target) && rmPath(target)) removed.push(target);
  }
}

function listDirs(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function cleanTmp(removed: string[]) {
  const tmp = os.tmpdir();
  for (const name of listDirs(tmp)) {
    if (!name.name.startsWith('fintoke-')) continue;
    const target = path.join(tmp, name.name);
    if (rmPath(target)) removed.push(target);
  }
}

export function reclaimVolumeSpaceSync(
  keepProjectIds: string[] = [],
  options: { aggressive?: boolean } = {},
): {
  removed: string[];
  disk: ReturnType<typeof volumeDiskInfo>;
} {
  const keep = new Set(keepProjectIds.filter(Boolean));
  const removed: string[] = [];
  const dataDir = writableDataDir();
  const projects = projectsDir();
  const aggressive = Boolean(options.aggressive) || volumeIsLow(dataDir);

  for (const entry of listDirs(projects)) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const projectPath = path.join(projects, entry.name);
    const keepThis = keep.has(entry.name);
    stripHeavy(projectPath, keepThis && !aggressive, removed);
    stripHeavy(path.join(projectPath, 'repo'), keepThis && !aggressive, removed);
  }

  const seedRoot = path.join(process.cwd(), 'seed', 'templates', 'snapshots');
  const volumeSnaps = path.join(dataDir, 'templates', 'snapshots');
  for (const entry of listDirs(volumeSnaps)) {
    if (!entry.isDirectory()) continue;
    const volumePath = path.join(volumeSnaps, entry.name);
    const userMark = path.join(volumePath, '.fintoke-user-snapshot');
    const seedPath = path.join(seedRoot, entry.name, 'package.json');
    if (!fs.existsSync(userMark) && fs.existsSync(seedPath)) {
      if (rmPath(volumePath)) {
        removed.push(volumePath);
        continue;
      }
    }
    stripHeavy(volumePath, false, removed);
  }

  for (const name of VOLUME_CACHE_DIRS) {
    const target = path.join(dataDir, name);
    if (fs.existsSync(target) && rmPath(target)) removed.push(target);
  }

  const runtime = path.join(dataDir, 'preview-runtime');
  for (const entry of listDirs(runtime)) {
    if (!entry.isDirectory()) continue;
    if (keep.has(entry.name) || keep.has(`tpl:${entry.name}`)) {
      stripHeavy(path.join(runtime, entry.name), !aggressive, removed);
      continue;
    }
    const target = path.join(runtime, entry.name);
    if (rmPath(target)) removed.push(target);
  }

  cleanTmp(removed);

  return { removed, disk: volumeDiskInfo(dataDir) };
}

export async function reclaimVolumeSpace(keepProjectIds: string[] = [], aggressive = false) {
  return reclaimVolumeSpaceSync(keepProjectIds, { aggressive });
}

export async function withVolumeSpace<T>(keepProjectIds: string[], work: () => Promise<T>): Promise<T> {
  if (volumeIsLow()) reclaimVolumeSpaceSync(keepProjectIds, { aggressive: true });
  try {
    return await work();
  } catch (error) {
    if (!isNoSpaceError(error)) throw error;
    reclaimVolumeSpaceSync(keepProjectIds, { aggressive: true });
    return work();
  }
}

export function npmInstallEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const cache = path.join(os.tmpdir(), 'fintoke-npm-cache');
  return {
    ...env,
    npm_config_cache: cache,
    NPM_CONFIG_CACHE: cache,
    npm_config_update_notifier: 'false',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
    TMPDIR: os.tmpdir(),
  };
}
