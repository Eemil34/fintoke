import { NextRequest } from 'next/server';
import {
  deleteAutomation,
  pauseAutomation,
  resumeAutomation,
  runAutomationNow,
} from '@/lib/services/automations';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action === 'pause') return createSuccessResponse(await pauseAutomation(id));
    if (body.action === 'resume') return createSuccessResponse(await resumeAutomation(id));
    if (body.action === 'run') return createSuccessResponse(await runAutomationNow(id));
    return createErrorResponse('Unknown action', undefined, 400);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to update automation');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteAutomation(id);
    return createSuccessResponse({ id });
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to delete automation');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
