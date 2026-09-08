import { NextRequest } from 'next/server';
import { agentJson, agentOptions, requireAgentKey, agentErrorResponse } from '@/lib/agent-api/http';
import { serializeManagedTemplate } from '@/lib/agent-api/workspaceAccess';
import { createManagedTemplate, listManagedTemplates } from '@/lib/templates/store';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'templates:read');
    const templates = await listManagedTemplates();
    return agentJson({
      success: true,
      data: templates.map(serializeManagedTemplate),
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAgentKey(request, 'templates:write');
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const template = await createManagedTemplate(body);
    return agentJson({ success: true, data: serializeManagedTemplate(template) }, 201);
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
