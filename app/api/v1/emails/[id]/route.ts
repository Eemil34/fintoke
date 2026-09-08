import { NextRequest } from 'next/server';
import { deleteEmail, getEmail } from '@/lib/services/workspace';
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
    const email = await getEmail(id);
    if (!email) throw new AgentApiError('Email not found', 404);
    return agentJson({ success: true, data: email });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'emails:send');
    const { id } = await params;
    await deleteEmail(id);
    return agentJson({ success: true, data: { id } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
