import { getAllProjects } from '@/lib/services/project';
import { listLeads } from '@/lib/services/leads';
import { getPublicMailSettings } from '@/lib/services/mail';
import { getWorkspace, listEmailTemplates } from '@/lib/services/workspace';
import { listManagedTemplates } from '@/lib/templates/store';
import type { ManagedTemplate } from '@/lib/templates/types';

export function serializeManagedTemplate(template: ManagedTemplate) {
  return {
    id: template.id,
    name: template.name,
    niche: template.niche,
    description: template.description,
    kind: template.kind,
    category: template.category,
    hasSnapshot: template.hasSnapshot,
  };
}

export async function getAgentWorkspaceSnapshot() {
  const [store, leads, projects, mail, websiteTemplates, emailTemplates] = await Promise.all([
    getWorkspace(),
    listLeads(),
    getAllProjects(),
    getPublicMailSettings(),
    listManagedTemplates(),
    listEmailTemplates(),
  ]);

  return {
    pages: [
      'overview',
      'sites',
      'templates',
      'emails',
      'work',
      'users',
      'clients',
      'settings',
    ],
    counts: {
      sites: projects.length,
      websiteTemplates: websiteTemplates.length,
      emailTemplates: emailTemplates.length,
      users: store.people.filter((person) => person.kind === 'user').length,
      clients: store.people.filter((person) => person.kind === 'client').length,
      emails: store.emails.length,
      drafts: store.emails.filter((email) => email.status === 'draft').length,
      sent: store.emails.filter((email) => email.status === 'sent').length,
      work: leads.length,
    },
    mail: {
      configured: mail.configured,
      provider: mail.provider,
      fromName: mail.fromName,
      fromEmail: mail.fromEmail,
      replyTo: mail.replyTo,
    },
    sites: projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
    })),
  };
}
