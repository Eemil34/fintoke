'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { ManagedTemplate } from '@/lib/templates';

export default function SaveAsTemplateButton({
  projectId,
  projectName,
  compact = false,
}: {
  projectId: string;
  projectName?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(projectName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ManagedTemplate | null>(null);

  const openModal = () => {
    setName(projectName || '');
    setError(null);
    setSaved(null);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const template = await fetchDashboardJson<ManagedTemplate>('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          name: name.trim() || projectName || 'Saved site',
        }),
      });
      setSaved(template);
      window.dispatchEvent(new Event('fintoke-templates-changed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          compact
            ? 'rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            : 'h-9 px-3 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200'
        }
      >
        Save as template
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            {saved ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Saved as a template</h2>
                <p className="mt-2 text-sm text-gray-600">
                  “{saved.name}” is at the top of Templates (look for the Yours badge) and on Studio. It stays on the server volume, so the next deploy will not delete it.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <Link
                    href={`/dashboard/templates/${saved.id}`}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Open template
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Save as template</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Copies this generated site so you can start new projects from it. Ask the agent to finish the site first if it is still empty.
                </p>
                <label className="mt-4 block text-sm">
                  <span className="mb-1 block text-gray-600">Template name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="Bakery starter"
                  />
                </label>
                {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void save()}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save template'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
