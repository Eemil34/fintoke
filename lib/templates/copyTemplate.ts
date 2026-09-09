import fs from 'fs/promises';
import path from 'path';
import { getManagedTemplate } from './store';
import { materializeWebsiteTemplate } from './materialize';
import { getWebsiteTemplateId } from './settings';
import { copySnapshotToProject } from './snapshot';
import { scaffoldBasicNextApp } from '@/lib/utils/scaffold';
import { normalizeGeneratedProject } from './isolateNext';

export async function copyWebsiteTemplate(
  projectPath: string,
  templateId: string,
  projectId: string,
): Promise<boolean> {
  const template = await getManagedTemplate(templateId);
  if (!template) return false;

  await fs.mkdir(projectPath, { recursive: true });

  if (template.hasSnapshot) {
    const copied = await copySnapshotToProject(templateId, projectPath, projectId);
    if (copied) return true;
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
