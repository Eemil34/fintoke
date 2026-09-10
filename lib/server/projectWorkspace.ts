import fs from 'fs/promises';
import path from 'path';
import { projectsDir } from '@/lib/server/paths';

export function projectWorkspaceFallback(projectId: string): string {
  return path.join(projectsDir(), projectId);
}

export async function resolveProjectWorkspace(
  project: { repoPath?: string | null },
  projectId: string,
): Promise<string> {
  const fallback = projectWorkspaceFallback(projectId);
  const raw = project.repoPath?.trim();
  if (!raw) return fallback;

  const resolved = path.isAbsolute(raw) ? raw : path.resolve(projectsDir(), raw);
  const root = path.resolve(projectsDir());
  if (resolved === root || resolved.startsWith(`${root}${path.sep}`)) {
    return resolved;
  }

  try {
    await fs.access(path.join(resolved, 'package.json'));
    return resolved;
  } catch {
    console.warn(
      `[workspace] repoPath is not on this server (${resolved}); using ${fallback}`,
    );
    return fallback;
  }
}

export async function makeTreeWritable(root: string): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(root, entry.name);
    try {
      if (entry.isDirectory()) {
        await fs.chmod(full, 0o755);
        await makeTreeWritable(full);
      } else if (entry.isFile()) {
        await fs.chmod(full, 0o644);
      }
    } catch {
      // keep going; some files may not support chmod
    }
  }
}
