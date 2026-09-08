import { NextRequest } from 'next/server';
import {
  agentErrorResponse,
  agentJson,
  agentOptions,
  agentOrigin,
  requireAgentKey,
} from '@/lib/agent-api/http';
import { startProjectInstruction } from '@/lib/services/agentRun';
import { getSerializedAgentSite } from '@/lib/agent-api/serialize';
import { AgentApiError } from '@/lib/agent-api/keys';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'sites:edit');
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const instruction = String(body.instruction || body.prompt || '').trim();
    if (!instruction) {
      throw new AgentApiError('instruction is required');
    }

    const job = await startProjectInstruction({
      projectId: id,
      instruction,
      cliPreference: typeof body.cli === 'string' ? body.cli : undefined,
    });

    const site = await getSerializedAgentSite(id, agentOrigin(request));
    return agentJson({
      success: true,
      data: {
        ...site,
        jobStarted: job,
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
