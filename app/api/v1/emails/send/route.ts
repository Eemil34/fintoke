import { NextRequest } from 'next/server';
import { composeAndSendEmail } from '@/lib/services/emailCompose';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  try {
    await requireAgentKey(request, 'emails:send');
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await composeAndSendEmail({
      to: typeof body.to === 'string' ? body.to : undefined,
      personId: typeof body.personId === 'string' ? body.personId : undefined,
      templateId: typeof body.templateId === 'string' ? body.templateId : undefined,
      templateName: typeof body.templateName === 'string' ? body.templateName : undefined,
      subject: typeof body.subject === 'string' ? body.subject : undefined,
      body: typeof body.body === 'string' ? body.body : undefined,
      message: typeof body.message === 'string' ? body.message : undefined,
      variables:
        body.variables && typeof body.variables === 'object'
          ? (body.variables as Record<string, string>)
          : undefined,
      send: body.send !== false,
    });
    return agentJson({
      success: true,
      data: {
        ...result.email,
        delivered: result.delivered,
        message: result.delivered
          ? `Email sent to ${result.email.to}`
          : `Draft saved for ${result.email.to}. It was not sent.`,
      },
    });
  } catch (error) {
    if (error instanceof Error && !(error instanceof AgentApiError)) {
      return agentErrorResponse(new AgentApiError(error.message, 400));
    }
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
