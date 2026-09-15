'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pause, Play, Repeat, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson, formatDashboardDate } from '@/lib/dashboard/client';
import type { AutomationKind, WorkspaceAutomation } from '@/types/automations';

function toLocalInput(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

const EMPTY_FORM = {
  name: '',
  kind: 'generate_work' as AutomationKind,
  prompt: '',
  count: 10,
  city: '',
  country: '',
  businessKind: 'local businesses',
  repeatTotal: 3,
  intervalMinutes: 60,
  windowStart: '',
  windowEnd: '',
};

export default function AutomationsManager() {
  const [jobs, setJobs] = useState<WorkspaceAutomation[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [rows, settings] = await Promise.all([
        fetchDashboardJson<WorkspaceAutomation[]>('/api/workspace/automations'),
        fetchDashboardJson<{ hasOpenaiKey: boolean }>('/api/workspace/leads/ai'),
      ]);
      setJobs(rows);
      setHasKey(settings.hasOpenaiKey);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const defaultsReady = useMemo(() => {
    if (form.windowStart && form.windowEnd) return form;
    const start = new Date();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return {
      ...form,
      windowStart: form.windowStart || toLocalInput(start.toISOString()),
      windowEnd: form.windowEnd || toLocalInput(end.toISOString()),
    };
  }, [form]);

  const saveKey = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const next = await fetchDashboardJson<{ hasOpenaiKey: boolean }>('/api/workspace/leads/ai', {
        method: 'PUT',
        body: JSON.stringify({ openaiApiKey: openaiKey }),
      });
      setHasKey(next.hasOpenaiKey);
      setOpenaiKey('');
      setMessage('OpenAI API key saved. This is not a Google or ChatGPT.com login.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      await fetchDashboardJson('/api/workspace/automations', {
        method: 'POST',
        body: JSON.stringify({
          ...defaultsReady,
          windowStart: fromLocalInput(defaultsReady.windowStart),
          windowEnd: fromLocalInput(defaultsReady.windowEnd),
        }),
      });
      setForm(EMPTY_FORM);
      setMessage('Automation scheduled. Keep this tab or the app online so runs can fire.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation');
    } finally {
      setSaving(false);
    }
  };

  const act = async (id: string, action: 'pause' | 'resume' | 'run') => {
    setError(null);
    try {
      await fetchDashboardJson(`/api/workspace/automations/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automation');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    await fetchDashboardJson(`/api/workspace/automations/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="p-6">
      <DashboardPageHeader
        title="Automations"
        description="Ask ChatGPT (OpenAI API) to add or fill work-table rows on a schedule. This does not log into ChatGPT.com or rotate Google accounts."
      />

      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
      {message ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900">OpenAI API key</p>
        <p className="mt-1 text-xs text-gray-500">
          Paste an <span className="font-medium">sk-…</span> key from platform.openai.com. If a job hits a quota
          limit it pauses so you can paste a new key and resume. Google ChatGPT logins are not supported.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={openaiKey}
            onChange={(event) => setOpenaiKey(event.target.value)}
            placeholder={hasKey ? 'Key saved — paste another to replace it' : 'sk-...'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void saveKey()}
            disabled={saving || !openaiKey.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save key
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-900">New scheduled task</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-gray-700">
            Name
            <input
              value={defaultsReady.name}
              onChange={(event) => setForm({ ...defaultsReady, name: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Tampere cafes"
            />
          </label>
          <label className="text-sm text-gray-700">
            Task
            <select
              value={defaultsReady.kind}
              onChange={(event) => setForm({ ...defaultsReady, kind: event.target.value as AutomationKind })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="generate_work">Add businesses to the work table</option>
              <option value="enrich_empty">Fill empty work-table rows</option>
            </select>
          </label>
        </div>
        {defaultsReady.kind === 'generate_work' ? (
          <>
            <label className="block text-sm text-gray-700">
              What should ChatGPT find
              <textarea
                value={defaultsReady.prompt}
                onChange={(event) => setForm({ ...defaultsReady, prompt: event.target.value })}
                className="mt-1 h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="20 independent cafes in Tampere with public email or phone"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-sm text-gray-700">
                Count each run
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={defaultsReady.count}
                  onChange={(event) => setForm({ ...defaultsReady, count: Number(event.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-gray-700">
                Type
                <input
                  value={defaultsReady.businessKind}
                  onChange={(event) => setForm({ ...defaultsReady, businessKind: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-gray-700">
                City
                <input
                  value={defaultsReady.city}
                  onChange={(event) => setForm({ ...defaultsReady, city: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-gray-700">
                Country
                <input
                  value={defaultsReady.country}
                  onChange={(event) => setForm({ ...defaultsReady, country: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-sm text-gray-700">
            How many times
            <input
              type="number"
              min={1}
              max={50}
              value={defaultsReady.repeatTotal}
              onChange={(event) => setForm({ ...defaultsReady, repeatTotal: Number(event.target.value) })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-gray-700">
            Minutes between runs
            <input
              type="number"
              min={1}
              max={1440}
              value={defaultsReady.intervalMinutes}
              onChange={(event) => setForm({ ...defaultsReady, intervalMinutes: Number(event.target.value) })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-gray-700">
            Start
            <input
              type="datetime-local"
              value={defaultsReady.windowStart}
              onChange={(event) => setForm({ ...defaultsReady, windowStart: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-gray-700">
            End
            <input
              type="datetime-local"
              value={defaultsReady.windowEnd}
              onChange={(event) => setForm({ ...defaultsReady, windowEnd: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={saving || !hasKey}
          className="rounded-lg bg-[#DE7356] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Schedule ChatGPT task'}
        </button>
        {!hasKey ? <p className="text-xs text-amber-800">Save an OpenAI API key first.</p> : null}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : null}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {job.kind === 'generate_work' ? job.prompt : 'Fill empty work-table rows'} · {job.runCount}/
                  {job.repeatTotal} runs · {job.status}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Window {formatDashboardDate(job.windowStart)} → {formatDashboardDate(job.windowEnd)}
                  {job.nextRunAt ? ` · next ${formatDashboardDate(job.nextRunAt)}` : ''}
                </p>
                {job.lastError ? <p className="mt-2 text-xs text-red-700">{job.lastError}</p> : null}
                {job.runs[0] ? (
                  <p className="mt-2 text-xs text-gray-600">{job.runs[0].summary}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void act(job.id, 'run')}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium"
                >
                  <Repeat size={14} /> Run now
                </button>
                {job.status === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => void act(job.id, 'resume')}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium"
                  >
                    <Play size={14} /> Resume
                  </button>
                ) : job.status === 'scheduled' || job.status === 'running' ? (
                  <button
                    type="button"
                    onClick={() => void act(job.id, 'pause')}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium"
                  >
                    <Pause size={14} /> Pause
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void remove(job.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-700"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && jobs.length === 0 ? (
          <p className="text-sm text-gray-500">No automations yet. Schedule a ChatGPT task above.</p>
        ) : null}
      </div>
    </div>
  );
}
