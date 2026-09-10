'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { PublicMailSettings } from '@/types/workspace';

const EMPTY: PublicMailSettings = {
  configured: false,
  provider: 'smtp',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  smtp: { host: 'smtp.gmail.com', port: 587, secure: false, user: '', hasPassword: false },
  resend: { hasApiKey: false },
};

export default function MailSettingsPanel({ onStatus }: { onStatus?: (configured: boolean) => void }) {
  const [settings, setSettings] = useState<PublicMailSettings>(EMPTY);
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [provider, setProvider] = useState<'smtp' | 'resend'>('smtp');
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState('587');
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((next: PublicMailSettings) => {
    setSettings(next);
    setFromName(next.fromName);
    setFromEmail(next.fromEmail);
    setReplyTo(next.replyTo);
    setProvider(next.provider);
    const nextHost = next.smtp.host || 'smtp.gmail.com';
    const gmail = /gmail\.com$/i.test(nextHost);
    const ssl = next.smtp.port === 465 && next.smtp.secure;
    setHost(nextHost);
    setPort(String(ssl ? 465 : gmail ? 587 : next.smtp.port || 587));
    setSecure(ssl);
    setUser(next.smtp.user);
    setPassword('');
    setResendKey('');
    onStatus?.(next.configured);
  }, [onStatus]);

  useEffect(() => {
    fetchDashboardJson<PublicMailSettings>('/api/workspace/mail')
      .then(apply)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load mail settings'));
  }, [apply]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const gmail = /gmail\.com$/i.test(host);
      const useSsl = secure && Number(port) === 465;
      const next = await fetchDashboardJson<PublicMailSettings>('/api/workspace/mail', {
        method: 'PUT',
        body: JSON.stringify({
          provider,
          fromName,
          fromEmail,
          replyTo,
          resendApiKey: resendKey,
          smtp: {
            host,
            port: useSsl ? 465 : gmail ? 587 : Number(port) || 587,
            secure: useSsl,
            user,
            password,
          },
        }),
      });
      apply(next);
      setMessage(next.configured ? 'Sending is saved. Claude can deliver mail from templates now.' : 'Saved, but sending is still incomplete.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mail settings');
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const result = await fetchDashboardJson<{ ok: boolean; from: string; provider: string }>(
        '/api/workspace/mail',
        { method: 'POST', body: JSON.stringify({ action: 'verify' }) },
      );
      setMessage(`Connection works. A test email was sent from ${result.from}. Check that inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the mail connection');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Sending</p>
          <p className="mt-1 text-sm text-gray-500">
            Claude uses this connection to deliver template emails. Gmail SMTP often does not work on Railway. Prefer Resend (HTTPS). For Gmail SMTP use an App Password, smtp.gmail.com, port 587, and your full Gmail address.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            settings.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {settings.configured ? 'Ready to send' : 'Not connected'}
        </span>
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      ) : null}

      <div className="mb-4 flex gap-2">
        {(['smtp', 'resend'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setProvider(item)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
              provider === item ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item === 'smtp' ? 'SMTP / Gmail' : 'Resend'}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">From name</span>
          <input
            value={fromName}
            onChange={(event) => setFromName(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">From email</span>
          <input
            type="email"
            value={fromEmail}
            onChange={(event) => setFromEmail(event.target.value)}
            placeholder="you@yourdomain.com"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Address only. Put the name in From name. For Resend this domain must be verified.
          </span>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-gray-600">Reply-to (optional)</span>
          <input
            type="email"
            value={replyTo}
            onChange={(event) => setReplyTo(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </label>
      </div>

      {provider === 'smtp' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">SMTP host</span>
            <input
              value={host}
              onChange={(event) => setHost(event.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Port</span>
            <input
              value={port}
              onChange={(event) => {
                setPort(event.target.value);
                setSecure(event.target.value === '465');
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Username</span>
            <input
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">
              Password {settings.smtp.hasPassword ? '(saved — leave blank to keep)' : ''}
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={secure && port === '465'}
              onChange={(event) => {
                if (event.target.checked) {
                  setPort('465');
                  setSecure(true);
                } else {
                  setPort('587');
                  setSecure(false);
                }
              }}
            />
            Use SSL on port 465. Leave this off for Gmail (port 587).
          </label>
        </div>
      ) : (
        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-gray-600">
            Resend API key {settings.resend.hasApiKey ? '(saved — leave blank to keep)' : ''}
          </span>
          <input
            type="password"
            value={resendKey}
            onChange={(event) => setResendKey(event.target.value)}
            placeholder="re_…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </label>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={checking || !settings.configured}
          onClick={() => void verify()}
          className="rounded-xl px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {checking ? 'Testing…' : 'Send test email'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save sending'}
        </button>
      </div>
    </div>
  );
}
