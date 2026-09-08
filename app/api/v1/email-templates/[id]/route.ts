import { NextRequest } from 'next/server';
import { deleteEmailTemplate, getEmailTemplate, updateEmailTemplate } from '@/lib/services/workspace';
import { collectTemplateVars } from '@/lib/services/emailCompose';
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
    const template = await getEmailTemplate(id);
    if (!template) throw new AgentApiError('Email template not found', 404);
    return agentJson({
      success: true,
      data: {
        ...template,
        variables: collectTemplateVars(`${template.subject}\n${template.body}`),
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'emails:send');
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const template = await updateEmailTemplate(id, body);
    return agentJson({
      success: true,
      data: {
        ...template,
        variables: collectTemplateVars(`${template.subject}\n${template.body}`),
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAgentKey(request, 'emails:send');
    const { id } = await params;
    await deleteEmailTemplate(id);
    return agentJson({ success: true, data: { id } });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
