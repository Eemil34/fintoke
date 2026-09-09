import fs from 'fs/promises';
import path from 'path';
import { getManagedTemplate } from './store';
import { materializeWebsiteTemplate } from './materialize';
import { getWebsiteTemplateId } from './settings';
import { copySnapshotToProject, snapshotHasApp } from './snapshot';
import { scaffoldBasicNextApp } from '@/lib/utils/scaffold';
import { normalizeGeneratedProject } from './isolateNext';

const TEMPLATE_MARK = '.fintoke-from';

async function readTemplateMark(projectPath: string): Promise<string | null> {
  try {
    const value = (await fs.readFile(path.join(projectPath, TEMPLATE_MARK), 'utf8')).trim();
    return value || null;
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
  if ((await readTemplateMark(projectPath)) === templateId) return false;

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
  const template = await getManagedTemplate(templateId);
  if (!template) return false;

  await fs.mkdir(projectPath, { recursive: true });

  if (template.hasSnapshot || template.kind === 'snapshot') {
    const copied = await copySnapshotToProject(templateId, projectPath, projectId);
    if (copied) return true;
    console.warn(
      `[templates] Snapshot files missing for "${templateId}"; refusing to substitute a generated catalog site.`,
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
