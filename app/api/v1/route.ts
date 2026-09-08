import { NextRequest } from 'next/server';
import { agentJson, agentOptions, agentOrigin } from '@/lib/agent-api/http';
import { claudeConnectorInstructions } from '@/lib/agent-api/docs';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  const origin = agentOrigin(request);
  return agentJson({
    success: true,
    name: 'Claudable Agent API',
    baseUrl: `${origin}/api/v1`,
    docs: {
      openapi: `${origin}/api/v1/openapi`,
      claude: `${origin}/api/v1/claude`,
    },
    endpoints: {
      mcp: 'POST /mcp',
      me: 'GET /me',
      workspace: 'GET /workspace',
      mail: 'GET /mail',
      templates: 'GET|POST /templates',
      template: 'GET|PATCH|DELETE /templates/{id}',
      sites: 'GET|POST /sites',
      site: 'GET /sites/{id}',
      act: 'POST /sites/{id}/act',
      publish: 'POST /sites/{id}/publish',
      people: 'GET|POST /people',
      person: 'GET|PATCH|DELETE /people/{id}',
      emailTemplates: 'GET|POST /email-templates',
      emailTemplate: 'GET|PATCH|DELETE /email-templates/{id}',
      emails: 'GET /emails',
      email: 'GET|DELETE /emails/{id}',
      sendEmail: 'POST /emails/send',
      work: 'GET|POST|DELETE /leads',
      workRow: 'GET|PATCH|DELETE /leads/{id}',
      workGenerate: 'POST /leads/generate',
      workEnrich: 'POST /leads/enrich',
    },
    auth: 'Authorization: Bearer clb_live_…',
    instructions: claudeConnectorInstructions(origin),
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
