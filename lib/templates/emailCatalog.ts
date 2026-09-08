import type { WorkspaceEmailTemplate } from '@/types/workspace';

const STAMP = '2024-01-01T00:00:00.000Z';

function builtIn(
  id: string,
  name: string,
  description: string,
  subject: string,
  body: string,
): WorkspaceEmailTemplate {
  return {
    id,
    name,
    description,
    subject,
    body: body.trim(),
    builtIn: true,
    createdAt: STAMP,
    updatedAt: STAMP,
  };
}

export const BUILT_IN_EMAIL_TEMPLATES: WorkspaceEmailTemplate[] = [
  builtIn(
    'tpl-site-ready',
    'Website is ready',
    'Tell a client their site is ready to review.',
    'Your website is ready, {{name}}',
    `Hi {{first_name}},

Your website is ready to review.

{{site_url}}

{{message}}

If anything should change, just reply to this email.

Best,
{{sender_name}}`,
  ),
  builtIn(
    'tpl-introduction',
    'Introduction',
    'First outreach to a new contact.',
    'Hello {{name}} — a quick introduction',
    `Hi {{first_name}},

I wanted to introduce myself. I help {{company}} with websites and client communication from one workspace.

{{message}}

Would you have time for a short reply this week?

Best,
{{sender_name}}`,
  ),
  builtIn(
    'tpl-follow-up',
    'Follow-up',
    'A polite follow-up after a previous note.',
    'Following up, {{name}}',
    `Hi {{first_name}},

Just following up on my previous note.

{{message}}

Happy to adjust if another time works better.

Best,
{{sender_name}}`,
  ),
  builtIn(
    'tpl-appointment',
    'Appointment',
    'Confirm or propose a meeting.',
    'Meeting with {{name}}',
    `Hi {{first_name}},

{{message}}

Reply with a time that works and I will confirm.

Best,
{{sender_name}}`,
  ),
  builtIn(
    'tpl-project-update',
    'Project update',
    'Send a status update on a site or job.',
    'Update for {{company}}',
    `Hi {{first_name}},

Here is a quick update on the project:

{{message}}

{{site_url}}

Best,
{{sender_name}}`,
  ),
  builtIn(
    'tpl-thank-you',
    'Thank you',
    'A short thank-you after a call or handover.',
    'Thank you, {{name}}',
    `Hi {{first_name}},

Thank you for your time.

{{message}}

Best,
{{sender_name}}`,
  ),
];

export function builtInEmailTemplateIds(): string[] {
  return BUILT_IN_EMAIL_TEMPLATES.map((template) => template.id);
}
