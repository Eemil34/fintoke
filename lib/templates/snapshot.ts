import fs from 'fs/promises';
import path from 'path';
import { normalizeGeneratedProject } from './isolateNext';
import { dataFile } from '@/lib/server/paths';

const SNAPSHOTS_DIR = dataFile('templates', 'snapshots');

const IGNORE_NAMES = new Set([
  'node_modules',
  '.next',
  '.git',
  '.turbo',
  '.vercel',
  '.cursor',
  '.claude',
  '.codex',
  '.yoyo',
  '.idea',
  '.vscode',
  'dist',
  'build',
  'coverage',
  '.DS_Store',
  'tsconfig.tsbuildinfo',
]);

export function snapshotDir(templateId: string): string {
  return path.join(SNAPSHOTS_DIR, templateId);
}

function shouldIgnore(name: string): boolean {
  if (IGNORE_NAMES.has(name)) return true;
  if (name.startsWith('.env')) return true;
  if (name.endsWith('.log') || name.endsWith('.tmp')) return true;
  return false;
}

export async function directoryHasApp(dir: string): Promise<boolean> {
  try {
    await fs.access(path.join(dir, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

export async function snapshotHasApp(templateId: string): Promise<boolean> {
  return directoryHasApp(snapshotDir(templateId));
}

export async function copyDirectory(source: string, destination: string): Promise<number> {
  await fs.mkdir(destination, { recursive: true });
  let count = 0;
  let entries;
  try {
    entries = await fs.readdir(source, { withFileTypes: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error('The site has no files yet. Generate it with the agent first.');
    }
    throw error;
  }

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      count += await copyDirectory(from, to);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
      count += 1;
    }
  }

  return count;
}

export async function rewritePackageName(projectPath: string, projectId: string): Promise<void> {
  const pkgPath = path.join(projectPath, 'package.json');
  try {
    const raw = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(raw) as Record<string, unknown>;
    pkg.name = projectId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'site';
    await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  } catch {
    // Snapshot may not include package.json yet.
  }
}

export async function writeProjectSnapshot(templateId: string, projectPath: string): Promise<number> {
  const destination = snapshotDir(templateId);
  await fs.rm(destination, { recursive: true, force: true });
  const count = await copyDirectory(projectPath, destination);
  if (count === 0) {
    await fs.rm(destination, { recursive: true, force: true });
    throw new Error('The site has no files yet. Generate it with the agent first.');
  }
  await rewritePackageName(destination, templateId);
  await normalizeGeneratedProject(destination);
  return count;
}

export async function copySnapshotToProject(
  templateId: string,
  projectPath: string,
  projectId: string,
): Promise<boolean> {
  if (!(await snapshotHasApp(templateId))) return false;
  await fs.mkdir(projectPath, { recursive: true });
  await copyDirectory(snapshotDir(templateId), projectPath);
  await rewritePackageName(projectPath, projectId);
  await normalizeGeneratedProject(projectPath);
  return true;
}

export async function deleteProjectSnapshot(templateId: string): Promise<void> {
  await fs.rm(snapshotDir(templateId), { recursive: true, force: true });
}

export async function duplicateProjectSnapshot(fromId: string, toId: string): Promise<boolean> {
  if (!(await snapshotHasApp(fromId))) return false;
  const destination = snapshotDir(toId);
  await fs.rm(destination, { recursive: true, force: true });
  await copyDirectory(snapshotDir(fromId), destination);
  await rewritePackageName(destination, toId);
  await normalizeGeneratedProject(destination);
  return true;
}
