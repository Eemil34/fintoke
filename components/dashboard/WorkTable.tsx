'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Download, Plus, Sparkles, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { LeadResponse, WorkspaceLead } from '@/types/leads';

const RESPONSE_OPTIONS: { id: LeadResponse; label: string }[] = [
  { id: 'none', label: '—' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'yes', label: 'Responded' },
  { id: 'no', label: 'No reply' },
];

function CellInput({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
      className="min-w-[8rem] border-0 bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-white"
    />
  );
}

export default function WorkTable() {
  const [rows, setRows] = useState<WorkspaceLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [find, setFind] = useState({ query: '', kind: 'restaurants', country: 'Finland', city: '', count: 20 });

  const load = useCallback(async () => {
    try {
      const [data, ai] = await Promise.all([
        fetchDashboardJson<WorkspaceLead[]>('/api/workspace/leads'),
        fetchDashboardJson<{ hasOpenaiKey: boolean }>('/api/workspace/leads/ai'),
      ]);
      setRows(data);
      setHasOpenaiKey(ai.hasOpenaiKey);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    const next = await fetchDashboardJson<WorkspaceLead>(`/api/workspace/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    setRows((current) => current.map((row) => (row.id === id ? next : row)));
    return next;
  };

  const addRow = async () => {
    setError(null);
    try {
      const row = await fetchDashboardJson<WorkspaceLead>('/api/workspace/leads', {
        method: 'POST',
        body: JSON.stringify({ business: '' }),
      });
      setRows((current) => [row, ...current]);
      setSelected((current) => [row.id, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add row');
    }
  };

  const saveKey = async () => {
    setError(null);
    try {
      const next = await fetchDashboardJson<{ hasOpenaiKey: boolean }>('/api/workspace/leads/ai', {
        method: 'PUT',
        body: JSON.stringify({ openaiApiKey: openaiKey }),
      });
      setHasOpenaiKey(next.hasOpenaiKey);
      setOpenaiKey('');
      setMessage('ChatGPT key saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save key');
    }
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const result = await fetchDashboardJson<{ created: WorkspaceLead[]; skipped: string[] }>(
        '/api/workspace/leads/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            query: find.query,
            kind: find.kind,
            country: find.country,
            city: find.city,
            count: Number(find.count) || 20,
          }),
        },
      );
      setRows((current) => [...result.created, ...current]);
      setSelected(result.created.map((row) => row.id));
      setMessage(
        `Added ${result.created.length} business${result.created.length === 1 ? '' : 'es'}${
          result.skipped.length ? `. Skipped ${result.skipped.length} already in the table.` : '.'
        } Emails and phones are copied from the site or listings when they are public.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add businesses');
    } finally {
      setGenerating(false);
    }
  };

  const fillMass = async (emptyOnly = false) => {
    setFilling(true);
    setError(null);
    setMessage(null);
    try {
      const result = await fetchDashboardJson<{
        filled: WorkspaceLead[];
        errors: { id: string; business: string; message: string }[];
      }>('/api/workspace/leads/enrich', {
        method: 'POST',
        body: JSON.stringify(emptyOnly ? { emptyOnly: true } : { ids: selected }),
      });
      const byId = new Map(result.filled.map((row) => [row.id, row]));
      setRows((current) => current.map((row) => byId.get(row.id) || row));
      const failed = result.errors.length;
      setMessage(
        `Filled ${result.filled.length} business${result.filled.length === 1 ? '' : 'es'}${
          failed ? `. ${failed} failed.` : '.'
        }`,
      );
      if (failed) setError(result.errors.map((item) => `${item.business}: ${item.message}`).join(' '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fill failed');
    } finally {
      setFilling(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this business?')) return;
    await fetchDashboardJson(`/api/workspace/leads/${id}`, { method: 'DELETE' });
    setRows((current) => current.filter((row) => row.id !== id));
    setSelected((current) => current.filter((item) => item !== id));
  };

  const removeMany = async (all = false) => {
    const count = all ? rows.length : selected.length;
    if (!count) return;
    const ok = window.confirm(
      all
        ? `Delete all ${count} businesses in the work table? This cannot be undone.`
        : `Delete ${count} selected business${count === 1 ? '' : 'es'}?`,
    );
    if (!ok) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await fetchDashboardJson<{ removed: number }>('/api/workspace/leads', {
        method: 'DELETE',
        body: JSON.stringify(all ? { all: true } : { ids: selected }),
      });
      if (all) {
        setRows([]);
        setSelected([]);
      } else {
        const gone = new Set(selected);
        setRows((current) => current.filter((row) => !gone.has(row.id)));
        setSelected([]);
      }
      setMessage(`Deleted ${result.removed} business${result.removed === 1 ? '' : 'es'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setDeleting(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const allIds = rows.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <DashboardPageHeader
        title="Work"
        description="Ask ChatGPT to add a batch of businesses, then open any row for the full record."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={filling || selected.length === 0}
              onClick={() => void fillMass(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              <Sparkles size={15} />
              {filling ? 'Filling…' : selected.length ? `Fill ${selected.length} with ChatGPT` : 'Fill selected'}
            </button>
            <button
              type="button"
              disabled={filling}
              onClick={() => void fillMass(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              Fill empty rows
            </button>
            <button
              type="button"
              disabled={deleting || selected.length === 0}
              onClick={() => void removeMany(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              {selected.length ? `Delete ${selected.length}` : 'Delete selected'}
            </button>
            <button
              type="button"
              disabled={deleting || rows.length === 0}
              onClick={() => void removeMany(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              Delete all
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.assign('/api/workspace/leads?format=csv');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={15} />
              Excel / CSV
            </button>
            <button
              type="button"
              onClick={() => void addRow()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus size={16} />
              Add business
            </button>
          </div>
        }
      />

      <div className="mb-4 rounded-2xl border border-gray-900 bg-white p-4">
        <p className="text-sm font-semibold text-gray-900">Ask ChatGPT to add businesses</p>
        <p className="mt-1 text-sm text-gray-600">
          Example: 20 restaurants in Finland. ChatGPT searches the web, opens the official site and contact page, and
          fills email and phone when they are published. If a venue only has a form, those fields stay empty.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm sm:col-span-2 lg:col-span-2">
            <span className="mb-1 block text-gray-600">What to find</span>
            <input
              value={find.query}
              onChange={(event) => setFind({ ...find, query: event.target.value })}
              placeholder="bakeries, gyms, hair salons…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Type</span>
            <input
              value={find.kind}
              onChange={(event) => setFind({ ...find, kind: event.target.value })}
              placeholder="restaurants"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Country</span>
            <input
              value={find.country}
              onChange={(event) => setFind({ ...find, country: event.target.value })}
              placeholder="Finland"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">City (optional)</span>
            <input
              value={find.city}
              onChange={(event) => setFind({ ...find, city: event.target.value })}
              placeholder="Helsinki"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">How many</span>
            <input
              type="number"
              min={1}
              max={40}
              value={find.count}
              onChange={(event) => setFind({ ...find, count: Number(event.target.value) || 20 })}
              className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <button
            type="button"
            disabled={generating || filling}
            onClick={() => void generate()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Sparkles size={15} />
            {generating ? 'Asking ChatGPT…' : `Add ${find.count || 20} with ChatGPT`}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-900">ChatGPT</p>
        <p className="mt-1 text-sm text-gray-600">
          {hasOpenaiKey
            ? 'A ChatGPT key is saved. Adding and filling businesses uses web search, then checks the official site.'
            : 'Paste an OpenAI API key (sk-…) so ChatGPT can search for businesses and fill facts.'}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={openaiKey}
            onChange={(event) => setOpenaiKey(event.target.value)}
            placeholder={hasOpenaiKey ? 'Saved — paste a new key to replace' : 'sk-…'}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            type="button"
            onClick={() => void saveKey()}
            className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Save key
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[1100px] w-full border-collapse text-left">
            <thead className="sticky top-0 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="border-b border-gray-200 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : allIds)}
                    aria-label="Select all"
                  />
                </th>
                {['Business', 'What they do', 'Email', 'Website', 'Offer', 'Reply', 'Called', 'Vercel', ''].map(
                  (label) => (
                    <th key={label || 'actions'} className="whitespace-nowrap border-b border-gray-200 px-2 py-2">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500">
                    Add businesses, tick the ones you want, then Fill with ChatGPT.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select ${row.business || 'row'}`}
                      />
                    </td>
                    <td className="p-0">
                      <CellInput value={row.business} placeholder="Name" onSave={(business) => void patch(row.id, { business })} />
                    </td>
                    <td className="p-0">
                      <CellInput
                        value={row.whatTheyDo}
                        placeholder="Restaurant, gym…"
                        onSave={(whatTheyDo) => void patch(row.id, { whatTheyDo })}
                      />
                    </td>
                    <td className="p-0">
                      <CellInput value={row.email} placeholder="email" onSave={(email) => void patch(row.id, { email })} />
                    </td>
                    <td className="p-0">
                      <CellInput
                        value={row.website}
                        placeholder="none / url"
                        onSave={(website) => void patch(row.id, { website, hasWebsite: Boolean(website.trim()) })}
                      />
                    </td>
                    <td className="px-2">
                      <input
                        type="checkbox"
                        checked={row.offerSent}
                        onChange={(event) => void patch(row.id, { offerSent: event.target.checked })}
                      />
                    </td>
                    <td className="p-0">
                      <select
                        value={row.responded}
                        onChange={(event) => void patch(row.id, { responded: event.target.value })}
                        className="w-full border-0 bg-transparent px-1 py-1.5 text-sm outline-none"
                      >
                        {RESPONSE_OPTIONS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2">
                      <input
                        type="checkbox"
                        checked={row.called}
                        onChange={(event) => void patch(row.id, { called: event.target.checked })}
                      />
                    </td>
                    <td className="p-0">
                      <CellInput
                        value={row.vercelUrl}
                        placeholder="https://…"
                        onSave={(vercelUrl) => void patch(row.id, { vercelUrl })}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-1">
                      <Link
                        href={`/dashboard/work/${row.id}`}
                        className="mr-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => void remove(row.id)}
                        className="inline-flex rounded-lg p-1 text-red-600 hover:bg-red-50"
                        aria-label="Delete row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
