'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson, formatDashboardDay } from '@/lib/dashboard/client';
import type { PersonKind, WorkspacePerson } from '@/types/workspace';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  role: '',
  notes: '',
};

export default function PeopleManager({
  kind,
  title,
  description,
}: {
  kind: PersonKind;
  title: string;
  description: string;
}) {
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspacePerson | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const noun = kind === 'user' ? 'user' : 'client';

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchDashboardJson<WorkspacePerson[]>(`/api/workspace/people?kind=${kind}`);
      setPeople(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      [person.name, person.email, person.phone, person.company, person.role, person.notes]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [people, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (person: WorkspacePerson) => {
    setEditing(person);
    setForm({
      name: person.name,
      email: person.email,
      phone: person.phone || '',
      company: person.company,
      role: person.role,
      notes: person.notes,
    });
    setFormOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await fetchDashboardJson(`/api/workspace/people/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await fetchDashboardJson('/api/workspace/people', {
          method: 'POST',
          body: JSON.stringify({ ...form, kind }),
        });
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (person: WorkspacePerson) => {
    if (!window.confirm(`Delete ${person.name}? This cannot be undone.`)) return;
    try {
      await fetchDashboardJson(`/api/workspace/people/${person.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <DashboardPageHeader
        title={title}
        description={description}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            Add {noun}
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
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
          <p className="text-sm font-medium text-gray-900">No {title.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Keep {kind === 'user' ? 'teammates and logins' : 'client contacts'} in one place next to your sites.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            Add {noun}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                <th className="hidden px-4 py-3 md:table-cell">Phone</th>
                <th className="hidden px-4 py-3 lg:table-cell">{kind === 'client' ? 'Company' : 'Role'}</th>
                <th className="hidden px-4 py-3 xl:table-cell">Updated</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr key={person.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{person.email || person.phone || 'No contact'}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">{person.email || '—'}</td>
                  <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{person.phone || '—'}</td>
                  <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                    {kind === 'client' ? person.company || '—' : person.role || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 xl:table-cell">{formatDashboardDay(person.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(person)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Edit ${person.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(person)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${person.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? `Edit ${noun}` : `Add ${noun}`}
              </h2>
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
                <span className="mb-1 block text-gray-600">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+358…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">{kind === 'client' ? 'Company' : 'Role'}</span>
                  <input
                    value={kind === 'client' ? form.company : form.role}
                    onChange={(event) =>
                      setForm((current) =>
                        kind === 'client'
                          ? { ...current, company: event.target.value }
                          : { ...current, role: event.target.value },
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">{kind === 'client' ? 'Role' : 'Company'}</span>
                  <input
                    value={kind === 'client' ? form.role : form.company}
                    onChange={(event) =>
                      setForm((current) =>
                        kind === 'client'
                          ? { ...current, role: event.target.value }
                          : { ...current, company: event.target.value },
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !form.name.trim()}
                onClick={() => void save()}
                className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
