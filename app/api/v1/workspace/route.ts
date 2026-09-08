import { NextRequest } from 'next/server';
import { getAgentWorkspaceSnapshot } from '@/lib/agent-api/workspaceAccess';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'workspace:read');
    return agentJson({ success: true, data: await getAgentWorkspaceSnapshot() });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
