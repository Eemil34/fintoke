import { AGENT_SCOPES, AGENT_SCOPE_LABELS } from './scopes';
import { isLocalOrigin } from './http';

export function claudeRemoteMcpUrl(origin: string): string {
  return `${origin.replace(/\/$/, '')}/api/v1/mcp`;
}

export function claudeConnectorInstructions(origin: string, apiKey = '<PASTE_CLAUDABLE_API_KEY>'): string {
  const mcp = claudeRemoteMcpUrl(origin);
  const local = isLocalOrigin(origin);

  if (local) {
    return `Claude.ai cannot use localhost. Do not generate a website in this chat as a workaround.

On the computer running Claudable:
1. Settings → Claude API → Start public URL
2. Generate an API key
3. In Claude.ai: Customize → Connectors → Add custom connector
4. Remote MCP server URL: (the public https://…/api/v1/mcp URL shown in Claudable)
5. Authentication: None
6. Request headers: Authorization = Bearer ${apiKey}
   If request headers are not available, append ?api_key=${apiKey} to the MCP URL.
7. Enable the Claudable connector in the chat + menu, then ask to make the site.

Claude Code / Claude Desktop on that same computer can use the local MCP stdio server instead.`;
  }

  return `You have a Claudable remote MCP server.

MCP URL: ${mcp}
Add it in Claude.ai: Customize → Connectors → Add custom connector.
Authentication: None
Request header Authorization: Bearer ${apiKey}

After the connector is enabled, use Claudable tools for the whole workspace (sites, templates, emails, users, clients, work table). Start with claudable_get_workspace if you need a map.
Do not generate HTML/React artifacts. Do not say you lack a Claudable integration once the connector is added.
When the user asks to send an email, list templates then call claudable_send_email so it is actually delivered.
Never print the API key.`;
}

export function claudeDesktopMcpConfig(input: {
  scriptPath: string;
  appOrigin: string;
  apiKey?: string;
}): string {
  return JSON.stringify(
    {
      mcpServers: {
        claudable: {
          command: 'node',
          args: [input.scriptPath],
          env: {
            CLAUDABLE_URL: input.appOrigin,
            CLAUDABLE_API_KEY: input.apiKey || '<PASTE_CLAUDABLE_API_KEY>',
          },
        },
      },
    },
    null,
    2,
  );
}

export function agentOpenApiSpec(origin: string) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Claudable Agent API',
      version: '1.0.0',
      description:
        'Create websites with Claude Code, then publish them to Vercel. Authenticate with a Claudable API key. Cloud assistants must use the public HTTPS URL from Settings → Claude API, not localhost.',
    },
    servers: [{ url: `${origin.replace(/\/$/, '')}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Claudable API key starting with clb_live_',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/me': {
        get: {
          operationId: 'getMe',
          summary: 'Show this API key and its permissions',
          responses: { '200': { description: 'Key metadata' } },
        },
      },
      '/workspace': {
        get: {
          operationId: 'getWorkspace',
          summary: 'Overview counts for the whole workspace',
          responses: { '200': { description: 'Workspace' } },
        },
      },
      '/mail': {
        get: {
          operationId: 'getMailStatus',
          summary: 'Mail connection status without secrets',
          responses: { '200': { description: 'Mail' } },
        },
      },
      '/templates': {
        get: {
          operationId: 'listTemplates',
          summary: 'List website templates',
          responses: { '200': { description: 'Templates' } },
        },
        post: {
          operationId: 'createTemplate',
          summary: 'Create a website template',
          responses: { '201': { description: 'Created' } },
        },
      },
      '/sites': {
        get: {
          operationId: 'listSites',
          summary: 'List sites',
          responses: { '200': { description: 'Sites' } },
        },
        post: {
          operationId: 'createSite',
          summary: 'Create a site from a prompt and optionally start the AI builder',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['prompt'],
                  properties: {
                    prompt: { type: 'string' },
                    name: { type: 'string' },
                    templateId: { type: 'string' },
                    cli: { type: 'string', enum: ['claude', 'cursor', 'codex', 'qwen', 'glm'] },
                    start: { type: 'boolean', default: true },
                    publish: { type: 'boolean', default: false },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/sites/{id}': {
        get: {
          operationId: 'getSite',
          summary: 'Get a site, preview URL, job status, and deployment',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Site' } },
        },
      },
      '/sites/{id}/act': {
        post: {
          operationId: 'editSite',
          summary: 'Ask the AI to edit the site',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['instruction'],
                  properties: { instruction: { type: 'string' } },
                },
              },
            },
          },
          responses: { '200': { description: 'Started' } },
        },
      },
      '/people': {
        get: {
          operationId: 'listPeople',
          summary: 'List users and clients',
          responses: { '200': { description: 'People' } },
        },
        post: {
          operationId: 'createPerson',
          summary: 'Create a user or client',
          responses: { '201': { description: 'Created' } },
        },
      },
      '/email-templates': {
        get: {
          operationId: 'listEmailTemplates',
          summary: 'List saved email templates',
          responses: { '200': { description: 'Email templates' } },
        },
        post: {
          operationId: 'createEmailTemplate',
          summary: 'Create an email template',
          responses: { '201': { description: 'Created' } },
        },
      },
      '/emails': {
        get: {
          operationId: 'listEmails',
          summary: 'List draft and sent workspace emails',
          responses: { '200': { description: 'Emails' } },
        },
      },
      '/emails/send': {
        post: {
          operationId: 'sendEmail',
          summary: 'Fill a template and send a real email through SMTP or Resend',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    to: { type: 'string' },
                    personId: { type: 'string' },
                    templateId: { type: 'string' },
                    templateName: { type: 'string' },
                    subject: { type: 'string' },
                    body: { type: 'string' },
                    message: { type: 'string' },
                    variables: { type: 'object', additionalProperties: { type: 'string' } },
                    send: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Sent' } },
        },
      },
      '/leads': {
        get: {
          operationId: 'listWorkRows',
          summary: 'List the sales work table',
          responses: { '200': { description: 'Rows' } },
        },
        post: {
          operationId: 'createWorkRow',
          summary: 'Add a business row to the work table',
          responses: { '201': { description: 'Created' } },
        },
        delete: {
          operationId: 'deleteWorkRows',
          summary: 'Delete selected work rows or the whole table',
          responses: { '200': { description: 'Deleted' } },
        },
      },
      '/leads/generate': {
        post: {
          operationId: 'generateWorkRows',
          summary: 'Add businesses to the work table with ChatGPT web search',
          responses: { '200': { description: 'Created' } },
        },
      },
      '/leads/enrich': {
        post: {
          operationId: 'enrichWorkRows',
          summary: 'Fill work-table rows from public sources',
          responses: { '200': { description: 'Filled' } },
        },
      },
      '/leads/{id}': {
        get: {
          operationId: 'getWorkRow',
          summary: 'Get one work-table row',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Row' } },
        },
        patch: {
          operationId: 'updateWorkRow',
          summary: 'Update a work-table row',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Updated' } },
        },
      },
      '/sites/{id}/publish': {
        post: {
          operationId: 'publishSite',
          summary: 'Deploy the site to Vercel (creates GitHub/Vercel projects if needed)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { waitForIdle: { type: 'boolean' } },
                },
              },
            },
          },
          responses: { '200': { description: 'Published' } },
        },
      },
    },
    'x-permissions': AGENT_SCOPES.map((scope) => ({
      scope,
      ...AGENT_SCOPE_LABELS[scope],
    })),
  };
}
