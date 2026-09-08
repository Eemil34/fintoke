'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import { useTemplates } from '@/hooks/useTemplates';
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategoryId,
} from '@/lib/templates';

export default function TemplatesBrowser() {
  const { templates, loading, error, reload } = useTemplates();
  const [category, setCategory] = useState<TemplateCategoryId | 'all'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      category === 'all'
        ? templates
        : templates.filter((template) => template.category === category),
    [category, templates],
  );

  const customCount = templates.filter((template) => template.source === 'custom' || template.kind === 'snapshot').length;

  const setCategoryFor = async (id: string, next: TemplateCategoryId) => {
    setBusyId(id);
    try {
      await fetchDashboardJson(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ category: next }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Remove “${name}” from templates?`)) return;
    setBusyId(id);
    try {
      await fetchDashboardJson(`/api/templates/${id}`, { method: 'DELETE' });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <DashboardPageHeader
        title="Templates"
        description="Saved generated sites you can start from again, plus built-in starters. Assign a category, or delete ones you do not use."
        actions={
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            New template
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              category === item.id
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {item.label}
            {item.id === 'all' && customCount > 0 ? ` · ${customCount} custom` : ''}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <article
            key={template.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <Link href={`/dashboard/templates/${template.id}`} className="block">
              <div className="relative h-28 p-4" style={{ background: template.theme.background }}>
                <div
                  className="absolute inset-x-6 top-5 h-3 rounded-full opacity-90"
                  style={{ background: template.theme.primary }}
                />
                <div
                  className="absolute bottom-5 left-5 right-10 h-12 rounded-lg px-3 py-2"
                  style={{
                    background: template.theme.surface,
                    border: `1px solid ${template.theme.primary}33`,
                    color: template.theme.text,
                  }}
                >
                  <p className="truncate text-[11px] font-medium">{template.brand.name}</p>
                  <p className="truncate text-[10px] opacity-70">{template.hero.title}</p>
                </div>
                {template.source === 'custom' || template.overridden || template.kind === 'snapshot' ? (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                    {template.kind === 'snapshot' || template.hasSnapshot
                      ? 'Saved site'
                      : template.source === 'custom'
                        ? 'Custom'
                        : 'Edited'}
                  </span>
                ) : null}
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/dashboard/templates/${template.id}`} className="text-sm font-semibold text-gray-900 hover:text-[#c95940]">
                {template.name}
              </Link>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{template.niche}</p>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{template.description}</p>
              <label className="mt-3 block text-xs text-gray-500">
                Category
                <select
                  value={template.category}
                  disabled={busyId === template.id}
                  onChange={(event) => void setCategoryFor(template.id, event.target.value as TemplateCategoryId)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                >
                  {TEMPLATE_CATEGORIES.filter((item) => item.id !== 'all').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/templates/${template.id}`}
                  className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  Open
                </Link>
                <Link
                  href={`/?template=${encodeURIComponent(template.id)}`}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Use
                </Link>
                <button
                  type="button"
                  disabled={busyId === template.id}
                  onClick={() => void remove(template.id, template.name)}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
