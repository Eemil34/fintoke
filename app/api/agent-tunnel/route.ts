import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';
import { getAgentTunnelStatus, startAgentTunnel, stopAgentTunnel } from '@/lib/agent-api/tunnel';

export async function GET() {
  try {
    return createSuccessResponse(getAgentTunnelStatus());
  } catch (error) {
    return handleApiError(error, 'AgentTunnel', 'Failed to read public URL status');
  }
}

export async function POST() {
  try {
    const status = await startAgentTunnel();
    return createSuccessResponse(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start public URL';
    return createErrorResponse(message, undefined, 502);
  }
}

export async function DELETE() {
  try {
    const status = await stopAgentTunnel();
    return createSuccessResponse(status);
  } catch (error) {
    return handleApiError(error, 'AgentTunnel', 'Failed to stop public URL');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
