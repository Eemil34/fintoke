import fs from 'fs';
import os from 'os';
import path from 'path';

const EXECUTABLE_NAMES =
  process.platform === 'win32' ? ['cursor-agent.cmd', 'agent.cmd'] : ['cursor-agent', 'agent'];

export function cursorBinDirs(): string[] {
  const home = os.homedir();
  return [
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
