import fs from 'fs';
import os from 'os';
import path from 'path';

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

export function isRailwayRuntime(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID,
  );
}

function canUseDir(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function procMountPoints(): string[] {
  try {
    return fs
      .readFileSync('/proc/mounts', 'utf8')
      .split('\n')
      .map((line) => line.split(/\s+/)[1])
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function persistentVolumeDir(): string | null {
  const fromEnv = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (fromEnv) {
    const resolved = path.resolve(fromEnv);
    if (canUseDir(resolved)) return resolved;
  }

  const mounts = procMountPoints();
  for (const candidate of ['/app/data', '/data']) {
    if (mounts.includes(candidate) && canUseDir(candidate)) return candidate;
  }
  return null;
}

export function volumeDataDir(): string | null {
  return persistentVolumeDir();
}

export function volumeHeartbeat(): string | null {
  const dir = persistentVolumeDir();
  if (!dir) return null;
  const file = path.join(dir, '.fintoke-volume');
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing) return existing;
  } catch {
    // create on first real volume boot
  }
  const stamp = new Date().toISOString();
  try {
    fs.writeFileSync(file, `${stamp}\n`);
    return stamp;
  } catch {
    return null;
  }
}

export function writableDataDir(): string {
  const volume = persistentVolumeDir();
  if (volume) return volume;

  if (process.env.SETTINGS_DIR?.trim()) {
    const configured = path.resolve(process.env.SETTINGS_DIR.trim());
    if (canUseDir(configured)) return configured;
  }
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), 'fintoke-data');
  }
  const local = path.resolve(process.cwd(), 'data');
  fs.mkdirSync(local, { recursive: true });
  return local;
}

export function dataFile(...segments: string[]): string {
  return path.join(writableDataDir(), ...segments);
}

export function projectsDir(): string {
  const volume = persistentVolumeDir();
  if (volume) {
    const dir = path.join(volume, 'projects');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const configured = process.env.PROJECTS_DIR?.trim();
  if (configured) {
    const resolved = path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
    if (canUseDir(resolved)) return resolved;
  }
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), 'fintoke-projects');
  }
  const local = path.resolve(process.cwd(), 'data/projects');
  fs.mkdirSync(local, { recursive: true });
  return local;
}
