import { NextRequest } from 'next/server';
import { createEmailTemplate, listEmailTemplates } from '@/lib/services/workspace';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const templates = await listEmailTemplates();
    return createSuccessResponse(templates);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list email templates');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await createEmailTemplate(body);
    return createSuccessResponse(template, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return createErrorResponse(error.message, undefined, 400);
    }
    return handleApiError(error, 'API', 'Failed to create email template');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
