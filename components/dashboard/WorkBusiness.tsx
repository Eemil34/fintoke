'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Globe, Sparkles, Trash2 } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { LeadResponse, WorkspaceLead } from '@/types/leads';

const RESPONSE_OPTIONS: { id: LeadResponse; label: string }[] = [
  { id: 'none', label: 'No response yet' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'yes', label: 'Responded' },
  { id: 'no', label: 'Did not reply' },
];

export default function WorkBusiness() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id || '';
  const [lead, setLead] = useState<WorkspaceLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const row = await fetchDashboardJson<WorkspaceLead>(`/api/workspace/leads/${id}`);
      setLead(row);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (patch: Partial<WorkspaceLead>) => {
    if (!lead || busy.current) return;
    const next = { ...lead, ...patch };
    setLead(next);
    try {
      const saved = await fetchDashboardJson<WorkspaceLead>(`/api/workspace/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setLead(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const analyze = async () => {
    busy.current = true;
    setAnalyzing(true);
    setError(null);
    try {
      const next = await fetchDashboardJson<WorkspaceLead>(`/api/workspace/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'analyze' }),
      });
      setLead(next);
      setMessage('AI fetched the website and wrote look, state, and recommended work.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyze failed');
    } finally {
      busy.current = false;
      setAnalyzing(false);
    }
  };

  const fill = async () => {
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const next = await fetchDashboardJson<WorkspaceLead>(`/api/workspace/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'enrich' }),
      });
      setLead(next);
      setMessage('ChatGPT filled the business facts.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fill failed');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this business?')) return;
    await fetchDashboardJson(`/api/workspace/leads/${id}`, { method: 'DELETE' });
    router.push('/dashboard/work');
  };

  if (loading) return <p className="px-6 py-8 text-sm text-gray-500">Loading…</p>;
  if (!lead) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-red-700">{error || 'Business not found'}</p>
        <Link href="/dashboard/work" className="mt-4 inline-block text-sm text-gray-600">
          Back to work table
        </Link>
      </div>
    );
  }

  const field = (label: string, key: keyof WorkspaceLead, multiline = false) => (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      {multiline ? (
        <textarea
          value={String(lead[key] ?? '')}
          onChange={(event) => setLead({ ...lead, [key]: event.target.value })}
          onBlur={(event) => void save({ [key]: event.target.value } as Partial<WorkspaceLead>)}
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
      ) : (
        <input
          value={String(lead[key] ?? '')}
          onChange={(event) => setLead({ ...lead, [key]: event.target.value })}
          onBlur={(event) => void save({ [key]: event.target.value } as Partial<WorkspaceLead>)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
      )}
    </label>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/dashboard/work" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={14} />
        Work table
      </Link>
      <DashboardPageHeader
        title={lead.business || 'New business'}
        description="Company file. Fill public facts with ChatGPT, or analyze the live website for look, state, and work to sell."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || analyzing}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void fill()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <Sparkles size={15} />
              {saving ? 'Filling…' : 'Fill with ChatGPT'}
            </button>
            <button
              type="button"
              disabled={analyzing || saving}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void analyze()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
            >
              <Globe size={15} />
              {analyzing ? 'Reading site…' : 'Analyze website'}
            </button>
            <button
              type="button"
              onClick={() => void remove()}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        }
      />

      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}

      <div className="space-y-6">
        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Business</h2>
          {field('Business name', 'business')}
          {field('Contact person', 'contactName')}
          {field('What they do', 'whatTheyDo')}
          {field('City', 'city')}
          {field('Language', 'language')}
          {field('Audience', 'audience')}
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Reach them</h2>
          {field('Email', 'email')}
          {field('Phone', 'phone')}
          {field('Website', 'website')}
          {field('Instagram', 'instagram')}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={lead.hasWebsite}
              onChange={(event) => void save({ hasWebsite: event.target.checked })}
            />
            They already have a website
          </label>
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Website review</h2>
          <p className="text-sm text-gray-500">
            AI opens the live site, reads the homepage and contact page, then scores how it looks, what is broken or missing, and what Fintoke should do next.
          </p>
          {field('How it looks', 'siteLook', true)}
          {field('Current state', 'siteState', true)}
          {field('Things to do', 'siteActions', true)}
          {field('Site notes', 'currentSiteNotes', true)}
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Look and offer</h2>
          {field('Style', 'style')}
          {field('Offer price', 'offerPrice')}
          {field('Vercel link', 'vercelUrl')}
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Progress</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lead.offerSent} onChange={(event) => void save({ offerSent: event.target.checked })} />
              Offer sent
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lead.messageSent} onChange={(event) => void save({ messageSent: event.target.checked })} />
              Message sent
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lead.called} onChange={(event) => void save({ called: event.target.checked })} />
              Called
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Response</span>
            <select
              value={lead.responded}
              onChange={(event) => void save({ responded: event.target.value as LeadResponse })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              {RESPONSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {field('Next step', 'nextStep')}
          {field('Follow up (date)', 'followUpAt')}
          {field('Short notes', 'notes', true)}
          {field('Full details', 'details', true)}
        </section>
      </div>
    </div>
  );
}
