import { NextRequest } from 'next/server';
import { deleteEmailTemplate, updateEmailTemplate } from '@/lib/services/workspace';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const template = await updateEmailTemplate(id, body);
    return createSuccessResponse(template);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return createErrorResponse(error.message, undefined, 404);
      }
      if (error.message.includes('required')) {
        return createErrorResponse(error.message, undefined, 400);
      }
    }
    return handleApiError(error, 'API', 'Failed to update email template');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteEmailTemplate(id);
    return createSuccessResponse({ id });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return createErrorResponse(error.message, undefined, 404);
      }
      if (error.message.includes('cannot be deleted')) {
        return createErrorResponse(error.message, undefined, 400);
      }
    }
    return handleApiError(error, 'API', 'Failed to delete email template');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
