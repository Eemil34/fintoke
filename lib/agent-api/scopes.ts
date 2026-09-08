export const AGENT_SCOPES = [
  'sites:read',
  'sites:create',
  'sites:edit',
  'sites:publish',
  'templates:read',
  'templates:write',
  'emails:read',
  'emails:send',
  'people:write',
  'leads:read',
  'leads:write',
  'workspace:read',
] as const;

export type AgentScope = (typeof AGENT_SCOPES)[number];

export const AGENT_SCOPE_LABELS: Record<AgentScope, { title: string; description: string }> = {
  'sites:read': {
    title: 'Read sites',
    description: 'List sites, preview URLs, and deployment status',
  },
  'sites:create': {
    title: 'Create sites',
    description: 'Create a new site from a prompt or template',
  },
  'sites:edit': {
    title: 'Edit with AI',
    description: 'Ask Claude Code (or another connected agent) to change a site',
  },
  'sites:publish': {
    title: 'Publish to Vercel',
    description: 'Connect GitHub if needed and deploy the site to Vercel',
  },
  'templates:read': {
    title: 'Read templates',
    description: 'See available website templates',
  },
  'templates:write': {
    title: 'Edit templates',
    description: 'Create, update, or delete website templates',
  },
  'emails:read': {
    title: 'Read emails',
    description: 'List email templates, contacts, and sent mail',
  },
  'emails:send': {
    title: 'Send emails',
    description: 'Fill a saved email template and send it to a real inbox',
  },
  'people:write': {
    title: 'Edit people',
    description: 'Add or update users and clients',
  },
  'leads:read': {
    title: 'Read work table',
    description: 'See businesses, offers, replies, calls, and Vercel links',
  },
  'leads:write': {
    title: 'Update work table',
    description: 'Add, fill, or delete rows in the work spreadsheet',
  },
  'workspace:read': {
    title: 'Read workspace',
    description: 'See overview counts and whether mail is connected',
  },
};

export function parseScopes(value: unknown): AgentScope[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(',');
          } catch {
            return value.split(',');
          }
        })()
      : [];

  const allowed = new Set<string>(AGENT_SCOPES);
  const scopes = raw
    .map((item) => String(item).trim())
    .filter((item): item is AgentScope => allowed.has(item));

  return [...new Set(scopes)];
}

export function hasScope(granted: AgentScope[], needed: AgentScope | AgentScope[]): boolean {
  const required = Array.isArray(needed) ? needed : [needed];
  return required.every((scope) => granted.includes(scope));
}

export function canReadLeads(scopes: AgentScope[]): boolean {
  return hasScope(scopes, 'leads:read') || hasScope(scopes, 'emails:read') || hasScope(scopes, 'sites:read');
}

export function canWriteLeads(scopes: AgentScope[]): boolean {
  return hasScope(scopes, 'leads:write') || hasScope(scopes, 'emails:send') || hasScope(scopes, 'sites:edit');
}
