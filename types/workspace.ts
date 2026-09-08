export type PersonKind = 'user' | 'client';
export type EmailStatus = 'draft' | 'sent' | 'failed';
export type MailProvider = 'smtp' | 'resend';

export interface WorkspacePerson {
  id: string;
  kind: PersonKind;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: EmailStatus;
  relatedPersonId?: string;
  templateId?: string;
  templateName?: string;
  from?: string;
  error?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceEmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  builtIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceStore {
  people: WorkspacePerson[];
  emails: WorkspaceEmail[];
  emailTemplates: WorkspaceEmailTemplate[];
}

export interface MailSmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface MailSettings {
  provider: MailProvider;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  smtp: MailSmtpSettings;
  resendApiKey: string;
}

export interface PublicMailSettings {
  configured: boolean;
  provider: MailProvider;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    hasPassword: boolean;
  };
  resend: {
    hasApiKey: boolean;
  };
}
