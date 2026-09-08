'use client';

import { FormEvent, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/studio';
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Login failed');
      }
      window.location.href = next.startsWith('/') ? next : '/studio';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="marketing-dark relative flex min-h-screen items-center justify-center px-5">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
      <form
        onSubmit={(event) => void submit(event)}
        className="glass-card relative w-full max-w-sm rounded-[28px] p-8"
      >
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c4784a]" />
          </span>
          <span className="text-sm font-medium text-white">Fintoke</span>
        </Link>
        <h1 className="text-xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">Opens the website creation studio on this machine.</p>
        <label className="mt-6 block text-sm">
          <span className="mb-1 block text-zinc-400">User</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4784a]/50"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4784a]/50"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-[#e07a4c]">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-gradient-to-b from-[#d28a5a] to-[#9a4e2a] py-2.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(196,120,74,0.35)] disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Open Dashboard'}
        </button>
        <p className="mt-4 text-xs text-zinc-600">
          Local default password is <code>admin</code> unless you set ADMIN_PASSWORD.
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="marketing-dark min-h-screen p-8 text-sm text-zinc-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
