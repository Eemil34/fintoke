'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, Plus, Search, Send, Trash2, X } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import MailSettingsPanel from '@/components/dashboard/MailSettingsPanel';
import { fetchDashboardJson, formatDashboardDate } from '@/lib/dashboard/client';
import type { PublicMailSettings, WorkspaceEmail, WorkspaceEmailTemplate, WorkspacePerson } from '@/types/workspace';

const EMPTY_FORM = {
  templateId: '',
  relatedPersonId: '',
  to: '',
  subject: '',
  body: '',
  message: '',
  site_url: '',
};

type Tab = 'messages' | 'templates' | 'sending';

export default function EmailsManager() {
  const [tab, setTab] = useState<Tab>('messages');
  const [emails, setEmails] = useState<WorkspaceEmail[]>([]);
  const [templates, setTemplates] = useState<WorkspaceEmailTemplate[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [configured, setConfigured] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [templateForm, setTemplateForm] = useState({ id: '', name: '', description: '', subject: '', body: '' });
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [emailRows, personRows, templateRows, mail] = await Promise.all([
        fetchDashboardJson<WorkspaceEmail[]>('/api/workspace/emails'),
        fetchDashboardJson<WorkspacePerson[]>('/api/workspace/people'),
        fetchDashboardJson<WorkspaceEmailTemplate[]>('/api/workspace/email-templates'),
        fetchDashboardJson<PublicMailSettings>('/api/workspace/mail'),
      ]);
      setEmails(emailRows);
      setPeople(personRows);
      setTemplates(templateRows);
      setConfigured(mail.configured);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return emails;
    return emails.filter((email) =>
      [email.to, email.subject, email.body, email.templateName].join(' ').toLowerCase().includes(needle),
    );
  }, [emails, query]);

  const applyTemplate = (templateId: string, current = form) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return { ...current, templateId };
    }
    return {
      ...current,
      templateId,
      subject: template.subject,
      body: template.body,
    };
  };

  const openCompose = (templateId = '') => {
    setForm(applyTemplate(templateId, { ...EMPTY_FORM, templateId }));
    setFormOpen(true);
    setTab('messages');
  };

  const send = async (deliver: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await fetchDashboardJson('/api/workspace/emails/send', {
        method: 'POST',
        body: JSON.stringify({
          to: form.to,
          personId: form.relatedPersonId || undefined,
          templateId: form.templateId || undefined,
          subject: form.subject,
          body: form.body,
          message: form.message,
          variables: { site_url: form.site_url, message: form.message },
          send: deliver,
        }),
      });
      setFormOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSaving(false);
    }
  };

  const resend = async (email: WorkspaceEmail) => {
    try {
      await fetchDashboardJson('/api/workspace/emails/send', {
        method: 'POST',
        body: JSON.stringify({ id: email.id }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    }
  };

  const remove = async (email: WorkspaceEmail) => {
    if (!window.confirm(`Delete “${email.subject}”?`)) return;
    try {
      await fetchDashboardJson(`/api/workspace/emails/${email.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email');
    }
  };

  const saveTemplate = async () => {
    setTemplateSaving(true);
    setError(null);
    try {
      if (templateForm.id) {
        await fetchDashboardJson(`/api/workspace/email-templates/${templateForm.id}`, {
          method: 'PATCH',
          body: JSON.stringify(templateForm),
        });
      } else {
        await fetchDashboardJson('/api/workspace/email-templates', {
          method: 'POST',
          body: JSON.stringify(templateForm),
        });
      }
      setTemplateOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const removeTemplate = async (template: WorkspaceEmailTemplate) => {
    if (template.builtIn) return;
    if (!window.confirm(`Delete “${template.name}”?`)) return;
    try {
      await fetchDashboardJson(`/api/workspace/email-templates/${template.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <DashboardPageHeader
        title="Emails"
        description="Write from a saved template and send through SMTP or Resend. Claude can do the same from chat."
        actions={
          <button
            type="button"
            onClick={() => openCompose(templates[0]?.id || '')}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            Compose
          </button>
        }
      />

      {!configured ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sending is not connected yet. Open the Sending tab and add Gmail SMTP or a Resend key, or Claude can only save drafts.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['messages', 'Messages'],
            ['templates', 'Templates'],
            ['sending', 'Sending'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
              tab === id ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {tab === 'sending' ? <MailSettingsPanel onStatus={setConfigured} /> : null}

      {tab === 'templates' ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setTemplateForm({ id: '', name: '', description: '', subject: '', body: '' });
                setTemplateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={16} />
              New template
            </button>
          </div>
          {templates.map((template) => (
            <article key={template.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    {template.builtIn ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">Built-in</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-500">{template.description || template.subject}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openCompose(template.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateForm({
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        subject: template.subject,
                        body: template.body,
                      });
                      setTemplateOpen(true);
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  {!template.builtIn ? (
                    <button
                      type="button"
                      onClick={() => void removeTemplate(template)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete template"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === 'messages' ? (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search emails…"
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <Mail className="mx-auto mb-3 text-gray-300" size={28} />
              <p className="text-sm font-medium text-gray-900">No emails yet</p>
              <p className="mt-1 text-sm text-gray-500">Compose from a template, then send it for real.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((email) => (
                <article key={email.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            email.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700'
                              : email.status === 'failed'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {email.status === 'sent' ? 'Sent' : email.status === 'failed' ? 'Failed' : 'Draft'}
                        </span>
                        <p className="truncate text-sm font-medium text-gray-900">{email.subject}</p>
                      </div>
                      <p className="text-sm text-gray-500">To {email.to}</p>
                      {email.templateName ? (
                        <p className="mt-1 text-xs text-gray-400">Template · {email.templateName}</p>
                      ) : null}
                      {email.body ? <p className="mt-2 line-clamp-2 text-sm text-gray-600">{email.body}</p> : null}
                      {email.error ? <p className="mt-2 text-xs text-red-600">{email.error}</p> : null}
                      <p className="mt-2 text-xs text-gray-400">{formatDashboardDate(email.sentAt || email.updatedAt)}</p>
                    </div>
                    <div className="flex gap-1">
                      {email.status !== 'sent' ? (
                        <button
                          type="button"
                          onClick={() => void resend(email)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Send size={14} />
                          Send
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void remove(email)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete email"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Compose from template</h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Template</span>
                <select
                  value={form.templateId}
                  onChange={(event) => setForm((current) => applyTemplate(event.target.value, current))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                >
                  <option value="">No template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              {people.length > 0 ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">Fill from contact</span>
                  <select
                    value={form.relatedPersonId}
                    onChange={(event) => {
                      const person = people.find((item) => item.id === event.target.value);
                      setForm((current) => ({
                        ...current,
                        relatedPersonId: event.target.value,
                        to: person?.email || current.to,
                      }));
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">Select a user or client</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                        {person.email ? ` · ${person.email}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">To</span>
                <input
                  type="email"
                  value={form.to}
                  onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Subject</span>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">{'{{message}} note (optional)'}</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">{'{{site_url}} (optional)'}</span>
                <input
                  value={form.site_url}
                  onChange={(event) => setForm((current) => ({ ...current, site_url: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Body</span>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  rows={7}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving || !form.to.trim() || !form.subject.trim()}
                onClick={() => void send(false)}
                className="rounded-xl px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={saving || !form.to.trim() || !form.subject.trim()}
                onClick={() => void send(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Send size={14} />
                {configured ? 'Send email' : 'Send (needs setup)'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {templateOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {templateForm.id ? 'Edit template' : 'New template'}
              </h2>
              <button
                type="button"
                onClick={() => setTemplateOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Name</span>
                <input
                  value={templateForm.name}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Description</span>
                <input
                  value={templateForm.description}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Subject</span>
                <input
                  value={templateForm.subject}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, subject: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Body — use {'{{name}}'}, {'{{first_name}}'}, {'{{message}}'}, {'{{site_url}}'}</span>
                <textarea
                  value={templateForm.body}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, body: event.target.value }))}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={templateSaving || !templateForm.name.trim() || !templateForm.subject.trim()}
                onClick={() => void saveTemplate()}
                className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {templateSaving ? 'Saving…' : 'Save template'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
