import { NextRequest } from 'next/server';
import { deletePerson, updatePerson } from '@/lib/services/workspace';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const person = await updatePerson(id, body);
    return createSuccessResponse(person);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return createErrorResponse(error.message, undefined, 404);
      }
      if (error.message.includes('required')) {
        return createErrorResponse(error.message, undefined, 400);
      }
    }
    return handleApiError(error, 'API', 'Failed to update person');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deletePerson(id);
    return createSuccessResponse({ id });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse(error.message, undefined, 404);
    }
    return handleApiError(error, 'API', 'Failed to delete person');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
