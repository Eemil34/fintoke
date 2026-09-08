'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { ManagedTemplate } from '@/lib/templates';
import { TEMPLATE_CATEGORIES } from '@/lib/templates';
import type { Project } from '@/types/project';

export default function TemplateWorkspace({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<ManagedTemplate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ManagedTemplate['category']>('business-professional');
  const [refreshFrom, setRefreshFrom] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [item, siteList] = await Promise.all([
        fetchDashboardJson<ManagedTemplate>(`/api/templates/${templateId}`),
        fetchDashboardJson<Project[]>('/api/projects').catch(() => [] as Project[]),
      ]);
      setTemplate(item);
      setName(item.name);
      setDescription(item.description);
      setCategory(item.category);
      setProjects(siteList);
      setRefreshFrom(item.sourceProjectId || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveMeta = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await fetchDashboardJson<ManagedTemplate>(`/api/templates/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, category }),
      });
      setTemplate(updated);
      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    if (!refreshFrom) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await fetchDashboardJson<ManagedTemplate>(`/api/templates/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify({ projectId: refreshFrom, name, description }),
      });
      setTemplate(updated);
      setMessage('Updated from the selected site.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update from site');
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    setSaving(true);
    setError(null);
    try {
      const created = await fetchDashboardJson<ManagedTemplate>('/api/templates', {
        method: 'POST',
        body: JSON.stringify({ duplicateFrom: templateId }),
      });
      router.push(`/dashboard/templates/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!template) return;
    const label = 'Remove this template from the list?';
    if (!window.confirm(label)) return;
    setSaving(true);
    try {
      await fetchDashboardJson(`/api/templates/${templateId}`, { method: 'DELETE' });
      router.push('/dashboard/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="px-6 py-8 text-sm text-gray-500">Loading template…</div>;
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-red-600">{error || 'Template not found'}</p>
        <Link href="/dashboard/templates" className="mt-4 inline-block text-sm text-gray-600 hover:text-gray-900">
          Back to templates
        </Link>
      </div>
    );
  }

  const snapshot = template.kind === 'snapshot' || template.hasSnapshot;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/dashboard/templates"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={14} />
        Templates
      </Link>

      <DashboardPageHeader
        title={template.name}
        description={
          snapshot
            ? 'This is a saved generated site. New projects copy its files, then the agent rewrites them to match the next brief.'
            : 'Built-in starter. New projects get this layout, then the agent rewrites it to match the brief.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/?template=${encodeURIComponent(template.id)}`}
              className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Use template
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={() => void duplicate()}
              className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Duplicate
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void remove()}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Details</h2>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-gray-600">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ManagedTemplate['category'])}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              {TEMPLATE_CATEGORIES.filter((item) => item.id !== 'all').map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {template.source === 'custom' ? (
            <>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-gray-600">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-gray-600">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-600">{template.description}</p>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveMeta()}
            className="mt-4 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save details'}
          </button>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 text-sm">
          <h2 className="font-semibold text-gray-900">What’s in this template</h2>
          <dl className="mt-3 space-y-2 text-gray-600">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-gray-400">Type</dt>
              <dd>{snapshot ? 'Saved site files' : template.niche}</dd>
            </div>
            {template.sourceUrl ? (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-gray-400">Cloned from</dt>
                <dd>
                  <a href={template.sourceUrl} className="break-all text-[#c95940] hover:underline" target="_blank" rel="noreferrer">
                    {template.sourceUrl}
                  </a>
                </dd>
              </div>
            ) : null}
            {template.sourceProjectId ? (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-gray-400">Saved from</dt>
                <dd>
                  <Link href={`/${template.sourceProjectId}/chat`} className="text-[#c95940] hover:underline">
                    Open original site
                  </Link>
                </dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-gray-400">Files</dt>
              <dd>{template.hasSnapshot ? 'Ready to copy into new sites' : 'Starter layout generated on create'}</dd>
            </div>
          </dl>
        </section>

        {template.source === 'custom' ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Update from a site</h2>
            <p className="mt-1 text-sm text-gray-600">
              Replace the saved files with the current files from a generated site.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <select
                value={refreshFrom}
                onChange={(event) => setRefreshFrom(event.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              >
                <option value="">Select a site…</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={saving || !refreshFrom}
                onClick={() => void refresh()}
                className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Update files
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
