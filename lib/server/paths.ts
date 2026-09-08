import os from 'os';
import path from 'path';

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

export function writableDataDir(): string {
  if (process.env.SETTINGS_DIR?.trim()) {
    return path.resolve(process.env.SETTINGS_DIR.trim());
  }
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), 'fintoke-data');
  }
  return path.resolve(process.cwd(), 'data');
}

export function dataFile(...segments: string[]): string {
  return path.join(writableDataDir(), ...segments);
}

export function projectsDir(): string {
  const configured = process.env.PROJECTS_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
  }
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), 'fintoke-projects');
  }
  return path.resolve(process.cwd(), 'data/projects');
}
