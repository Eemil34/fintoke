import fs from 'fs/promises';
import path from 'path';
import { normalizeGeneratedProject } from './isolateNext';
import { dataFile, mkdirpSync } from '@/lib/server/paths';

const SNAPSHOTS_DIR = dataFile('templates', 'snapshots');
const SEED_SNAPSHOTS_DIR = path.join(process.cwd(), 'seed', 'templates', 'snapshots');
const STATIC_EXPORT_DIR = '.fintoke-static';

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
  '.fintoke-user-snapshot',
  STATIC_EXPORT_DIR,
]);

const USER_SNAPSHOT_MARK = '.fintoke-user-snapshot';

export function snapshotDir(templateId: string): string {
  return path.join(SNAPSHOTS_DIR, templateId);
}

async function isUserVolumeSnapshot(templateId: string): Promise<boolean> {
  const dir = snapshotDir(templateId);
  try {
    await fs.access(path.join(dir, USER_SNAPSHOT_MARK));
  } catch {
    return false;
  }
  return directoryHasRenderableSite(dir);
}

export async function markUserVolumeSnapshot(templateId: string): Promise<void> {
  const dir = snapshotDir(templateId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, USER_SNAPSHOT_MARK), `${new Date().toISOString()}\n`);
}

export function seedSnapshotDir(templateId: string): string {
  return path.join(SEED_SNAPSHOTS_DIR, templateId);
}

export async function resolveSnapshotDir(templateId: string): Promise<string | null> {
  // Explicit Cursor/user edits on the volume win. Otherwise git seed files win over
  // leftover lookalikes copied onto the Railway volume in an earlier deploy.
  if (await directoryHasRenderableSite(snapshotDir(templateId)) && (await isUserVolumeSnapshot(templateId))) {
    return snapshotDir(templateId);
  }
  if (await directoryHasRenderableSite(seedSnapshotDir(templateId))) return seedSnapshotDir(templateId);
  if (await directoryHasRenderableSite(snapshotDir(templateId))) return snapshotDir(templateId);
  return null;
}

export async function syncSeedSnapshotsToVolume(): Promise<number> {
  let copied = 0;
  let entries;
  try {
    entries = await fs.readdir(SEED_SNAPSHOTS_DIR, { withFileTypes: true });
  } catch {
    return 0;
  }
  await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const from = path.join(SEED_SNAPSHOTS_DIR, entry.name);
    const to = path.join(SNAPSHOTS_DIR, entry.name);
    if (!(await directoryHasApp(from))) continue;
    try {
      await fs.access(path.join(to, 'app', 'page.tsx'));
    } catch {
      await fs.cp(from, to, { recursive: true });
      copied += 1;
    }
    if (await isUserVolumeSnapshot(entry.name)) continue;
    const staticFrom = path.join(from, STATIC_EXPORT_DIR);
    try {
      await fs.access(path.join(staticFrom, 'index.html'));
      const staticTo = path.join(to, STATIC_EXPORT_DIR);
      await fs.rm(staticTo, { recursive: true, force: true });
      await fs.cp(staticFrom, staticTo, { recursive: true });
    } catch {
      // seed has no frozen HTML yet
    }
  }
  return copied;
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

const PAGE_FILES = [
  'app/page.tsx',
  'app/page.jsx',
  'app/page.ts',
  'src/app/page.tsx',
  'src/app/page.jsx',
  'pages/index.tsx',
  'pages/index.jsx',
  'pages/index.js',
];

export async function directoryHasRenderableSite(dir: string): Promise<boolean> {
  if (!(await directoryHasApp(dir))) return false;
  for (const rel of PAGE_FILES) {
    try {
      await fs.access(path.join(dir, rel));
      return true;
    } catch {
      // try next
    }
  }
  return false;
}

export async function listVolumeSnapshotIds(): Promise<string[]> {
  return listSnapshotIdsIn(SNAPSHOTS_DIR);
}

export async function listSeedSnapshotIds(): Promise<string[]> {
  return listSnapshotIdsIn(SEED_SNAPSHOTS_DIR);
}

async function listSnapshotIdsIn(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const ids: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await directoryHasRenderableSite(path.join(root, entry.name))) {
      ids.push(entry.name);
    }
  }
  return ids;
}

export async function resolveSnapshotTemplateId(templateId: string): Promise<string> {
  const requested = templateId.trim();
  if (!requested) return requested;
  if (/^restaurant-?4(?:-2)?$/i.test(requested) || /restaurant\s*(template\s*)?4\b/i.test(requested)) {
    if (await snapshotHasApp('restaurant-4-2')) return 'restaurant-4-2';
  }
  if (/kebab|pizza|pizzeria|doner|shawarma|burger|smash|grill|diner/i.test(requested)) {
    const foodIds = await listVolumeSnapshotIds();
    const foodHit = foodIds.find((id) => /kebab|pizza|pizzeria|doner|shawarma|burger|smash|grill|diner/i.test(id));
    if (foodHit) return foodHit;
  }
  if (await snapshotHasApp(requested)) return requested;
  const ids = [...new Set([...(await listVolumeSnapshotIds()), ...(await listSeedSnapshotIds())])];
  const needle = requested.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (needle.length < 3) return requested;
  const ranked = ids
    .map((id) => ({ id, key: id.toLowerCase().replace(/[^a-z0-9]+/g, '') }))
    .filter((row) => row.key === needle || row.key.startsWith(needle) || (needle.length >= 6 && needle.startsWith(row.key)))
    .sort((a, b) => b.key.length - a.key.length);
  return ranked[0]?.id || requested;
}

export async function snapshotHasApp(templateId: string): Promise<boolean> {
  return Boolean(await resolveSnapshotDir(templateId));
}

export async function copyDirectory(source: string, destination: string): Promise<number> {
  mkdirpSync(destination);
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
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      count += await copyDirectory(from, to);
    } else if (entry.isFile()) {
      mkdirpSync(path.dirname(to));
      await fs.copyFile(from, to);
      await fs.chmod(to, 0o644).catch(() => undefined);
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
  await markUserVolumeSnapshot(templateId);
  const { exportSnapshotStatic } = await import('./exportStatic');
  try {
    await exportSnapshotStatic(destination);
  } catch (error) {
    console.warn('[snapshot] Static export skipped:', error);
  }
  return count;
}

export async function copySnapshotToProject(
  templateId: string,
  projectPath: string,
  projectId: string,
  options?: { normalize?: boolean },
): Promise<boolean> {
  const source = await resolveSnapshotDir(templateId);
  if (!source) return false;
  mkdirpSync(projectPath);
  await copyDirectory(source, projectPath);
  await rewritePackageName(projectPath, projectId);
  await fs.writeFile(path.join(projectPath, '.fintoke-from'), `${templateId}\n`);
  if (options?.normalize !== false) {
    await normalizeGeneratedProject(projectPath);
  }
  return true;
}

export async function deleteProjectSnapshot(templateId: string): Promise<void> {
  await fs.rm(snapshotDir(templateId), { recursive: true, force: true });
}

export async function duplicateProjectSnapshot(fromId: string, toId: string): Promise<boolean> {
  const source = await resolveSnapshotDir(fromId);
  if (!source) return false;
  const destination = snapshotDir(toId);
  await fs.rm(destination, { recursive: true, force: true });
  await copyDirectory(source, destination);
  await rewritePackageName(destination, toId);
  await normalizeGeneratedProject(destination);
  const staticFrom = path.join(source, STATIC_EXPORT_DIR);
  try {
    await fs.access(path.join(staticFrom, 'index.html'));
    const staticTo = path.join(destination, STATIC_EXPORT_DIR);
    await fs.rm(staticTo, { recursive: true, force: true });
    await fs.cp(staticFrom, staticTo, { recursive: true });
  } catch {
    // source has no frozen HTML yet
  }
  return true;
}
