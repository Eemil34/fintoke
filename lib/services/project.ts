/**
 * Project Service - Project management logic
 */

import { prisma } from '@/lib/db/client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/backend';
import fs from 'fs/promises';
import path from 'path';
import { normalizeModelId, getDefaultModelForCli } from '@/lib/constants/cliModels';
import { copyWebsiteTemplate } from '@/lib/templates/copyTemplate';
import { serializeProjectSettings } from '@/lib/templates/settings';
import { ensureWritableDir, projectsDir } from '@/lib/server/paths';
import { isNoSpaceError, reclaimVolumeSpace, volumeDiskInfo } from '@/lib/server/volumeCleanup';

/**
 * Retrieve all projects
 */
export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    orderBy: {
      lastActiveAt: 'desc',
    },
  });
  return projects.map(project => ({
    ...project,
    selectedModel: normalizeModelId(project.preferredCli ?? 'claude', project.selectedModel ?? undefined),
  })) as Project[];
}

/**
 * Retrieve project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project) return null;
  return {
    ...project,
    selectedModel: normalizeModelId(project.preferredCli ?? 'claude', project.selectedModel ?? undefined),
  } as Project;
}

/**
 * Create new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const disk = volumeDiskInfo();
  if (!disk || disk.freeBytes < 1_200_000_000) {
    await reclaimVolumeSpace([input.project_id]);
  }
  let root: string;
  let projectPath: string;
  try {
    root = await ensureWritableDir(projectsDir());
    projectPath = await ensureWritableDir(path.join(root, input.project_id));
  } catch (error) {
    if (!isNoSpaceError(error)) throw error;
    await reclaimVolumeSpace([input.project_id]);
    root = await ensureWritableDir(projectsDir());
    projectPath = await ensureWritableDir(path.join(root, input.project_id));
  }

  const project = await prisma.project.create({
    data: {
      id: input.project_id,
      name: input.name,
      description: input.description,
      initialPrompt: input.initialPrompt,
      repoPath: projectPath,
      preferredCli: input.preferredCli || 'claude',
      selectedModel: normalizeModelId(input.preferredCli || 'claude', input.selectedModel ?? getDefaultModelForCli(input.preferredCli || 'claude')),
      status: 'idle',
      templateType: 'nextjs',
      settings: serializeProjectSettings(undefined, {
        websiteTemplateId: input.websiteTemplateId,
        cloneUrl: input.cloneUrl,
        editingTemplateId: input.editingTemplateId,
      }),
      lastActiveAt: new Date(),
      previewUrl: null,
      previewPort: null,
    },
  });

  if (input.websiteTemplateId && input.websiteTemplateId !== 'blank') {
    try {
      const copied = await copyWebsiteTemplate(
        projectPath,
        input.websiteTemplateId,
        input.project_id,
      );
      if (!copied) {
        console.warn(
          `[ProjectService] Unknown website template "${input.websiteTemplateId}" for ${input.project_id}`,
        );
      } else {
        console.log(
          `[ProjectService] Copied website template "${input.websiteTemplateId}" into ${projectPath}`,
        );
      }
    } catch (error) {
      if (isNoSpaceError(error)) {
        await reclaimVolumeSpace([input.project_id]);
        await copyWebsiteTemplate(projectPath, input.websiteTemplateId, input.project_id);
      } else {
        console.error(
          `[ProjectService] Template copy failed for ${input.project_id}; project was still created:`,
          error,
        );
      }
    }
  }

  console.log(`[ProjectService] Created project: ${project.id}`);
  return {
    ...project,
    selectedModel: normalizeModelId(project.preferredCli ?? 'claude', project.selectedModel ?? undefined),
  } as Project;
}

/**
 * Update project
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const existing = await prisma.project.findUnique({
    where: { id },
    select: { preferredCli: true },
  });
  const targetCli = input.preferredCli ?? existing?.preferredCli ?? 'claude';
  const normalizedModel = input.selectedModel
    ? normalizeModelId(targetCli, input.selectedModel)
    : undefined;

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...input,
      ...(input.selectedModel
        ? { selectedModel: normalizedModel }
        : {}),
      updatedAt: new Date(),
    },
  });

  console.log(`[ProjectService] Updated project: ${id}`);
  return {
    ...project,
    selectedModel: normalizeModelId(project.preferredCli ?? 'claude', project.selectedModel ?? undefined),
  } as Project;
}

/**
 * Delete project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const { previewManager } = await import('@/lib/services/preview');
    await previewManager.stop(id);
  } catch (error) {
    console.warn(`[ProjectService] Could not stop preview before delete:`, error);
  }

  const project = await getProjectById(id);
  const dirs = new Set<string>();
  if (project?.repoPath) dirs.add(project.repoPath);
  dirs.add(path.join(projectsDir(), id));
  for (const dir of dirs) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`[ProjectService] Failed to delete project directory ${dir}:`, error);
    }
  }

  await prisma.project.deleteMany({
    where: { id },
  });

  console.log(`[ProjectService] Deleted project: ${id}`);
}

/**
 * Update project activity time
 */
export async function updateProjectActivity(id: string): Promise<void> {
  await prisma.project.update({
    where: { id },
    data: {
      lastActiveAt: new Date(),
    },
  });
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  id: string,
  status: 'idle' | 'running' | 'stopped' | 'error'
): Promise<void> {
  await prisma.project.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
  console.log(`[ProjectService] Updated project status: ${id} -> ${status}`);
}

export interface ProjectCliPreference {
  preferredCli: string;
  fallbackEnabled: boolean;
  selectedModel: string | null;
}

export async function getProjectCliPreference(projectId: string): Promise<ProjectCliPreference | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      preferredCli: true,
      fallbackEnabled: true,
      selectedModel: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    preferredCli: project.preferredCli ?? 'claude',
    fallbackEnabled: project.fallbackEnabled ?? false,
    selectedModel: normalizeModelId(project.preferredCli ?? 'claude', project.selectedModel ?? undefined),
  };
}

export async function updateProjectCliPreference(
  projectId: string,
  input: Partial<ProjectCliPreference>
): Promise<ProjectCliPreference> {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: { preferredCli: true },
  });
  const targetCli = input.preferredCli ?? existing?.preferredCli ?? 'claude';

  const result = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.preferredCli ? { preferredCli: input.preferredCli } : {}),
      ...(typeof input.fallbackEnabled === 'boolean'
        ? { fallbackEnabled: input.fallbackEnabled }
        : {}),
      ...(input.selectedModel
        ? { selectedModel: normalizeModelId(targetCli, input.selectedModel) }
        : input.selectedModel === null
        ? { selectedModel: null }
        : {}),
      updatedAt: new Date(),
    },
    select: {
      preferredCli: true,
      fallbackEnabled: true,
      selectedModel: true,
    },
  });

  return {
    preferredCli: result.preferredCli ?? 'claude',
    fallbackEnabled: result.fallbackEnabled ?? false,
    selectedModel: normalizeModelId(result.preferredCli ?? 'claude', result.selectedModel ?? undefined),
  };
}
