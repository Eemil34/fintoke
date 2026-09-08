import { NextRequest } from 'next/server';
import { enrichEmptyLeads, enrichLeads } from '@/lib/services/leadEnrich';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { ids?: unknown; emptyOnly?: boolean };
    const ids = Array.isArray(body.ids) ? body.ids.map((id) => String(id)) : [];
    const result = body.emptyOnly && ids.length === 0 ? await enrichEmptyLeads() : await enrichLeads(ids);
    return createSuccessResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fill rows';
    const status = message.includes('Select') || message.includes('empty') || message.includes('ChatGPT') || message.includes('API key') ? 400 : 500;
    return createErrorResponse(message, undefined, status);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
