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
    ensureWritableDirSync(dir);
    return true;
  } catch {
    return false;
  }
}

function mkdirOne(dir: string): void {
  try {
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink()) {
      try {
        fs.realpathSync(dir);
        return;
      } catch {
        fs.unlinkSync(dir);
      }
    } else if (stat.isDirectory()) {
      return;
    } else {
      throw Object.assign(new Error(`${dir} exists and is not a directory`), { code: 'ENOTDIR' });
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && code !== 'ENOENT') throw error;
  }
  try {
    fs.mkdirSync(dir, { mode: 0o755 });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EEXIST' || code === 'EISDIR') return;
    if (code === 'ENOENT') {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      return;
    }
    throw error;
  }
}

export function mkdirpSync(dir: string): string {
  const resolved = path.resolve(dir);
  const parts = resolved.split(path.sep).filter(Boolean);
  let acc = path.isAbsolute(resolved) ? path.sep : '';
  for (const part of parts) {
    acc = path.join(acc, part);
    mkdirOne(acc);
  }
  return resolved;
}

export function ensureWritableDirSync(dir: string): string {
  const resolved = mkdirpSync(dir);
  let real = resolved;
  try {
    real = fs.realpathSync(resolved);
  } catch {
    fs.mkdirSync(resolved, { recursive: true, mode: 0o755 });
    real = fs.realpathSync(resolved);
  }
  fs.accessSync(real, fs.constants.W_OK);
  const probe = path.join(real, `.fintoke-write-${process.pid}`);
  fs.writeFileSync(probe, 'ok');
  fs.unlinkSync(probe);
  return real;
}

export async function ensureWritableDir(dir: string): Promise<string> {
  let last: unknown;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return ensureWritableDirSync(dir);
    } catch (error) {
      last = error;
      await new Promise((resolve) => setTimeout(resolve, 30 * (attempt + 1)));
    }
  }
  throw last;
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
    return ensureWritableDirSync(path.join(volume, 'projects'));
  }
  const configured = envValue('PROJECTS_DIR');
  if (configured) {
    const resolved = path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
    if (canUseDir(resolved)) return ensureWritableDirSync(resolved);
  }
  if (isVercelRuntime()) {
    return ensureWritableDirSync(path.join(os.tmpdir(), 'fintoke-projects'));
  }
  return ensureWritableDirSync(path.resolve(process.cwd(), 'data/projects'));
}
