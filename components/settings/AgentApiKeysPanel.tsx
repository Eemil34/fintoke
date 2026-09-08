'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AGENT_SCOPES, AGENT_SCOPE_LABELS, type AgentScope } from '@/lib/agent-api/scopes';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

type StoredKey = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: AgentScope[];
  createdAt: string;
  lastUsedAt: string | null;
};

type TunnelStatus = {
  running: boolean;
  publicUrl: string | null;
  error: string | null;
  provider: string | null;
  localOrigin: string;
  mcp: {
    scriptPath: string;
    config: string;
    claudeCodeCommand: string;
  };
};

export default function AgentApiKeysPanel() {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [name, setName] = useState('Claude');
  const [scopes, setScopes] = useState<AgentScope[]>([...AGENT_SCOPES]);
  const [creating, setCreating] = useState(false);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<'key' | 'mcpUrl' | 'mcp' | 'command' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('http://localhost:3002');
  const [tunnel, setTunnel] = useState<TunnelStatus | null>(null);
  const [tunnelBusy, setTunnelBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const loadKeys = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/agent-keys`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error || 'Failed to load API keys');
    }
    setKeys(payload.data || []);
  }, []);

  const loadTunnel = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/agent-tunnel`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error || 'Failed to load public URL status');
    }
    setTunnel(payload.data);
    return payload.data as TunnelStatus;
  }, []);

  useEffect(() => {
    Promise.all([loadKeys(), loadTunnel()]).catch((err) =>
      setError(err instanceof Error ? err.message : 'Failed to load Claude API settings'),
    );
    const timer = window.setInterval(() => {
      loadTunnel().catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [loadKeys, loadTunnel]);

  const mcpConfig = useMemo(() => {
    const raw = tunnel?.mcp.config || '';
    if (freshKey) return raw.replaceAll('<PASTE_CLAUDABLE_API_KEY>', freshKey);
    return raw;
  }, [tunnel, freshKey]);

  const mcpCommand = useMemo(() => {
    const raw = tunnel?.mcp.claudeCodeCommand || '';
    if (freshKey) return raw.replaceAll('<PASTE_CLAUDABLE_API_KEY>', freshKey);
    return raw;
  }, [tunnel, freshKey]);

  function toggleScope(scope: AgentScope) {
    setScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope],
    );
  }

  async function createKey() {
    setCreating(true);
    setError(null);
    setFreshKey(null);
    try {
      const response = await fetch(`${API_BASE}/api/agent-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || 'Failed to create key');
      }
      setFreshKey(payload.data.key);
      setName('Claude');
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    setError(null);
    const response = await fetch(`${API_BASE}/api/agent-keys/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Failed to revoke key');
      return;
    }
    if (freshKey) setFreshKey(null);
    await loadKeys();
  }

  async function startPublicUrl() {
    setTunnelBusy(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/agent-tunnel`, { method: 'POST' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || 'Failed to start public URL');
      }
      setTunnel(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start public URL');
      await loadTunnel().catch(() => undefined);
    } finally {
      setTunnelBusy(false);
    }
  }

  async function stopPublicUrl() {
    setTunnelBusy(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/agent-tunnel`, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || 'Failed to stop public URL');
      }
      setTunnel(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop public URL');
    } finally {
      setTunnelBusy(false);
    }
  }

  async function copy(text: string, kind: 'key' | 'mcpUrl' | 'mcp' | 'command') {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  const publicUrl = tunnel?.publicUrl;
  const cloudReady = Boolean(publicUrl);
  const connectorUrl = publicUrl ? `${publicUrl.replace(/\/$/, '')}/api/v1/mcp` : '';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Claude API access</h3>
        <p className="mt-1 text-sm text-gray-600">
          Pasting instructions into Claude.ai cannot give it localhost access. Add Claudable as a
          <span className="font-medium"> custom connector</span> (remote MCP) so the tools appear
          in Claude’s toolset. Claude Code on this Mac can use the local MCP server instead.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Public URL for Claude.ai</p>
            <p className="mt-1 text-xs text-gray-500">
              Required for Claude.ai. Exposes only <code>/api/v1</code> over HTTPS, including the
              MCP connector. Keep this computer awake. Stop the URL when you are done.
            </p>
          </div>
          {cloudReady ? (
            <button
              type="button"
              onClick={stopPublicUrl}
              disabled={tunnelBusy}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              {tunnelBusy ? 'Stopping…' : 'Stop public URL'}
            </button>
          ) : (
            <button
              type="button"
              onClick={startPublicUrl}
              disabled={tunnelBusy}
              className="rounded-lg bg-[#DE7356] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {tunnelBusy ? 'Starting…' : 'Start public URL'}
            </button>
          )}
        </div>
        {cloudReady ? (
          <code className="block break-all rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-800">
            {publicUrl}/api/v1
          </code>
        ) : (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Without this, Claude.ai has no path to this computer and will offer to write HTML in
            the chat. That is not Claudable and does not publish to Vercel.
          </p>
        )}
        {tunnel?.error ? <p className="text-sm text-red-600">{tunnel.error}</p> : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Key name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            placeholder="Claude"
          />
        </label>

        <div>
          <p className="text-sm font-medium text-gray-800">Permissions</p>
          <div className="mt-2 grid gap-2">
            {AGENT_SCOPES.map((scope) => (
              <label
                key={scope}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={scopes.includes(scope)}
                  onChange={() => toggleScope(scope)}
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    {AGENT_SCOPE_LABELS[scope].title}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {AGENT_SCOPE_LABELS[scope].description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={createKey}
          disabled={creating || scopes.length === 0}
          className="rounded-lg bg-[#DE7356] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? 'Generating…' : 'Generate API key'}
        </button>
      </div>

      {freshKey ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-950">
            Copy this key now — it won’t be shown again.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs text-gray-800">
              {freshKey}
            </code>
            <button
              type="button"
              onClick={() => copy(freshKey, 'key')}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium"
            >
              {copied === 'key' ? 'Copied' : 'Copy key'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-sm font-medium text-gray-900">Add as a Claude.ai connector</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>Start the public URL and generate a key. The newest active key is used automatically.</li>
          <li>
            In Claude.ai: <span className="font-medium">Customize → Connectors → Add custom connector</span>.
          </li>
          <li>Paste only the remote MCP URL. Authentication: <span className="font-medium">None</span>.</li>
          <li>
            Do not add Authorization headers. Claude.ai often omits them on tool calls, which looked
            like a “stale token.”
          </li>
          <li>
            If the connector already exists, remove it and add it again with the current URL. Then
            enable it in the chat <span className="font-medium">+</span> menu.
          </li>
        </ol>
        {cloudReady ? (
          <>
            <div>
              <p className="text-xs font-medium text-gray-700">Remote MCP server URL</p>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                <code className="flex-1 break-all rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-800">
                  {connectorUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copy(connectorUrl, 'mcpUrl')}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium"
                >
                  {copied === 'mcpUrl' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            </div>
            {keys.length === 0 ? (
              <p className="text-xs text-amber-800">
                Generate a key above. Claude.ai will use that key automatically; you do not paste it
                into the connector.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Active key {keys[0].name} ({keys[0].keyPrefix}) is used for Claude.ai tool calls.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">Start the public URL to get the MCP address Claude.ai can add.</p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Claude Desktop / Claude Code (this Mac)</p>
        <p className="text-xs text-gray-500">
          This MCP server calls {tunnel?.localOrigin || origin} locally, so no public URL is needed.
          Add it to Claude Desktop config, or run the Claude Code command.
        </p>
        <textarea
          readOnly
          value={mcpConfig}
          className="mt-1 h-40 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs font-mono"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy(mcpConfig, 'mcp')}
            disabled={!mcpConfig}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {copied === 'mcp' ? 'Copied' : 'Copy Desktop config'}
          </button>
          <button
            type="button"
            onClick={() => copy(mcpCommand, 'command')}
            disabled={!mcpCommand}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {copied === 'command' ? 'Copied' : 'Copy Claude Code command'}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div>
        <h4 className="text-sm font-medium text-gray-900">Active keys</h4>
        {keys.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No API keys yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <p className="text-xs text-gray-500">
                    {key.keyPrefix} · {key.scopes.join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeKey(key.id)}
                  className="self-start rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
