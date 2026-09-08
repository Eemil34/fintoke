import { NextRequest } from 'next/server';
import { composeAndSendEmail, sendExistingEmail } from '@/lib/services/emailCompose';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body.id === 'string' && body.id.trim()) {
      const email = await sendExistingEmail(body.id.trim());
      return createSuccessResponse({ email, delivered: true });
    }

    const result = await composeAndSendEmail({
      to: typeof body.to === 'string' ? body.to : undefined,
      personId: typeof body.personId === 'string' ? body.personId : undefined,
      templateId: typeof body.templateId === 'string' ? body.templateId : undefined,
      templateName: typeof body.templateName === 'string' ? body.templateName : undefined,
      subject: typeof body.subject === 'string' ? body.subject : undefined,
      body: typeof body.body === 'string' ? body.body : undefined,
      message: typeof body.message === 'string' ? body.message : undefined,
      variables: body.variables && typeof body.variables === 'object' ? (body.variables as Record<string, string>) : undefined,
      send: body.send !== false,
    });
    return createSuccessResponse(result, result.email.status === 'sent' ? 200 : 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status =
      message.includes('not configured') ||
      message.includes('required') ||
      message.includes('not found') ||
      message.includes('not a valid') ||
      message.includes('Too many')
        ? 400
        : 500;
    return createErrorResponse(message, undefined, status);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
