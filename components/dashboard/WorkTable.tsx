'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Download, Mail, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { LeadResponse, WorkspaceLead } from '@/types/leads';

const RESPONSE_OPTIONS: { id: LeadResponse; label: string }[] = [
  { id: 'none', label: '—' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'yes', label: 'Responded' },
  { id: 'no', label: 'No reply' },
];

type FilterId = 'all' | 'noSite' | 'email' | 'noEmail' | 'ready';

function CellInput({
  value,
  onSave,
  placeholder,
  className = '',
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
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
      className={`min-w-[7rem] border-0 bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-white ${className}`}
    />
  );
}

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: 'good' | 'warn' | 'muted' | 'bad';
}) {
  const styles = {
    good: 'bg-emerald-50 text-emerald-800',
    warn: 'bg-amber-50 text-amber-800',
    muted: 'bg-gray-100 text-gray-600',
    bad: 'bg-rose-50 text-rose-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}>{children}</span>
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
  const [filter, setFilter] = useState<FilterId>('noSite');
  const [search, setSearch] = useState('');
  const [find, setFind] = useState({
    query: '',
    kind: 'restaurants',
    country: 'Finland',
    city: '',
    count: 20,
    withoutWebsite: true,
  });

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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'noSite' && row.hasWebsite) return false;
      if (filter === 'email' && !row.email) return false;
      if (filter === 'noEmail' && row.email) return false;
      if (filter === 'ready' && row.researchStatus !== 'ready') return false;
      if (!q) return true;
      return [row.business, row.city, row.email, row.whatTheyDo, row.address].some((value) =>
        value.toLowerCase().includes(q),
      );
    });
  }, [rows, filter, search]);

  const stats = useMemo(() => {
    const noSite = rows.filter((row) => !row.hasWebsite).length;
    const withEmail = rows.filter((row) => row.email).length;
    const ready = rows.filter((row) => row.researchStatus === 'ready').length;
    return { total: rows.length, noSite, withEmail, ready };
  }, [rows]);

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
        body: JSON.stringify({ business: '', hasWebsite: false }),
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
      setMessage('ChatGPT key saved. Research uses live web search.');
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
            withoutWebsite: find.withoutWebsite,
          }),
        },
      );
      setRows((current) => [...result.created, ...current]);
      setSelected(result.created.map((row) => row.id));
      const emails = result.created.filter((row) => row.email).length;
      setMessage(
        `Researched ${result.created.length} business${result.created.length === 1 ? '' : 'es'} without a real website. Found ${emails} published email${emails === 1 ? '' : 's'}${
          result.skipped.length ? `. Skipped ${result.skipped.length}.` : '.'
        }`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not research businesses');
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
        `Deep-researched ${result.filled.length} business${result.filled.length === 1 ? '' : 'es'}${
          failed ? `. ${failed} failed.` : '.'
        }`,
      );
      if (failed) setError(result.errors.map((item) => `${item.business}: ${item.message}`).join(' '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setFilling(false);
    }
  };

  const copyEmails = async () => {
    const emails = [...new Set(visible.map((row) => row.email.trim()).filter(Boolean))];
    if (!emails.length) {
      setError('No emails in the current list.');
      return;
    }
    await navigator.clipboard.writeText(emails.join('\n'));
    setMessage(`Copied ${emails.length} email${emails.length === 1 ? '' : 's'}.`);
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
        ? `Delete all ${count} businesses in Work? This cannot be undone.`
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

  const visibleIds = visible.map((row) => row.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'noSite', label: 'No website' },
    { id: 'email', label: 'Has email' },
    { id: 'noEmail', label: 'Missing email' },
    { id: 'ready', label: 'Researched' },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-8">
      <DashboardPageHeader
        title="Work"
        description="Deep-research local businesses that still have no real website, then collect published emails for outreach."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={filling || selected.length === 0}
              onClick={() => void fillMass(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              <Sparkles size={15} />
              {filling ? 'Researching…' : selected.length ? `Deep research ${selected.length}` : 'Deep research'}
            </button>
            <button
              type="button"
              disabled={filling}
              onClick={() => void fillMass(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              Research incomplete
            </button>
            <button
              type="button"
              onClick={() => void copyEmails()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <Copy size={15} />
              Copy emails
            </button>
            <button
              type="button"
              disabled={deleting || selected.length === 0}
              onClick={() => void removeMany(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              Delete
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/api/workspace/leads?format=csv')}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/api/workspace/leads?format=emails')}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Mail size={15} />
              Email list
            </button>
            <button
              type="button"
              onClick={() => void addRow()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'In pipeline', value: stats.total },
          { label: 'No website', value: stats.noSite },
          { label: 'Published emails', value: stats.withEmail },
          { label: 'Research ready', value: stats.ready },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-gray-900 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900">Find businesses without a website</p>
        <p className="mt-1 text-sm text-gray-600">
          ChatGPT searches Google, Maps, Facebook, Instagram, Finder and Fonecta. Facebook or Wolt pages do not count as
          a website. Emails are copied only when they are published.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="text-sm sm:col-span-2 lg:col-span-2">
            <span className="mb-1 block text-gray-600">What to find</span>
            <input
              value={find.query}
              onChange={(event) => setFind({ ...find, query: event.target.value })}
              placeholder="neighborhood bakeries, lunch restaurants…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Type</span>
            <input
              value={find.kind}
              onChange={(event) => setFind({ ...find, kind: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Country</span>
            <input
              value={find.country}
              onChange={(event) => setFind({ ...find, country: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">City</span>
            <input
              value={find.city}
              onChange={(event) => setFind({ ...find, city: event.target.value })}
              placeholder="Helsinki"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">How many</span>
            <input
              type="number"
              min={1}
              max={40}
              value={find.count}
              onChange={(event) => setFind({ ...find, count: Number(event.target.value) || 20 })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={find.withoutWebsite}
              onChange={(event) => setFind({ ...find, withoutWebsite: event.target.checked })}
            />
            Only businesses with no official website
          </label>
          <button
            type="button"
            disabled={generating || filling}
            onClick={() => void generate()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Search size={15} />
            {generating ? 'Researching the web…' : `Research ${find.count || 20} businesses`}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-900">ChatGPT web search</p>
        <p className="mt-1 text-sm text-gray-600">
          {hasOpenaiKey
            ? 'A key is saved. Finding and filling rows uses live search, then a second pass for published emails.'
            : 'Paste an OpenAI API key (sk-…) so Work can search the public web.'}
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
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === item.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter this list…"
          className="ml-auto min-w-[12rem] flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gray-400 sm:max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[1280px] w-full border-collapse text-left">
            <thead className="sticky top-0 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="border-b border-gray-200 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : visibleIds)}
                    aria-label="Select all visible"
                  />
                </th>
                {['Business', 'City', 'What they do', 'Email', 'Phone', 'Website', 'Research', 'Reply', ''].map(
                  (label) => (
                    <th key={label || 'actions'} className="whitespace-nowrap border-b border-gray-200 px-2 py-2">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500">
                    Research a city and type above. Work keeps businesses without a real website and lists published
                    emails.
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
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
                      <CellInput
                        value={row.business}
                        placeholder="Name"
                        onSave={(business) => void patch(row.id, { business })}
                      />
                    </td>
                    <td className="p-0">
                      <CellInput value={row.city} placeholder="City" onSave={(city) => void patch(row.id, { city })} />
                    </td>
                    <td className="p-0">
                      <CellInput
                        value={row.whatTheyDo}
                        placeholder="Kitchen, salon…"
                        onSave={(whatTheyDo) => void patch(row.id, { whatTheyDo })}
                      />
                    </td>
                    <td className="p-0">
                      <div className="px-2 py-1">
                        <CellInput
                          value={row.email}
                          placeholder="no public email yet"
                          className="font-medium text-gray-900"
                          onSave={(email) => void patch(row.id, { email })}
                        />
                        {row.emailSource ? (
                          <p className="px-2 pb-1 text-[11px] text-gray-400">{row.emailSource}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-0">
                      <CellInput
                        value={row.phone}
                        placeholder="phone"
                        onSave={(phone) => void patch(row.id, { phone })}
                      />
                    </td>
                    <td className="px-2 py-1">
                      {row.hasWebsite ? (
                        <Badge tone="bad">Has site</Badge>
                      ) : (
                        <Badge tone="good">No website</Badge>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {row.researchStatus === 'ready' ? (
                        <Badge tone="good">Ready</Badge>
                      ) : row.researchStatus === 'partial' ? (
                        <Badge tone="warn">Partial</Badge>
                      ) : (
                        <Badge tone="muted">New</Badge>
                      )}
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
                    <td className="whitespace-nowrap px-2 py-1">
                      <Link
                        href={`/dashboard/work/${row.id}`}
                        className="mr-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100"
                      >
                        Dossier
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
