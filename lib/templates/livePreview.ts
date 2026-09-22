import fs from 'fs/promises';
import path from 'path';

export const LIVE_PREVIEW_FILE = '.fintoke-live';

/** After Cursor/Claude edit a project, preview must use that workspace, not the frozen template. */
export async function markProjectLivePreview(projectPath: string): Promise<void> {
  const dir = projectPath.trim();
  if (!dir) return;
  await fs.writeFile(path.join(dir, LIVE_PREVIEW_FILE), `${Date.now()}\n`).catch(() => undefined);
  const repo = path.join(dir, 'repo');
  try {
    const stat = await fs.stat(repo);
    if (stat.isDirectory()) {
      await fs.writeFile(path.join(repo, LIVE_PREVIEW_FILE), `${Date.now()}\n`).catch(() => undefined);
    }
  } catch {
    // no nested repo
  }
}

export async function projectWantsLivePreview(projectPath: string): Promise<boolean> {
  const dir = projectPath.trim();
  if (!dir) return false;
  for (const candidate of [dir, path.join(dir, 'repo')]) {
    try {
      await fs.access(path.join(candidate, LIVE_PREVIEW_FILE));
      return true;
    } catch {
      // keep looking
    }
  }
  return false;
}
