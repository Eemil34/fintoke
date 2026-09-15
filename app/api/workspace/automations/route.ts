import { NextRequest } from 'next/server';
import {
  createAutomation,
  deleteAutomation,
  listAutomations,
  pauseAutomation,
  resumeAutomation,
  runAutomationNow,
  tickAutomations,
} from '@/lib/services/automations';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    await tickAutomations();
    return createSuccessResponse(await listAutomations());
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list automations');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job = await createAutomation(body);
    return createSuccessResponse(job, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Describe')) {
      return createErrorResponse(error.message, undefined, 400);
    }
    return handleApiError(error, 'API', 'Failed to create automation');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
