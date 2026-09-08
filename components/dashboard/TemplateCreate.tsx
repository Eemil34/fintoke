'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import { hostnameFromUrl, parsePublicHttpUrl } from '@/lib/templates';
import type { Project } from '@/types/project';

export default function TemplateCreate() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [cloneUrl, setCloneUrl] = useState('');
  const [cloneName, setCloneName] = useState('');
  const [notes, setNotes] = useState('');
  const [savingSite, setSavingSite] = useState(false);
  const [startingClone, setStartingClone] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchDashboardJson<Project[]>('/api/projects')
      .then(setProjects)
      .catch((err) => {
        setProjects([]);
        setError(err instanceof Error ? err.message : 'Could not load sites');
      })
      .finally(() => setLoadingSites(false));
  }, []);

  const saveFromSite = async () => {
    if (!projectId) return;
    setSavingSite(true);
    setError(null);
    try {
      const template = await fetchDashboardJson<{ id: string }>('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          name: name.trim() || undefined,
        }),
      });
      router.push(`/dashboard/templates/${template.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save template');
      setSavingSite(false);
    }
  };

  const startClone = async () => {
    const url = parsePublicHttpUrl(cloneUrl);
    if (!url) {
      setError('Paste a website URL to clone, like https://example.com');
      return;
    }
    setStartingClone(true);
    setError(null);
    const host = hostnameFromUrl(url);
    const projectIdValue = `project-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const prompt = notes.trim() || `Recreate ${url} as a reusable website template.`;
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectIdValue,
          name: cloneName.trim() || `Clone of ${host}`,
          initialPrompt: prompt,
          cloneUrl: url,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || 'Could not start clone');
      }
      const createdId = payload?.data?.id ?? projectIdValue;
      router.push(`/${createdId}/chat?initial_prompt=${encodeURIComponent(prompt)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start clone');
      setStartingClone(false);
    }
  };

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
        title="New template"
        description="Templates are generated sites you reuse. Ask the agent to build or clone a site, then save it."
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Save a site you already generated</h2>
          <p className="mt-1 text-sm text-gray-600">
            Pick a project the agent has already built. Its files become the next starting template.
          </p>
          {loadingSites ? (
            <p className="mt-4 text-sm text-gray-500">Loading sites…</p>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No sites yet.{' '}
              <Link href="/studio" className="text-[#c95940] hover:underline">
                Generate one first
              </Link>
              .
            </p>
          ) : (
            <>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-gray-600">Site</span>
                <select
                  value={projectId}
                  onChange={(event) => {
                    setProjectId(event.target.value);
                    const project = projects.find((item) => item.id === event.target.value);
                    if (project && !name) setName(project.name);
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                >
                  <option value="">Select a site…</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-gray-600">Template name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  placeholder="Restaurant starter"
                />
              </label>
              <button
                type="button"
                disabled={savingSite || !projectId}
                onClick={() => void saveFromSite()}
                className="mt-4 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {savingSite ? 'Saving…' : 'Save as template'}
              </button>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Clone a website</h2>
          <p className="mt-1 text-sm text-gray-600">
            The agent rebuilds a public site as a new project. When it looks right, save it as a template from the chat.
          </p>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-gray-600">Website URL</span>
            <input
              value={cloneUrl}
              onChange={(event) => setCloneUrl(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="https://example.com"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-gray-600">Name (optional)</span>
            <input
              value={cloneName}
              onChange={(event) => setCloneName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Clone of example.com"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-gray-600">Notes for the agent (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Match the homepage and menu. Keep it as a restaurant starter."
            />
          </label>
          <button
            type="button"
            disabled={startingClone}
            onClick={() => void startClone()}
            className="mt-4 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {startingClone ? 'Starting…' : 'Ask the agent to clone it'}
          </button>
        </section>
      </div>
    </div>
  );
}
