import { NextRequest } from 'next/server';
import {
  agentErrorResponse,
  agentJson,
  agentOptions,
  agentOrigin,
  requireAgentKey,
} from '@/lib/agent-api/http';
import { publishSite } from '@/lib/services/publishSite';
import { waitForSiteIdle } from '@/lib/agent-api/wait';
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
    await requireAgentKey(request, 'sites:publish');
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const waitForIdle = body.waitForIdle === true || body.wait_for_idle === true;

    if (waitForIdle) {
      const idle = await waitForSiteIdle(id);
      if (!idle) {
        const site = await getSerializedAgentSite(id, agentOrigin(request));
        if (!site) throw new AgentApiError('Site not found', 404);
        return agentJson(
          {
            success: false,
            error: 'The agent is still working. Poll GET /sites/{id} until job.running is false, then publish again.',
            data: site,
          },
          202,
        );
      }
    }

    const published = await publishSite(id);
    const site = await getSerializedAgentSite(id, agentOrigin(request));
    return agentJson({
      success: true,
      data: {
        ...site,
        published,
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 800;
