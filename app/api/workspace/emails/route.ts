import { NextRequest } from 'next/server';
import { createEmail, listEmails } from '@/lib/services/workspace';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const emails = await listEmails();
    return createSuccessResponse(emails);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list emails');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = await createEmail(body);
    return createSuccessResponse(email, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return createErrorResponse(error.message, undefined, 400);
    }
    return handleApiError(error, 'API', 'Failed to create email');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
