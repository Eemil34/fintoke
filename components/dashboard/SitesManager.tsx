'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson, formatDashboardDate } from '@/lib/dashboard/client';
import { useTemplates } from '@/hooks/useTemplates';
import SaveAsTemplateButton from '@/components/templates/SaveAsTemplateButton';
import type { Project } from '@/types/project';

export default function SitesManager() {
  const { byId } = useTemplates();
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchDashboardJson<Project[]>('/api/projects');
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      const templateName = project.websiteTemplateId
        ? byId.get(project.websiteTemplateId)?.name ?? ''
        : '';
      return [project.name, project.description, templateName, project.id].join(' ').toLowerCase().includes(needle);
    });
  }, [byId, projects, query]);

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete “${project.name}”? This removes the site files and chat history.`)) return;
    setDeletingId(project.id);
    try {
      await fetchDashboardJson(`/api/projects/${project.id}`, { method: 'DELETE' });
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete site');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <DashboardPageHeader
        title="Sites"
        description="Every project this workspace has generated. Open a chat to keep editing, or start a new one from a template."
        actions={
          <Link
            href="/studio"
            className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New site
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sites…"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">No sites yet</p>
          <p className="mt-1 text-sm text-gray-500">Pick a template and describe the site you want.</p>
          <Link
            href="/dashboard/templates"
            className="mt-4 inline-flex rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Browse templates
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="hidden px-4 py-3 md:table-cell">Template</th>
                <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 lg:table-cell">Updated</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const template = project.websiteTemplateId
                  ? byId.get(project.websiteTemplateId) ?? null
                  : null;
                return (
                  <tr key={project.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/${project.id}/chat`} className="font-medium text-gray-900 hover:text-[#c95940]">
                        {project.name}
                      </Link>
                      {project.previewUrl ? (
                        <p className="mt-0.5 truncate text-xs text-gray-500">{project.previewUrl}</p>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{template?.name ?? 'Custom'}</td>
                    <td className="hidden px-4 py-3 capitalize text-gray-600 sm:table-cell">{project.status || 'idle'}</td>
                    <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                      {formatDashboardDate(project.lastActiveAt || project.updatedAt || project.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <SaveAsTemplateButton
                          projectId={project.id}
                          projectName={project.name}
                          compact
                        />
                        {project.previewUrl ? (
                          <a
                            href={project.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Open preview"
                          >
                            <ExternalLink size={15} />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          disabled={deletingId === project.id}
                          onClick={() => void remove(project)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
