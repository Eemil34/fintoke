import fs from 'fs';
import os from 'os';
import path from 'path';

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
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

export function volumeDataDir(): string | null {
  if (canUseDir('/app/data')) return '/app/data';
  return null;
}

export function writableDataDir(): string {
  const volume = volumeDataDir();
  if (volume) {
    const configured = process.env.SETTINGS_DIR?.trim();
    if (configured) {
      const resolved = path.resolve(configured);
      if (
        (resolved === volume || resolved.startsWith(`${volume}${path.sep}`)) &&
        canUseDir(resolved)
      ) {
        return resolved;
      }
    }
    return volume;
  }
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
  const volume = volumeDataDir();
  if (volume) {
    const configured = process.env.PROJECTS_DIR?.trim();
    if (configured) {
      const resolved = path.isAbsolute(configured)
        ? configured
        : path.resolve(process.cwd(), configured);
      if (resolved === path.join(volume, 'projects') || resolved.startsWith(`${volume}${path.sep}`)) {
        if (canUseDir(resolved)) return resolved;
      }
    }
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
