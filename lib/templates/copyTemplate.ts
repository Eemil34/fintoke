import fs from 'fs/promises';
import path from 'path';
import { getManagedTemplate } from './store';
import { materializeWebsiteTemplate } from './materialize';
import { getWebsiteTemplateId } from './settings';
import { copySnapshotToProject, resolveSnapshotDir, snapshotHasApp } from './snapshot';
import { scaffoldBasicNextApp } from '@/lib/utils/scaffold';
import { normalizeGeneratedProject } from './isolateNext';
import { mkdirpSync } from '@/lib/server/paths';

const TEMPLATE_MARK = '.fintoke-from';

const SNAPSHOT_FALLBACKS: Record<string, string[]> = {
  'food-hospitality': ['restaurant-3', 'restaurant-2', 'restaurant-starter', 'restaurant-1'],
  'health-wellness': ['medical-1', 'medicine-2', 'medicine-3'],
  'saas-tech': ['saas-2', 'saas-1', 'saas-3-world'],
};

async function readTemplateMark(projectPath: string): Promise<string | null> {
  try {
    const value = (await fs.readFile(path.join(projectPath, TEMPLATE_MARK), 'utf8')).trim();
    return value || null;
  } catch {
    return null;
  }
}

async function readPageSource(dir: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(dir, 'app', 'page.tsx'), 'utf8');
  } catch {
    return null;
  }
}

export async function restoreSnapshotIfMaterialized(
  projectPath: string,
  projectId: string,
  settingsJson?: string | null,
): Promise<boolean> {
  const templateId = getWebsiteTemplateId(settingsJson);
  if (!templateId) return false;
  if (!(await snapshotHasApp(templateId))) return false;

  const alreadyCopied = await readTemplateMark(projectPath);
  // Never replace a copied, filled, or generated site.
  if (alreadyCopied) return false;
  try {
    await fs.access(path.join(projectPath, '.fintoke-filled'));
    return false;
  } catch {
    // not filled
  }
  if (await projectHasApp(projectPath)) return false;

  const materialized = await fs
    .access(path.join(projectPath, 'lib', 'site.ts'))
    .then(() => true)
    .catch(() => false);
  if (!materialized) return false;

  const entries = await fs.readdir(projectPath).catch(() => [] as string[]);
  for (const name of entries) {
    if (name === 'node_modules') continue;
    await fs.rm(path.join(projectPath, name), { recursive: true, force: true });
  }
  const copied = await copySnapshotToProject(templateId, projectPath, projectId);
  if (copied) {
    console.log(`[templates] Restored saved snapshot "${templateId}" for ${projectId}`);
  }
  return copied;
}

export async function copyWebsiteTemplate(
  projectPath: string,
  templateId: string,
  projectId: string,
): Promise<boolean> {
  mkdirpSync(projectPath);

  const fromSnapshot = await copySnapshotToProject(templateId, projectPath, projectId, {
    normalize: false,
  });
  if (fromSnapshot) return true;

  const template = await getManagedTemplate(templateId);
  if (!template) return false;

  for (const fallbackId of SNAPSHOT_FALLBACKS[template.category] || []) {
    if (fallbackId === templateId) continue;
    const copied = await copySnapshotToProject(fallbackId, projectPath, projectId, {
      normalize: false,
    });
    if (copied) {
      console.warn(
        `[templates] "${templateId}" did not have a complete site; started from "${fallbackId}".`,
      );
      return true;
    }
  }

  if (template.kind === 'snapshot') {
    console.warn(
      `[templates] Snapshot files missing for "${templateId}"; will not generate a lookalike catalog page.`,
    );
    return false;
  }

  await materializeWebsiteTemplate(projectPath, template, projectId);
  return true;
}

export async function projectHasApp(projectPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectPath, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

export async function ensureProjectApp(
  projectPath: string,
  projectId: string,
  settingsJson?: string | null,
): Promise<void> {
  if (await restoreSnapshotIfMaterialized(projectPath, projectId, settingsJson)) {
    await normalizeGeneratedProject(projectPath);
    return;
  }

  if (await projectHasApp(projectPath)) {
    await normalizeGeneratedProject(projectPath);
    return;
  }

  const templateId = getWebsiteTemplateId(settingsJson);
  if (templateId) {
    const copied = await copyWebsiteTemplate(projectPath, templateId, projectId);
    if (copied) {
      await normalizeGeneratedProject(projectPath);
      return;
    }
  }

  await scaffoldBasicNextApp(projectPath, projectId);
  await normalizeGeneratedProject(projectPath);
}
