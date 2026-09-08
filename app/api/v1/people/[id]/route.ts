import { NextRequest } from 'next/server';
import { deletePerson, getPerson, updatePerson } from '@/lib/services/workspace';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'emails:read');
    const { id } = await params;
    const person = await getPerson(id);
    if (!person) throw new AgentApiError('Person not found', 404);
    return agentJson({ success: true, data: person });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'people:write');
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const person = await updatePerson(id, body);
    return agentJson({ success: true, data: person });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'people:write');
    const { id } = await params;
    await deletePerson(id);
    return agentJson({ success: true, data: { id } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
