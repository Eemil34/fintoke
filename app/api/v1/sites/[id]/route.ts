import { NextRequest } from 'next/server';
import {
  agentErrorResponse,
  agentJson,
  agentOptions,
  agentOrigin,
  requireAgentKey,
} from '@/lib/agent-api/http';
import { getSerializedAgentSite } from '@/lib/agent-api/serialize';
import { AgentApiError } from '@/lib/agent-api/keys';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'sites:read');
    const { id } = await params;
    const site = await getSerializedAgentSite(id, agentOrigin(request));
    if (!site) {
      throw new AgentApiError('Site not found', 404);
    }
    return agentJson({ success: true, data: site });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
