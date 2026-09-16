import { randomBytes } from 'crypto';
import { getDefaultModelForCli } from '@/lib/constants/cliModels';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import { createProject, getAllProjects, updateProject } from '@/lib/services/project';
import { directoryHasApp } from './snapshot';
import { getEditingTemplateId } from './settings';
import { getManagedTemplate } from './store';

export async function openTemplateForCursor(templateId: string): Promise<{
  projectId: string;
  created: boolean;
}> {
  const template = await getManagedTemplate(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const existing = (await getAllProjects()).find(
    (project) => getEditingTemplateId(project.settings) === templateId,
  );

  if (existing) {
    const projectPath = await resolveAndPersistProjectWorkspace(existing, existing.id);
    if (await directoryHasApp(projectPath)) {
      if (existing.preferredCli !== 'cursor') {
        await updateProject(existing.id, {
          preferredCli: 'cursor',
          selectedModel: getDefaultModelForCli('cursor'),
        });
      }
      return { projectId: existing.id, created: false };
    }
  }

  const projectId = `project-${Date.now()}-${randomBytes(4).toString('hex')}`;
  const project = await createProject({
    project_id: projectId,
    name: `Edit: ${template.name}`,
    description: `Cursor workspace for template “${template.name}”.`,
    initialPrompt: '',
    preferredCli: 'cursor',
    selectedModel: getDefaultModelForCli('cursor'),
    websiteTemplateId: template.id,
    editingTemplateId: template.id,
  });

  return { projectId: project.id, created: true };
}
