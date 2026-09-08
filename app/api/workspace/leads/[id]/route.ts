import { NextRequest } from 'next/server';
import { deleteLead, getLead, updateLead } from '@/lib/services/leads';
import { analyzeLeadWebsite, enrichLead } from '@/lib/services/leadEnrich';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const lead = await getLead(id);
    if (!lead) return createErrorResponse('Row not found', undefined, 404);
    return createSuccessResponse(lead);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to load row');
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.action === 'enrich') {
      const lead = await enrichLead(id);
      return createSuccessResponse(lead);
    }
    if (body.action === 'analyze') {
      const lead = await analyzeLeadWebsite(id);
      return createSuccessResponse(lead);
    }
    const lead = await updateLead(id, body);
    return createSuccessResponse(lead);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update row';
    const status = message.includes('not found')
      ? 404
      : message.includes('ChatGPT') || message.includes('API key') || message.includes('Add a business')
        ? 400
        : 500;
    return createErrorResponse(message, undefined, status);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteLead(id);
    return createSuccessResponse({ id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete row';
    return createErrorResponse(message, undefined, message.includes('not found') ? 404 : 500);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
