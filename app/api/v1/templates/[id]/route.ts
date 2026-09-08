import { NextRequest } from 'next/server';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { serializeManagedTemplate } from '@/lib/agent-api/workspaceAccess';
import { deleteManagedTemplate, getManagedTemplate, updateManagedTemplate } from '@/lib/templates/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'templates:read');
    const { id } = await params;
    const template = await getManagedTemplate(id);
    if (!template) throw new AgentApiError('Template not found', 404);
    return agentJson({ success: true, data: serializeManagedTemplate(template) });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'templates:write');
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const template = await updateManagedTemplate(id, body);
    return agentJson({ success: true, data: serializeManagedTemplate(template) });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'templates:write');
    const { id } = await params;
    const result = await deleteManagedTemplate(id);
    return agentJson({ success: true, data: { id, ...result } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
