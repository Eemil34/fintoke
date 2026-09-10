import { NextRequest } from 'next/server';
import { getProjectById } from '@/lib/services/project';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import {
  createManagedTemplate,
  createSnapshotTemplate,
  duplicateManagedTemplate,
  listManagedTemplates,
} from '@/lib/templates/store';
import { parseProjectSettings } from '@/lib/templates/settings';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

function badRequest(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('required') ||
      error.message.includes('no files') ||
      error.message.includes('not found') ||
      error.message.includes('Invalid'))
  );
}

export async function GET() {
  try {
    const templates = await listManagedTemplates();
    return createSuccessResponse(templates);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list templates');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.duplicateFrom) {
      const template = await duplicateManagedTemplate(String(body.duplicateFrom));
      return createSuccessResponse(template, 201);
    }

    if (body?.projectId) {
      const project = await getProjectById(String(body.projectId));
      if (!project) {
        return createErrorResponse('Site not found', undefined, 404);
      }
      const projectPath = await resolveAndPersistProjectWorkspace(project, project.id);

      const settings = parseProjectSettings(project.settings);
      const template = await createSnapshotTemplate({
        projectPath,
        projectId: project.id,
        name: typeof body.name === 'string' && body.name.trim() ? body.name : project.name,
        description:
          typeof body.description === 'string'
            ? body.description
            : project.description || project.initialPrompt || '',
        sourceUrl: settings.cloneUrl || null,
      });
      return createSuccessResponse(template, 201);
    }

    const template = await createManagedTemplate(body);
    return createSuccessResponse(template, 201);
  } catch (error) {
    if (badRequest(error)) {
      return createErrorResponse(error instanceof Error ? error.message : 'Invalid request', undefined, 400);
    }
    return handleApiError(error, 'API', 'Failed to create template');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
