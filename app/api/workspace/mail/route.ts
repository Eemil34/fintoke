import { NextRequest } from 'next/server';
import { getPublicMailSettings, updateMailSettings, verifyMailConnection } from '@/lib/services/mail';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const settings = await getPublicMailSettings();
    return createSuccessResponse(settings);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to load mail settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const smtp = body.smtp && typeof body.smtp === 'object' ? (body.smtp as Record<string, unknown>) : undefined;
    const settings = await updateMailSettings({
      provider: body.provider === 'resend' || body.provider === 'smtp' ? body.provider : undefined,
      fromName: typeof body.fromName === 'string' ? body.fromName : undefined,
      fromEmail: typeof body.fromEmail === 'string' ? body.fromEmail : undefined,
      replyTo: typeof body.replyTo === 'string' ? body.replyTo : undefined,
      resendApiKey: typeof body.resendApiKey === 'string' ? body.resendApiKey : undefined,
      smtp: smtp
        ? {
            host: typeof smtp.host === 'string' ? smtp.host : undefined,
            port: typeof smtp.port === 'number' || typeof smtp.port === 'string' ? Number(smtp.port) : undefined,
            secure: typeof smtp.secure === 'boolean' ? smtp.secure : undefined,
            user: typeof smtp.user === 'string' ? smtp.user : undefined,
            password: typeof smtp.password === 'string' ? smtp.password : undefined,
          }
        : undefined,
    });
    return createSuccessResponse(settings);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to save mail settings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== 'verify') {
      return createErrorResponse('Unknown action', undefined, 400);
    }
    const result = await verifyMailConnection();
    return createSuccessResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mail check failed';
    return createErrorResponse(message, undefined, 400);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
