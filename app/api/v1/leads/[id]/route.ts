import { NextRequest } from 'next/server';
import { deleteLead, getLead, updateLead } from '@/lib/services/leads';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { canReadLeads, canWriteLeads } from '@/lib/agent-api/scopes';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const key = await requireAgentKey(request);
    if (!canReadLeads(key.scopes)) throw new AgentApiError('This key cannot read the work table.', 403);
    const { id } = await params;
    const lead = await getLead(id);
    if (!lead) throw new AgentApiError('Row not found', 404);
    return agentJson({ success: true, data: lead });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const key = await requireAgentKey(request);
    if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const lead = await updateLead(id, body);
    return agentJson({ success: true, data: lead });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const key = await requireAgentKey(request);
    if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
    const { id } = await params;
    await deleteLead(id);
    return agentJson({ success: true, data: { id } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
