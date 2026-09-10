import fs from 'fs/promises';
import path from 'path';
import { projectsDir } from '@/lib/server/paths';
import { copyDirectory, directoryHasApp } from '@/lib/templates/snapshot';

export function projectWorkspaceFallback(projectId: string): string {
  return path.join(projectsDir(), projectId);
}

function isInsideProjectsDir(resolved: string): boolean {
  const root = path.resolve(projectsDir());
  return resolved === root || resolved.startsWith(`${root}${path.sep}`);
}

export async function resolveProjectWorkspace(
  project: { repoPath?: string | null },
  projectId: string,
): Promise<string> {
  const fallback = projectWorkspaceFallback(projectId);
  if (await directoryHasApp(fallback)) {
    return fallback;
  }

  const raw = project.repoPath?.trim();
  if (!raw) {
    await fs.mkdir(fallback, { recursive: true });
    return fallback;
  }

  const resolved = path.isAbsolute(raw) ? raw : path.resolve(projectsDir(), raw);
  if (isInsideProjectsDir(resolved)) {
    await fs.mkdir(resolved, { recursive: true });
    return resolved;
  }

  if (await directoryHasApp(resolved)) {
    console.warn(
      `[workspace] Copying ${resolved} onto the data volume at ${fallback} so it survives deploys`,
    );
    await copyDirectory(resolved, fallback);
    return fallback;
  }

  console.warn(
    `[workspace] repoPath is not on this server (${resolved}); using ${fallback}`,
  );
  await fs.mkdir(fallback, { recursive: true });
  return fallback;
}

export async function persistResolvedWorkspace(
  projectId: string,
  resolved: string,
  current?: string | null,
): Promise<void> {
  if (current === resolved) return;
  const { updateProject } = await import('@/lib/services/project');
  await updateProject(projectId, { repoPath: resolved }).catch((error) => {
    console.warn('[workspace] Failed to persist repoPath:', error);
  });
}

export async function resolveAndPersistProjectWorkspace(
  project: { repoPath?: string | null; id?: string },
  projectId: string,
): Promise<string> {
  const resolved = await resolveProjectWorkspace(project, projectId);
  await persistResolvedWorkspace(projectId, resolved, project.repoPath);
  return resolved;
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
