#!/usr/bin/env node
/**
 * Local MCP server for Claude Desktop / Claude Code.
 * Talks to Claudable on this machine — cloud Claude cannot use this.
 *
 *   CLAUDABLE_URL=http://127.0.0.1:3002
 *   CLAUDABLE_API_KEY=clb_live_...
 *   node scripts/claudable-mcp.js
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const BASE = String(process.env.CLAUDABLE_URL || `http://127.0.0.1:${process.env.PORT || 3002}`).replace(
  /\/$/,
  '',
);
const API = `${BASE}/api/v1`;
const KEY = String(process.env.CLAUDABLE_API_KEY || '').trim();

function send(message) {
  const json = JSON.stringify(message);
  const payload = Buffer.from(json, 'utf8');
  process.stdout.write(`Content-Length: ${payload.length}\r\n\r\n`);
  process.stdout.write(payload);
}

function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function api(method, pathname, body) {
  if (!KEY) {
    throw new Error('CLAUDABLE_API_KEY is missing. Generate a key in Claudable → Settings → Claude API.');
  }
  const response = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || payload?.message || `${method} ${pathname} failed (${response.status})`);
  }
  return payload;
}

async function waitForIdle(id, timeoutMs = 8 * 60 * 1000) {
  const started = Date.now();
  let latest = await api('GET', `/sites/${encodeURIComponent(id)}`);
  while (Date.now() - started < timeoutMs) {
    const running = latest?.data?.job?.running;
    if (!running) return latest;
    await new Promise((resolve) => setTimeout(resolve, 5000));
    latest = await api('GET', `/sites/${encodeURIComponent(id)}`);
  }
  return latest;
}

const TOOLS = [
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
    description: 'Get a site, preview URL, job status, and Vercel deployment.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_create_site',
    description:
      'Create a website in Claudable from a prompt. Use this instead of writing HTML/React yourself. Optionally wait until the builder finishes and/or publish to Vercel.',
    inputSchema: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string' },
        name: { type: 'string' },
        templateId: { type: 'string' },
        start: { type: 'boolean', default: true },
        publish: { type: 'boolean', default: false },
        wait: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'claudable_edit_site',
    description: 'Ask Claudable to edit an existing site.',
    inputSchema: {
      type: 'object',
      required: ['id', 'instruction'],
      properties: {
        id: { type: 'string' },
        instruction: { type: 'string' },
        wait: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'claudable_publish_site',
    description: 'Publish a Claudable site to Vercel (uses tokens already stored in Settings → Services).',
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
    description: 'List saved email templates in this Claudable workspace.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_list_people',
    description: 'List users and clients so you can send to a real recipient.',
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
      'Fill a saved email template and actually send it through SMTP or Resend. Use templateId or templateName from claudable_list_email_templates.',
    inputSchema: {
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
  {
    name: 'claudable_list_work_rows',
    description: 'List the sales work table (businesses, offers, replies, calls, Vercel links).',
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
    description: 'Create or update a work-table row. Omit id to create.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        business: { type: 'string' },
        whatTheyDo: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        website: { type: 'string' },
        hasWebsite: { type: 'boolean' },
        style: { type: 'string' },
        offerSent: { type: 'boolean' },
        responded: { type: 'string' },
        called: { type: 'boolean' },
        messageSent: { type: 'boolean' },
        vercelUrl: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  },
  {
    name: 'claudable_generate_work_rows',
    description: 'Add many real businesses to the work table with ChatGPT, e.g. 20 cafes in Finland.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        kind: { type: 'string' },
        country: { type: 'string' },
        city: { type: 'string' },
        count: { type: 'number' },
      },
    },
  },
  {
    name: 'claudable_get_workspace',
    description: 'Overview of sites, templates, emails, people, work rows, and mail status.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_get_mail_status',
    description: 'See if SMTP or Resend is connected. Does not return passwords.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claudable_upsert_person',
    description: 'Create or update a user or client. Omit id to create.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        kind: { type: 'string' },
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
    description: 'Delete a user or client.',
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
    description: 'Delete a custom email template.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_get_email',
    description: 'Get one workspace email by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_delete_email',
    description: 'Delete a workspace email record.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
  {
    name: 'claudable_delete_work_rows',
    description: 'Delete work rows. Pass ids or all=true.',
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
    description: 'Fill work rows with ChatGPT. Pass ids or emptyOnly=true.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        emptyOnly: { type: 'boolean' },
      },
    },
  },
  {
    name: 'claudable_get_template',
    description: 'Get one website template.',
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
    description: 'Delete or hide a website template.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } },
    },
  },
];

async function callTool(name, args = {}) {
  switch (name) {
    case 'claudable_list_templates':
      return api('GET', '/templates');
    case 'claudable_list_sites':
      return api('GET', '/sites');
    case 'claudable_get_site':
      return api('GET', `/sites/${encodeURIComponent(args.id)}`);
    case 'claudable_create_site': {
      const created = await api('POST', '/sites', {
        prompt: args.prompt,
        name: args.name,
        templateId: args.templateId,
        start: args.start !== false,
        publish: args.publish === true,
      });
      const id = created?.data?.id;
      if (args.wait !== false && id && args.publish !== true) {
        return waitForIdle(id);
      }
      return created;
    }
    case 'claudable_edit_site': {
      const edited = await api('POST', `/sites/${encodeURIComponent(args.id)}/act`, {
        instruction: args.instruction,
      });
      if (args.wait !== false) {
        return waitForIdle(args.id);
      }
      return edited;
    }
    case 'claudable_publish_site':
      return api('POST', `/sites/${encodeURIComponent(args.id)}/publish`, {
        waitForIdle: args.waitForIdle !== false,
      });
    case 'claudable_list_email_templates':
      return api('GET', '/email-templates');
    case 'claudable_list_people':
      return api('GET', args.kind ? `/people?kind=${encodeURIComponent(args.kind)}` : '/people');
    case 'claudable_list_emails':
      return api('GET', '/emails');
    case 'claudable_send_email':
      return api('POST', '/emails/send', {
        to: args.to,
        personId: args.personId,
        templateId: args.templateId,
        templateName: args.templateName,
        subject: args.subject,
        body: args.body,
        message: args.message,
        variables: args.variables,
        send: args.send !== false,
      });
    case 'claudable_list_work_rows':
      return api('GET', '/leads');
    case 'claudable_get_work_row':
      return api('GET', `/leads/${encodeURIComponent(args.id)}`);
    case 'claudable_upsert_work_row':
      if (args.id) {
        return api('PATCH', `/leads/${encodeURIComponent(args.id)}`, args);
      }
      return api('POST', '/leads', args);
    case 'claudable_generate_work_rows':
      return api('POST', '/leads/generate', {
        query: args.query,
        kind: args.kind,
        country: args.country,
        city: args.city,
        count: args.count,
      });
    case 'claudable_get_workspace':
      return api('GET', '/workspace');
    case 'claudable_get_mail_status':
      return api('GET', '/mail');
    case 'claudable_upsert_person':
      if (args.id) {
        return api('PATCH', `/people/${encodeURIComponent(args.id)}`, args);
      }
      return api('POST', '/people', args);
    case 'claudable_delete_person':
      return api('DELETE', `/people/${encodeURIComponent(args.id)}`);
    case 'claudable_upsert_email_template':
      if (args.id) {
        return api('PATCH', `/email-templates/${encodeURIComponent(args.id)}`, args);
      }
      return api('POST', '/email-templates', args);
    case 'claudable_delete_email_template':
      return api('DELETE', `/email-templates/${encodeURIComponent(args.id)}`);
    case 'claudable_get_email':
      return api('GET', `/emails/${encodeURIComponent(args.id)}`);
    case 'claudable_delete_email':
      return api('DELETE', `/emails/${encodeURIComponent(args.id)}`);
    case 'claudable_delete_work_rows':
      return api('DELETE', '/leads', { all: args.all === true, ids: args.ids });
    case 'claudable_enrich_work_rows':
      return api('POST', '/leads/enrich', { ids: args.ids, emptyOnly: args.emptyOnly });
    case 'claudable_get_template':
      return api('GET', `/templates/${encodeURIComponent(args.id)}`);
    case 'claudable_upsert_template':
      if (args.id) {
        return api('PATCH', `/templates/${encodeURIComponent(args.id)}`, args);
      }
      return api('POST', '/templates', args);
    case 'claudable_delete_template':
      return api('DELETE', `/templates/${encodeURIComponent(args.id)}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const PROTOCOL = new Set(['2024-11-05', '2025-03-26', '2025-06-18']);

async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  const { id, method, params } = message;
  if (id === undefined) return;

  try {
    if (method === 'initialize') {
      const requested = params?.protocolVersion;
      reply(id, {
        protocolVersion: PROTOCOL.has(requested) ? requested : '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'claudable', version: '2.0.0' },
        instructions:
          'Use Claudable tools for the full workspace: overview, sites, templates, emails, users, clients, and the work table. Call claudable_get_workspace if you need a map. Never generate a substitute HTML/React site in this chat.',
      });
      return;
    }
    if (method === 'ping') {
      reply(id, {});
      return;
    }
    if (method === 'tools/list') {
      reply(id, { tools: TOOLS });
      return;
    }
    if (method === 'tools/call') {
      const result = await callTool(params?.name, params?.arguments || {});
      reply(id, {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      });
      return;
    }
    fail(id, -32601, `Unknown method: ${method}`);
  } catch (error) {
    if (method === 'tools/call') {
      reply(id, {
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
        isError: true,
      });
      return;
    }
    fail(id, -32000, error instanceof Error ? error.message : String(error));
  }
}

let buffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;
    const header = buffer.slice(0, headerEnd).toString('utf8');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number.parseInt(match[1], 10);
    const start = headerEnd + 4;
    if (buffer.length < start + length) break;
    const body = buffer.slice(start, start + length).toString('utf8');
    buffer = buffer.slice(start + length);
    try {
      void handle(JSON.parse(body));
    } catch (error) {
      process.stderr.write(`[claudable-mcp] ${error instanceof Error ? error.message : error}\n`);
    }
  }
});

process.stdin.on('end', () => process.exit(0));
process.stdin.resume();

if (!fs.existsSync(path.join(root, 'package.json'))) {
  process.stderr.write('[claudable-mcp] Run this script from the Claudable repo.\n');
}
