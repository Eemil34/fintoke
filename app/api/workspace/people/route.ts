import { NextRequest } from 'next/server';
import { createPerson, listPeople, type PersonKind } from '@/lib/services/workspace';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const kindParam = request.nextUrl.searchParams.get('kind');
    const kind = kindParam === 'user' || kindParam === 'client' ? (kindParam as PersonKind) : undefined;
    const people = await listPeople(kind);
    return createSuccessResponse(people);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list people');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const person = await createPerson(body);
    return createSuccessResponse(person, 201);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('must be'))) {
      return createErrorResponse(error.message, undefined, 400);
    }
    return handleApiError(error, 'API', 'Failed to create person');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
