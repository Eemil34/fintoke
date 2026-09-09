import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { writableDataDir } from '@/lib/server/paths';

const EXECUTABLE_NAMES =
  process.platform === 'win32' ? ['cursor-agent.cmd', 'agent.cmd'] : ['agent', 'cursor-agent'];

let installPromise: Promise<string | null> | null = null;

export function cursorBinDirs(): string[] {
  const home = os.homedir();
  const dataHome = writableDataDir();
  return [
    path.join(dataHome, '.local', 'bin'),
    path.join(dataHome, '.cursor', 'bin'),
    path.join(dataHome, '.cursor-agent', 'bin'),
    path.join(home, '.local', 'bin'),
    path.join(home, '.cursor', 'bin'),
    path.join(home, '.cursor-agent', 'bin'),
  ];
}

export function withCursorPath(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const extra = cursorBinDirs().join(path.delimiter);
  return { ...env, PATH: `${extra}${path.delimiter}${env.PATH || ''}` };
}

export function ensureCursorPathOnProcess(): void {
  process.env.PATH = withCursorPath(process.env).PATH || process.env.PATH;
}

export function resolveCursorApiKey(settingsKey?: unknown): string | undefined {
  const fromEnv = process.env.CURSOR_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (typeof settingsKey === 'string' && settingsKey.trim()) return settingsKey.trim();
  return undefined;
}

export function hasCursorApiKey(settingsKey?: unknown): boolean {
  return Boolean(resolveCursorApiKey(settingsKey));
}

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }
}

export function resolveCursorExecutable(): string | null {
  ensureCursorPathOnProcess();
  const searchDirs = [
    ...cursorBinDirs(),
    ...(process.env.PATH || '').split(path.delimiter).filter(Boolean),
  ];
  const seen = new Set<string>();
  for (const dir of searchDirs) {
    if (seen.has(dir)) continue;
    seen.add(dir);
    for (const name of EXECUTABLE_NAMES) {
      const full = path.join(dir, name);
      if (isExecutable(full)) return full;
    }
  }
  return null;
}

export async function ensureCursorExecutable(): Promise<string | null> {
  const existing = resolveCursorExecutable();
  if (existing) return existing;
  if (!installPromise) {
    installPromise = new Promise((resolve) => {
      const script = path.join(process.cwd(), 'scripts', 'install-cursor-cli.js');
      const child = spawn(process.execPath, [script], {
        env: {
          ...process.env,
          SETTINGS_DIR: process.env.SETTINGS_DIR || writableDataDir(),
        },
        stdio: 'inherit',
      });
      const finish = () => resolve(resolveCursorExecutable());
      const timer = setTimeout(() => {
        child.kill();
        finish();
      }, 120000);
      child.on('error', () => {
        clearTimeout(timer);
        finish();
      });
      child.on('exit', () => {
        clearTimeout(timer);
        finish();
      });
    });
  }
  return installPromise;
}
