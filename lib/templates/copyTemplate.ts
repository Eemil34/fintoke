import fs from 'fs/promises';
import path from 'path';
import { getManagedTemplate } from './store';
import { materializeWebsiteTemplate } from './materialize';
import { getWebsiteTemplateId } from './settings';
import { copySnapshotToProject, resolveSnapshotDir, snapshotHasApp } from './snapshot';
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

  const materialized = await fs
    .access(path.join(projectPath, 'lib', 'site.ts'))
    .then(() => true)
    .catch(() => false);
  const snapshotDir = await resolveSnapshotDir(templateId);
  const snapshotPage = snapshotDir ? await readPageSource(snapshotDir) : null;
  const projectPage = await readPageSource(projectPath);
  const seedComponent = snapshotPage?.match(/from ['"]\.\.\/components\/(\w+)['"]/)?.[1];
  const hasSeedComponent = !seedComponent || Boolean(projectPage?.includes(seedComponent));
  const alreadyRestored =
    (await readTemplateMark(projectPath)) === templateId && !materialized && hasSeedComponent;
  if (alreadyRestored) return false;

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
  await fs.mkdir(projectPath, { recursive: true });

  const fromSnapshot = await copySnapshotToProject(templateId, projectPath, projectId);
  if (fromSnapshot) return true;

  const template = await getManagedTemplate(templateId);
  if (!template) return false;

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
