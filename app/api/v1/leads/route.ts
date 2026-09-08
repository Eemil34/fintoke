import { NextRequest } from 'next/server';
import { createLead, deleteAllLeads, deleteLeads, listLeads } from '@/lib/services/leads';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { canReadLeads, canWriteLeads } from '@/lib/agent-api/scopes';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    const key = await requireAgentKey(request);
    if (!canReadLeads(key.scopes)) throw new AgentApiError('This key cannot read the work table.', 403);
    return agentJson({ success: true, data: await listLeads() });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = await requireAgentKey(request);
    if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const lead = await createLead(body);
    return agentJson({ success: true, data: lead }, 201);
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const key = await requireAgentKey(request);
    if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
    const body = (await request.json().catch(() => ({}))) as { all?: boolean; ids?: string[] };
    const removed = body.all
      ? await deleteAllLeads()
      : await deleteLeads(Array.isArray(body.ids) ? body.ids : []);
    return agentJson({ success: true, data: { removed } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
