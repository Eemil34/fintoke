import { NextRequest } from 'next/server';
import { generateWorkRows } from '@/lib/services/leadEnrich';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      query?: string;
      kind?: string;
      country?: string;
      city?: string;
      count?: number;
    };
    const result = await generateWorkRows(body);
    return createSuccessResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate businesses';
    const status =
      message.includes('ChatGPT') ||
      message.includes('API key') ||
      message.includes('Say what') ||
      message.includes('already') ||
      message.includes('did not return')
        ? 400
        : 500;
    return createErrorResponse(message, undefined, status);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
