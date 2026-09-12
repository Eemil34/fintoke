import fs from 'fs';
import os from 'os';
import path from 'path';

function envValue(name: string): string {
  return String(process.env[name] ?? '').trim();
}

export function isVercelRuntime(): boolean {
  return envValue('VERCEL') === '1' || Boolean(envValue('VERCEL_ENV'));
}

export function isRailwayRuntime(): boolean {
  return Boolean(
    envValue('RAILWAY_ENVIRONMENT') ||
      envValue('RAILWAY_PROJECT_ID') ||
      envValue('RAILWAY_SERVICE_ID'),
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
  const fromEnv = envValue('RAILWAY_VOLUME_MOUNT_PATH');
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

  const settingsDir = envValue('SETTINGS_DIR');
  if (settingsDir) {
    const configured = path.resolve(settingsDir);
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

export function dataFileCandidates(...segments: string[]): string[] {
  const seen = new Set<string>();
  const files: string[] = [];
  const addDir = (dir: string | null | undefined) => {
    const trimmed = dir?.trim();
    if (!trimmed) return;
    const file = path.join(path.resolve(trimmed), ...segments);
    if (seen.has(file)) return;
    seen.add(file);
    files.push(file);
  };
  addDir(persistentVolumeDir() || undefined);
  addDir(envValue('SETTINGS_DIR'));
  addDir(writableDataDir());
  addDir(path.join(process.cwd(), 'data'));
  addDir(path.join(os.tmpdir(), 'fintoke-data'));
  return files;
}

export function projectsDir(): string {
  const volume = persistentVolumeDir();
  if (volume) {
    const dir = path.join(volume, 'projects');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const configured = envValue('PROJECTS_DIR');
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
