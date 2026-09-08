import { NextRequest } from 'next/server';
import { enrichEmptyLeads, enrichLeads } from '@/lib/services/leadEnrich';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { canWriteLeads } from '@/lib/agent-api/scopes';

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  try {
    const key = await requireAgentKey(request);
    if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
    const body = (await request.json().catch(() => ({}))) as { ids?: unknown; emptyOnly?: boolean };
    const ids = Array.isArray(body.ids) ? body.ids.map((id) => String(id)) : [];
    const result = body.emptyOnly && ids.length === 0 ? await enrichEmptyLeads() : await enrichLeads(ids);
    return agentJson({ success: true, data: result });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
