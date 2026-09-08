import { revokeAgentApiKey } from '@/lib/agent-api/keys';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const revoked = await revokeAgentApiKey(id);
    if (!revoked) {
      return createErrorResponse('API key not found', undefined, 404);
    }
    return createSuccessResponse({ id, revoked: true });
  } catch (error) {
    return handleApiError(error, 'AgentKeys', 'Failed to revoke API key');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
