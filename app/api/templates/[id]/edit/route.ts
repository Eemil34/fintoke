import { NextRequest } from 'next/server';
import { openTemplateForCursor } from '@/lib/templates/editWithAgent';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = await openTemplateForCursor(id);
    return createSuccessResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse(error.message, undefined, 404);
    }
    return handleApiError(error, 'API', 'Failed to open template in Cursor');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
