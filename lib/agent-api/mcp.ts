import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { createProject, getAllProjects } from '@/lib/services/project';
import { generateProjectId } from '@/lib/utils';
import { getDefaultModelForCli, normalizeModelId } from '@/lib/constants/cliModels';
import { suggestWebsiteTemplate } from '@/lib/templates/match';
import { startProjectInstruction } from '@/lib/services/agentRun';
import { publishSite } from '@/lib/services/publishSite';
import { serializeAgentSite, getSerializedAgentSite } from '@/lib/agent-api/serialize';
import { agentOrigin, extractAgentToken, requireMcpAgentKey } from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { collectTemplateVars, composeAndSendEmail } from '@/lib/services/emailCompose';
import {
  createEmailTemplate,
  createPerson,
  deleteEmail,
  deleteEmailTemplate,
  deletePerson,
  getEmail,
  getEmailTemplate,
  getPerson,
  listEmailTemplates,
  listEmails,
  listPeople,
  updateEmailTemplate,
  updatePerson,
} from '@/lib/services/workspace';
import { createLead, deleteAllLeads, deleteLeads, getLead, listLeads, updateLead } from '@/lib/services/leads';
import { analyzeLeadWebsite, enrichEmptyLeads, enrichLeads, generateWorkRows } from '@/lib/services/leadEnrich';
import { canReadLeads, canWriteLeads } from '@/lib/agent-api/scopes';
import { getPublicMailSettings } from '@/lib/services/mail';
import {
  createManagedTemplate,
  deleteManagedTemplate,
  getManagedTemplate,
  listManagedTemplates,
  updateManagedTemplate,
} from '@/lib/templates/store';
import { getAgentWorkspaceSnapshot, serializeManagedTemplate } from '@/lib/agent-api/workspaceAccess';

const PROTOCOL_VERSIONS = new Set(['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25']);

type JsonRpcMessage = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown> & { name?: string; arguments?: Record<string, unknown> };
};

export const MCP_TOOLS = [
  {
    name: 'claudable_list_templates',
    description: 'List website templates in this Claudable workspace.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_list_sites',
    description: 'List sites in this Claudable workspace.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_get_site',
    description: 'Get a site, local preview URL, job status, and Vercel deployment URL.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_create_site',
    description:
      'Create a website in Claudable from a prompt. Use this instead of writing HTML/React in chat. Then call claudable_get_site until job.running is false. Use claudable_publish_site if the user wants it live on Vercel.',
    inputSchema: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string' },
        name: { type: 'string' },
        templateId: { type: 'string' },
        start: { type: 'boolean', default: true },
        publish: { type: 'boolean', default: false },
      },
    },
  },
  {
    name: 'claudable_edit_site',
    description: 'Ask Claudable to edit an existing site. Then poll claudable_get_site until job.running is false.',
    inputSchema: {
      type: 'object',
      required: ['id', 'instruction'],
      properties: {
        id: { type: 'string' },
        instruction: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_publish_site',
    description: 'Publish a Claudable site to Vercel using tokens already stored in Settings → Services.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        waitForIdle: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'claudable_list_email_templates',
    description: 'List saved email templates in this Claudable workspace. Use one of these when the user asks to write or send an email.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_list_people',
    description: 'List users and clients (name, email, company) so you can address a real recipient.',
    inputSchema: {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['user', 'client'] } },
    },
  },
  {
    name: 'claudable_list_emails',
    description: 'List draft, sent, and failed workspace emails.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_send_email',
    description:
      'Fill a saved email template and actually send it through the workspace mail connection (SMTP or Resend). Do not pretend to send. Use templateId or templateName from claudable_list_email_templates. Pass to or personId, plus any {{variables}} in the template.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email, or a contact name to resolve' },
        personId: { type: 'string' },
        templateId: { type: 'string' },
        templateName: { type: 'string' },
        subject: { type: 'string', description: 'Optional subject override' },
        body: { type: 'string', description: 'Optional body override if no template is used' },
        message: { type: 'string', description: 'Fills the {{message}} slot in the template' },
        variables: { type: 'object', additionalProperties: { type: 'string' } },
        send: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'claudable_list_work_rows',
    description:
      'List the workspace work table: businesses, what they do, email, website, style, offer sent, response, called, message sent, Vercel URL, notes.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_get_work_row',
    description: 'Get one work-table row by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_upsert_work_row',
    description:
      'Create or update a work-table row. If id is omitted, a new row is created. Fill business facts you know (email, whatTheyDo, website, hasWebsite, style) and tracking fields (offerSent, responded, called, messageSent, vercelUrl). responded is none, waiting, yes, or no.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        business: { type: 'string' },
        whatTheyDo: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        city: { type: 'string' },
        website: { type: 'string' },
        hasWebsite: { type: 'boolean' },
        instagram: { type: 'string' },
        language: { type: 'string' },
        style: { type: 'string' },
        audience: { type: 'string' },
        currentSiteNotes: { type: 'string' },
        siteLook: { type: 'string' },
        siteState: { type: 'string' },
        siteActions: { type: 'string' },
        offerPrice: { type: 'string' },
        offerSent: { type: 'boolean' },
        responded: { type: 'string', enum: ['none', 'waiting', 'yes', 'no'] },
        called: { type: 'boolean' },
        messageSent: { type: 'boolean' },
        vercelUrl: { type: 'string' },
        nextStep: { type: 'string' },
        followUpAt: { type: 'string' },
        notes: { type: 'string' },
        details: { type: 'string' },
        contactName: { type: 'string' },
        personId: { type: 'string' },
        projectId: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_generate_work_rows',
    description:
      'Ask ChatGPT to add many real businesses to the work table, e.g. 20 cafes in Finland. Only fills fields it is reasonably sure about; the rest stay empty.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text request, e.g. bakeries in Tampere' },
        kind: { type: 'string', description: 'Type of business, e.g. restaurants' },
        country: { type: 'string' },
        city: { type: 'string' },
        count: { type: 'number', default: 20 },
      },
    },
  },
  {
    name: 'claudable_get_workspace',
    description:
      'Overview of the whole Claudable workspace: counts for sites, templates, emails, users, clients, and work rows, plus whether mail is connected.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_get_mail_status',
    description: 'See if SMTP or Resend is connected and which from-address is used. Does not return passwords.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_upsert_person',
    description: 'Create or update a user or client. Omit id to create. kind is user or client.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        kind: { type: 'string', enum: ['user', 'client'] },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        role: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_delete_person',
    description: 'Delete a user or client by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_upsert_email_template',
    description: 'Create or update a saved email template. Omit id to create.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_delete_email_template',
    description: 'Delete a custom email template. Built-in templates cannot be deleted.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_get_email',
    description: 'Get one workspace email (draft or sent) by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_delete_email',
    description: 'Delete a workspace email record by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_delete_work_rows',
    description: 'Delete work-table rows. Pass ids, or all=true to clear the table.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        all: { type: 'boolean' },
      },
    },
  },
  {
    name: 'claudable_enrich_work_rows',
    description:
      'Fill work-table rows from public sources and the live website: company facts, how the site looks, current state, and recommended work. Pass ids, or emptyOnly=true.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        emptyOnly: { type: 'boolean' },
      },
    },
  },
  {
    name: 'claudable_analyze_work_row',
    description:
      'Fetch a company’s live website and fill the work row with how it looks, current state, and recommended work (SEO, marketing, rebuild, maintenance). Requires website on the row.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_get_template',
    description: 'Get one website template by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_upsert_template',
    description: 'Create or update a website template. Omit id to create.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        niche: { type: 'string' },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_delete_template',
    description: 'Delete a custom website template, or hide a built-in one.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
];

function siteNameFromPrompt(prompt: string, name?: string): string {
  if (name?.trim()) return name.trim().slice(0, 50);
  const line = prompt.split('\n')[0]?.trim() || 'New site';
  return line.length > 50 ? `${line.slice(0, 47)}...` : line;
}

function rpcResult(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function rpcError(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function toolText(data: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

async function callTool(request: NextRequest, name: string, args: Record<string, unknown>) {
  const origin = agentOrigin(request);

  switch (name) {
    case 'claudable_list_templates': {
      await requireMcpAgentKey(request, 'templates:read');
      const templates = await listManagedTemplates();
      return templates.map(serializeManagedTemplate);
    }
    case 'claudable_list_sites': {
      await requireMcpAgentKey(request, 'sites:read');
      const projects = await getAllProjects();
      return Promise.all(projects.map((project) => serializeAgentSite(project, origin)));
    }
    case 'claudable_get_site': {
      await requireMcpAgentKey(request, 'sites:read');
      const id = String(args.id || '');
      const site = await getSerializedAgentSite(id, origin);
      if (!site) throw new AgentApiError('Site not found', 404);
      return site;
    }
    case 'claudable_create_site': {
      const key = await requireMcpAgentKey(request, 'sites:create');
      const prompt = String(args.prompt || args.instruction || '').trim();
      if (!prompt) throw new AgentApiError('prompt is required');
      const start = args.start !== false;
      const publish = args.publish === true;
      if (start && !key.scopes.includes('sites:edit')) {
        throw new AgentApiError('This key cannot start the AI. Enable “Edit with AI”.', 403);
      }
      if (publish && !key.scopes.includes('sites:publish')) {
        throw new AgentApiError('This key cannot publish. Enable “Publish to Vercel”.', 403);
      }
      const cli = String(args.cli || 'claude').toLowerCase();
      const templates = await listManagedTemplates();
      const requestedTemplate = typeof args.templateId === 'string' ? args.templateId : '';
      const suggested = suggestWebsiteTemplate(prompt, templates);
      const templateId = requestedTemplate || suggested?.id || undefined;
      const projectId = generateProjectId();
      const project = await createProject({
        project_id: projectId,
        name: siteNameFromPrompt(prompt, typeof args.name === 'string' ? args.name : undefined),
        initialPrompt: prompt,
        preferredCli: cli,
        selectedModel: normalizeModelId(cli, getDefaultModelForCli(cli)),
        description: prompt.slice(0, 180),
        websiteTemplateId: templateId,
      });
      let job = null;
      if (start) {
        job = await startProjectInstruction({
          projectId,
          instruction: prompt,
          cliPreference: cli,
          isInitialPrompt: true,
        });
      }
      let published = null;
      if (publish) {
        published = await publishSite(projectId);
      }
      const site = await serializeAgentSite(project, origin);
      return {
        ...site,
        jobStarted: job,
        published,
        next:
          'Poll claudable_get_site until job.running is false. Then claudable_publish_site if the user wants it live. Do not generate a substitute website in chat.',
      };
    }
    case 'claudable_edit_site': {
      await requireMcpAgentKey(request, 'sites:edit');
      const id = String(args.id || '');
      const instruction = String(args.instruction || args.prompt || '').trim();
      if (!instruction) throw new AgentApiError('instruction is required');
      const job = await startProjectInstruction({
        projectId: id,
        instruction,
        cliPreference: typeof args.cli === 'string' ? args.cli : undefined,
      });
      const site = await getSerializedAgentSite(id, origin);
      if (!site) throw new AgentApiError('Site not found', 404);
      return { ...site, jobStarted: job };
    }
    case 'claudable_publish_site': {
      await requireMcpAgentKey(request, 'sites:publish');
      const id = String(args.id || '');
      const published = await publishSite(id);
      const site = await getSerializedAgentSite(id, origin);
      if (!site) throw new AgentApiError('Site not found', 404);
      return { ...site, published };
    }
    case 'claudable_list_email_templates': {
      await requireMcpAgentKey(request, 'emails:read');
      const templates = await listEmailTemplates();
      return templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        body: template.body,
        builtIn: template.builtIn,
        variables: collectTemplateVars(`${template.subject}\n${template.body}`),
      }));
    }
    case 'claudable_list_people': {
      await requireMcpAgentKey(request, 'emails:read');
      const kind = args.kind === 'user' || args.kind === 'client' ? args.kind : undefined;
      const people = await listPeople(kind);
      return people;
    }
    case 'claudable_list_emails': {
      await requireMcpAgentKey(request, 'emails:read');
      return listEmails();
    }
    case 'claudable_send_email': {
      await requireMcpAgentKey(request, 'emails:send');
      const result = await composeAndSendEmail({
        to: typeof args.to === 'string' ? args.to : undefined,
        personId: typeof args.personId === 'string' ? args.personId : undefined,
        templateId: typeof args.templateId === 'string' ? args.templateId : undefined,
        templateName: typeof args.templateName === 'string' ? args.templateName : undefined,
        subject: typeof args.subject === 'string' ? args.subject : undefined,
        body: typeof args.body === 'string' ? args.body : undefined,
        message: typeof args.message === 'string' ? args.message : undefined,
        variables:
          args.variables && typeof args.variables === 'object'
            ? (args.variables as Record<string, string>)
            : undefined,
        send: args.send !== false,
      });
      return {
        ...result.email,
        delivered: result.delivered,
        next: result.delivered
          ? `The email was sent to ${result.email.to}. Do not claim it is only a draft.`
          : 'Draft saved. It was not sent because send=false.',
      };
    }
    case 'claudable_list_work_rows': {
      const key = await requireMcpAgentKey(request);
      if (!canReadLeads(key.scopes)) throw new AgentApiError('This key cannot read the work table.', 403);
      return listLeads();
    }
    case 'claudable_get_work_row': {
      const key = await requireMcpAgentKey(request);
      if (!canReadLeads(key.scopes)) throw new AgentApiError('This key cannot read the work table.', 403);
      const lead = await getLead(String(args.id || ''));
      if (!lead) throw new AgentApiError('Row not found', 404);
      return lead;
    }
    case 'claudable_upsert_work_row': {
      const key = await requireMcpAgentKey(request);
      if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
      const id = typeof args.id === 'string' ? args.id.trim() : '';
      if (id) return updateLead(id, args);
      return createLead(args);
    }
    case 'claudable_generate_work_rows': {
      const key = await requireMcpAgentKey(request);
      if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
      return generateWorkRows({
        query: typeof args.query === 'string' ? args.query : undefined,
        kind: typeof args.kind === 'string' ? args.kind : undefined,
        country: typeof args.country === 'string' ? args.country : undefined,
        city: typeof args.city === 'string' ? args.city : undefined,
        count: typeof args.count === 'number' ? args.count : undefined,
      });
    }
    case 'claudable_get_workspace': {
      await requireMcpAgentKey(request, 'workspace:read');
      return getAgentWorkspaceSnapshot();
    }
    case 'claudable_get_mail_status': {
      await requireMcpAgentKey(request, 'workspace:read');
      const mail = await getPublicMailSettings();
      return {
        configured: mail.configured,
        provider: mail.provider,
        fromName: mail.fromName,
        fromEmail: mail.fromEmail,
        replyTo: mail.replyTo,
      };
    }
    case 'claudable_upsert_person': {
      await requireMcpAgentKey(request, 'people:write');
      const id = typeof args.id === 'string' ? args.id.trim() : '';
      if (id) return updatePerson(id, args);
      return createPerson(args);
    }
    case 'claudable_delete_person': {
      await requireMcpAgentKey(request, 'people:write');
      const id = String(args.id || '');
      const person = await getPerson(id);
      if (!person) throw new AgentApiError('Person not found', 404);
      await deletePerson(id);
      return { id };
    }
    case 'claudable_upsert_email_template': {
      await requireMcpAgentKey(request, 'emails:send');
      const id = typeof args.id === 'string' ? args.id.trim() : '';
      const template = id ? await updateEmailTemplate(id, args) : await createEmailTemplate(args);
      return {
        ...template,
        variables: collectTemplateVars(`${template.subject}\n${template.body}`),
      };
    }
    case 'claudable_delete_email_template': {
      await requireMcpAgentKey(request, 'emails:send');
      const id = String(args.id || '');
      const template = await getEmailTemplate(id);
      if (!template) throw new AgentApiError('Email template not found', 404);
      await deleteEmailTemplate(id);
      return { id };
    }
    case 'claudable_get_email': {
      await requireMcpAgentKey(request, 'emails:read');
      const email = await getEmail(String(args.id || ''));
      if (!email) throw new AgentApiError('Email not found', 404);
      return email;
    }
    case 'claudable_delete_email': {
      await requireMcpAgentKey(request, 'emails:send');
      const id = String(args.id || '');
      await deleteEmail(id);
      return { id };
    }
    case 'claudable_delete_work_rows': {
      const key = await requireMcpAgentKey(request);
      if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
      if (args.all === true) return { removed: await deleteAllLeads() };
      const ids = Array.isArray(args.ids) ? args.ids.map((id) => String(id)) : [];
      return { removed: await deleteLeads(ids) };
    }
    case 'claudable_enrich_work_rows': {
      const key = await requireMcpAgentKey(request);
      if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
      const ids = Array.isArray(args.ids) ? args.ids.map((id) => String(id)) : [];
      if (args.emptyOnly === true && ids.length === 0) return enrichEmptyLeads();
      return enrichLeads(ids);
    }
    case 'claudable_analyze_work_row': {
      const key = await requireMcpAgentKey(request);
      if (!canWriteLeads(key.scopes)) throw new AgentApiError('This key cannot write the work table.', 403);
      return analyzeLeadWebsite(String(args.id || ''));
    }
    case 'claudable_get_template': {
      await requireMcpAgentKey(request, 'templates:read');
      const template = await getManagedTemplate(String(args.id || ''));
      if (!template) throw new AgentApiError('Template not found', 404);
      return serializeManagedTemplate(template);
    }
    case 'claudable_upsert_template': {
      await requireMcpAgentKey(request, 'templates:write');
      const id = typeof args.id === 'string' ? args.id.trim() : '';
      if (id) return serializeManagedTemplate(await updateManagedTemplate(id, args));
      return serializeManagedTemplate(await createManagedTemplate(args));
    }
    case 'claudable_delete_template': {
      await requireMcpAgentKey(request, 'templates:write');
      const id = String(args.id || '');
      return { id, ...(await deleteManagedTemplate(id)) };
    }
    default:
      throw new AgentApiError(`Unknown tool: ${name}`, 400);
  }
}

export function mcpSessionId(request: NextRequest): string {
  return request.headers.get('mcp-session-id') || request.headers.get('Mcp-Session-Id') || randomUUID();
}

export async function handleMcpMessage(request: NextRequest, message: JsonRpcMessage) {
  if (!message || message.jsonrpc !== '2.0') {
    return { httpStatus: 400, body: rpcError(null, -32600, 'Invalid JSON-RPC request') };
  }

  const { id, method, params } = message;
  if (!method) {
    return { httpStatus: 202, body: null };
  }
  if (id === undefined) {
    return { httpStatus: 202, body: null };
  }

  try {
    if (method === 'initialize') {
      const requested = String(params?.protocolVersion || '');
      return {
        httpStatus: 200,
        body: rpcResult(id, {
          protocolVersion: PROTOCOL_VERSIONS.has(requested) ? requested : '2025-03-26',
          capabilities: { tools: {} },
          serverInfo: { name: 'claudable', version: '2.0.0' },
          instructions:
            'You are connected to the full Claudable workspace: overview, sites, website templates, emails, users, clients, work table, and mail status. Use these tools instead of generating HTML/React in chat. Use claudable_get_workspace first if you need a map of what exists.',
        }),
      };
    }
    if (method === 'ping' || method === 'notifications/initialized') {
      return { httpStatus: 200, body: rpcResult(id, {}) };
    }
    if (method === 'tools/list') {
      return { httpStatus: 200, body: rpcResult(id, { tools: MCP_TOOLS }) };
    }
    if (method === 'tools/call') {
      const name = String(params?.name || '');
      console.info('[MCP] tools/call', name, extractAgentToken(request) ? 'header-key' : 'linked-key');
      const result = await callTool(request, name, (params?.arguments as Record<string, unknown>) || {});
      return { httpStatus: 200, body: rpcResult(id, toolText(result)) };
    }
    return { httpStatus: 200, body: rpcError(id, -32601, `Unknown method: ${method}`) };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    const status = error instanceof AgentApiError ? error.status : 500;
    if (method === 'tools/call') {
      return {
        httpStatus: 200,
        body: rpcResult(id, { content: [{ type: 'text', text: messageText }], isError: true }),
      };
    }
    return {
      httpStatus: 200,
      body: rpcError(id, status === 401 ? -32001 : -32000, messageText),
    };
  }
}
