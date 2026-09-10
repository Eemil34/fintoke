import { NextRequest } from 'next/server';
import { getProjectById } from '@/lib/services/project';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import {
  deleteManagedTemplate,
  getManagedTemplate,
  refreshSnapshotTemplate,
  updateManagedTemplate,
} from '@/lib/templates/store';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function badRequest(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('required') ||
      error.message.includes('no files') ||
      error.message.includes('Built-in') ||
      error.message.includes('not found'))
  );
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const template = await getManagedTemplate(id);
    if (!template) {
      return createErrorResponse('Template not found', undefined, 404);
    }
    return createSuccessResponse(template);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to load template');
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body?.projectId) {
      const project = await getProjectById(String(body.projectId));
      if (!project) {
        return createErrorResponse('The site has no files yet. Generate it with the agent first.', undefined, 400);
      }
      const projectPath = await resolveAndPersistProjectWorkspace(project, project.id);
      const template = await refreshSnapshotTemplate(id, projectPath, project.id);
      if (body.name || body.description) {
        const updated = await updateManagedTemplate(id, {
          name: body.name,
          description: body.description,
        });
        return createSuccessResponse(updated);
      }
      return createSuccessResponse(template);
    }

    const template = await updateManagedTemplate(id, body);
    return createSuccessResponse(template);
  } catch (error) {
    if (badRequest(error)) {
      const message = error instanceof Error ? error.message : 'Invalid request';
      return createErrorResponse(message, undefined, message.includes('not found') ? 404 : 400);
    }
    return handleApiError(error, 'API', 'Failed to update template');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = await deleteManagedTemplate(id);
    return createSuccessResponse({ id, ...result });
  } catch (error) {
    if (badRequest(error)) {
      const message = error instanceof Error ? error.message : 'Invalid request';
      return createErrorResponse(
        message,
        undefined,
        message.includes('not found') ? 404 : 400,
      );
    }
    return handleApiError(error, 'API', 'Failed to delete template');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
