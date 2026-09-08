import { NextRequest } from 'next/server';
import { createEmailTemplate, listEmailTemplates } from '@/lib/services/workspace';
import { collectTemplateVars } from '@/lib/services/emailCompose';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'emails:read');
    const templates = await listEmailTemplates();
    return agentJson({
      success: true,
      data: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        body: template.body,
        builtIn: template.builtIn,
        variables: collectTemplateVars(`${template.subject}\n${template.body}`),
      })),
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAgentKey(request, 'emails:send');
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const template = await createEmailTemplate(body);
    return agentJson(
      {
        success: true,
        data: {
          ...template,
          variables: collectTemplateVars(`${template.subject}\n${template.body}`),
        },
      },
      201,
    );
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
