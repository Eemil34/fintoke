import { NextRequest } from 'next/server';
import { getWorkAiSettings, saveOpenaiApiKey } from '@/lib/services/leads';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    return createSuccessResponse(await getWorkAiSettings());
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to load ChatGPT settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { openaiApiKey?: string };
    if (!body.openaiApiKey?.trim()) {
      return createSuccessResponse(await getWorkAiSettings());
    }
    const next = await saveOpenaiApiKey(body.openaiApiKey);
    return createSuccessResponse(next);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to save ChatGPT key');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
