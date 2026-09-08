import { execFile, spawn, type ChildProcess } from 'child_process';
import http from 'http';
import path from 'path';
import { promisify } from 'util';
import { appOrigin, AGENT_CORS_HEADERS } from './http';
import { claudeDesktopMcpConfig } from './docs';

const execFileAsync = promisify(execFile);

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

const PUBLIC_URL_RE =
  /https:\/\/[a-z0-9][a-z0-9.-]+\.(?:trycloudflare\.com|ngrok(?:-free)?\.(?:app|io|dev)|loca\.lt)/i;

export type AgentTunnelStatus = {
  running: boolean;
  publicUrl: string | null;
  proxyPort: number | null;
  error: string | null;
  provider: string | null;
  localOrigin: string;
  mcp: {
    scriptPath: string;
    config: string;
    claudeCodeCommand: string;
  };
};

type TunnelState = {
  status: AgentTunnelStatus;
  proxy: http.Server | null;
  child: ChildProcess | null;
  starting: Promise<AgentTunnelStatus> | null;
};

const globalForTunnel = globalThis as unknown as { __claudableAgentTunnel?: TunnelState };

function mcpScriptPath(): string {
  return path.join(process.cwd(), 'scripts', 'claudable-mcp.js');
}

function localOrigin(): string {
  return appOrigin();
}

function mcpPayload(apiKey?: string): AgentTunnelStatus['mcp'] {
  const scriptPath = mcpScriptPath();
  const origin = localOrigin();
  return {
    scriptPath,
    config: claudeDesktopMcpConfig({ scriptPath, appOrigin: origin, apiKey }),
    claudeCodeCommand: `claude mcp add claudable --env CLAUDABLE_URL=${origin} --env CLAUDABLE_API_KEY=${apiKey || '<PASTE_CLAUDABLE_API_KEY>'} -- node "${scriptPath}"`,
  };
}

function emptyStatus(error: string | null = null): AgentTunnelStatus {
  return {
    running: false,
    publicUrl: null,
    proxyPort: null,
    error,
    provider: null,
    localOrigin: localOrigin(),
    mcp: mcpPayload(),
  };
}

function getState(): TunnelState {
  if (!globalForTunnel.__claudableAgentTunnel) {
    globalForTunnel.__claudableAgentTunnel = {
      status: emptyStatus(),
      proxy: null,
      child: null,
      starting: null,
    };
  }
  return globalForTunnel.__claudableAgentTunnel;
}

function setPublicUrl(url: string | null) {
  if (url) {
    process.env.AGENT_PUBLIC_URL = url.replace(/\/$/, '');
  } else {
    delete process.env.AGENT_PUBLIC_URL;
  }
}

function appPort(): number {
  const parsed = Number.parseInt(process.env.PORT || process.env.WEB_PORT || '3002', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3002;
}

function corsHeaders(): Record<string, string> {
  return { ...AGENT_CORS_HEADERS };
}

function startV1Proxy(targetPort: number): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = req.url || '/';
      if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders());
        res.end();
        return;
      }
      const pathOnly = url.split('?')[0] || '/';
      const allowed = pathOnly.startsWith('/api/v1');
      if (!allowed) {
        res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders() });
        res.end(
          JSON.stringify({
            success: false,
            error: 'This public URL only exposes /api/v1. Dashboard and key management stay local.',
          }),
        );
        return;
      }

      const headers: Record<string, string | string[] | undefined> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (!HOP_BY_HOP.has(key.toLowerCase())) headers[key] = value;
      }
      headers.host = `127.0.0.1:${targetPort}`;

      const upstream = http.request(
        {
          hostname: '127.0.0.1',
          port: targetPort,
          path: url,
          method: req.method,
          headers,
        },
        (up) => {
          const outHeaders = { ...up.headers, ...corsHeaders() };
          res.writeHead(up.statusCode || 500, outHeaders);
          up.pipe(res);
        },
      );
      upstream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json', ...corsHeaders() });
        }
        res.end(JSON.stringify({ success: false, error: 'Failed to reach Claudable' }));
      });
      req.pipe(upstream);
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind the public API proxy'));
        return;
      }
      resolve({ server, port: address.port });
    });
  });
}

async function which(bin: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(process.platform === 'win32' ? 'where' : 'which', [bin]);
    return stdout.split(/\r?\n/)[0]?.trim() || null;
  } catch {
    return null;
  }
}

function extractPublicUrl(text: string): string | null {
  const match = text.match(PUBLIC_URL_RE);
  return match ? match[0].replace(/\/$/, '') : null;
}

function spawnTunnel(binary: string, args: string[]): ChildProcess {
  return spawn(binary, args, {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

async function readNgrokPublicUrl(): Promise<string | null> {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (!response.ok) return null;
    const payload = (await response.json()) as { tunnels?: { public_url?: string }[] };
    const url = payload.tunnels?.map((tunnel) => tunnel.public_url).find((value) => value?.startsWith('https://'));
    return url ? url.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

async function waitForPublicUrl(child: ChildProcess, timeoutMs = 75_000): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new Error(
          'Timed out waiting for a public HTTPS URL. Install cloudflared (`brew install cloudflared`) or sign in to ngrok, then try again.',
        ),
      );
    }, timeoutMs);

    const finish = (url: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(url);
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const url = extractPublicUrl(buffer);
      if (url) finish(url);
    };

    const onExit = (code: number | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new Error(
          `Tunnel process exited${code != null ? ` (${code})` : ''}. ${buffer.trim().slice(-400)}`.trim(),
        ),
      );
    };

    const pollNgrok = async () => {
      while (!settled) {
        const url = await readNgrokPublicUrl();
        if (url) {
          finish(url);
          return;
        }
        await new Promise((resolveWait) => setTimeout(resolveWait, 400));
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      child.stdout?.off('data', onData);
      child.stderr?.off('data', onData);
      child.off('exit', onExit);
    };

    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.once('exit', onExit);
    void pollNgrok();
  });
}

async function tunnelCandidates(proxyPort: number) {
  const target = `http://127.0.0.1:${proxyPort}`;
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const candidates: { provider: string; binary: string; args: string[]; timeoutMs: number }[] = [];

  const cloudflared = await which('cloudflared');
  if (cloudflared) {
    candidates.push({
      provider: 'cloudflared',
      binary: cloudflared,
      args: ['tunnel', '--url', target, '--no-autoupdate'],
      timeoutMs: 45_000,
    });
  }

  candidates.push({
    provider: 'npx-cloudflared',
    binary: npx,
    args: ['--yes', 'cloudflared', 'tunnel', '--url', target, '--no-autoupdate'],
    timeoutMs: 90_000,
  });

  const ngrok = await which('ngrok');
  if (ngrok) {
    candidates.push({
      provider: 'ngrok',
      binary: ngrok,
      args: ['http', target, '--log', 'stdout'],
      timeoutMs: 20_000,
    });
  }

  candidates.push({
    provider: 'localtunnel',
    binary: npx,
    args: ['--yes', 'localtunnel', '--port', String(proxyPort)],
    timeoutMs: 45_000,
  });

  return candidates;
}

async function openPublicTunnel(proxyPort: number): Promise<{ child: ChildProcess; provider: string; publicUrl: string }> {
  const errors: string[] = [];
  for (const candidate of await tunnelCandidates(proxyPort)) {
    const child = spawnTunnel(candidate.binary, candidate.args);
    try {
      const publicUrl = await waitForPublicUrl(child, candidate.timeoutMs);
      return { child, provider: candidate.provider, publicUrl };
    } catch (error) {
      stopChild(child);
      errors.push(`${candidate.provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Could not create a public HTTPS URL.\n${errors.join('\n')}`);
}

function stopChild(child: ChildProcess | null) {
  if (!child || child.killed) return;
  try {
    child.kill('SIGTERM');
  } catch {
    // ignore
  }
}

function stopProxy(proxy: http.Server | null) {
  if (!proxy) return;
  try {
    proxy.close();
  } catch {
    // ignore
  }
}

function resetProcesses() {
  const state = getState();
  stopChild(state.child);
  stopProxy(state.proxy);
  state.child = null;
  state.proxy = null;
  setPublicUrl(null);
}

export function getAgentTunnelStatus(): AgentTunnelStatus {
  const state = getState();
  return { ...state.status, localOrigin: localOrigin(), mcp: mcpPayload() };
}

export async function stopAgentTunnel(): Promise<AgentTunnelStatus> {
  const state = getState();
  state.starting = null;
  resetProcesses();
  state.status = emptyStatus();
  return getAgentTunnelStatus();
}

export async function startAgentTunnel(): Promise<AgentTunnelStatus> {
  const state = getState();
  if (state.status.running && state.status.publicUrl) {
    return getAgentTunnelStatus();
  }
  if (state.starting) return state.starting;

  const starting = (async () => {
    resetProcesses();
    const { server, port } = await startV1Proxy(appPort());
    const current = getState();
    current.proxy = server;

    const launched = await openPublicTunnel(port);
    current.child = launched.child;
    launched.child.once('exit', () => {
      const live = getState();
      if (live.child === launched.child) {
        resetProcesses();
        live.status = emptyStatus(
          'The public URL stopped. Start it again before Claude.ai can call Claudable.',
        );
      }
    });

    setPublicUrl(launched.publicUrl);
    current.status = {
      running: true,
      publicUrl: launched.publicUrl,
      proxyPort: port,
      error: null,
      provider: launched.provider,
      localOrigin: localOrigin(),
      mcp: mcpPayload(),
    };
    return getAgentTunnelStatus();
  })();

  state.starting = starting;

  try {
    return await starting;
  } catch (error) {
    resetProcesses();
    const message = error instanceof Error ? error.message : 'Failed to start public URL';
    getState().status = emptyStatus(message);
    throw error;
  } finally {
    if (getState().starting === starting) {
      getState().starting = null;
    }
  }
}
