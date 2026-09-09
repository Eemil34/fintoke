import { NextRequest } from 'next/server';
import { previewManager } from '@/lib/services/preview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface RouteContext {
  params: Promise<{ projectId: string; path?: string[] }>;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function previewPage(title: string, message: string, logs: string[], refresh: boolean) {
  const logBlock = logs
    .slice(-30)
    .map((line) => escapeHtml(line))
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  ${refresh ? '<meta http-equiv="refresh" content="3" />' : ''}
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; min-height: 100vh; background: #f8fafc; color: #0f172a; }
    main { max-width: 720px; margin: 0 auto; padding: 32px 20px; }
    pre { text-align: left; background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 12px; overflow: auto; font-size: 12px; min-height: 80px; }
    p { color: #475569; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <pre>${logBlock || 'Waiting for preview logs…'}</pre>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function isAssetRequest(segments?: string[]) {
  if (!segments?.length) return false;
  if (segments[0] === '_next') return true;
  return /\.[a-z0-9]+$/i.test(segments[segments.length - 1] || '');
}

function rewriteHtml(html: string, prefix: string) {
  const base = prefix.replace(/\/$/, '');
  return html
    .replace(/(["'])\/_next\//g, `$1${base}/_next/`)
    .replace(/((?:href|src)=["'])\/(?!\/)/g, `$1${base}/`);
}

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { projectId: rawProjectId, path: segments } = await params;
  const projectId = decodeURIComponent(rawProjectId);
  const prefix = `/preview/${encodeURIComponent(projectId)}`;
  const logs = () => previewManager.getLogs(projectId);
  const preview = previewManager.getStatus(projectId);

  if (preview.status === 'error') {
    return previewPage(
      'Preview failed',
      'The site process exited. Reload chat to retry.',
      preview.logs || logs(),
      false,
    );
  }

  if (!preview.port) {
    void previewManager.start(projectId).catch((error) => {
      console.error('[Preview proxy] Failed to start:', error);
    });
    if (isAssetRequest(segments)) {
      return new Response('', { status: 503, headers: { 'retry-after': '2' } });
    }
    return previewPage('Starting preview', 'Preparing the site process…', logs(), true);
  }

  const rest = segments?.length
    ? `/${segments.map((part) => encodeURIComponent(part)).join('/')}`
    : '/';
  const target = `http://127.0.0.1:${preview.port}${rest}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === 'host' || key === 'connection' || key === 'content-length') return;
    headers.set(key, value);
  });
  headers.set('host', `127.0.0.1:${preview.port}`);

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers, redirect: 'manual' };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
    (init as RequestInit & { duplex: string }).duplex = 'half';
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    if (isAssetRequest(segments)) {
      return new Response('', { status: 503, headers: { 'retry-after': '2' } });
    }
    return previewPage(
      'Starting preview',
      'Dependencies are installing or Next.js is compiling.',
      logs(),
      true,
    );
  }

  if (upstream.status >= 500 && !isAssetRequest(segments)) {
    return previewPage(
      'Starting preview',
      'The site is still compiling. This frame will refresh.',
      logs(),
      true,
    );
  }

  const contentType = upstream.headers.get('content-type') || '';
  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key === 'content-encoding' || key === 'transfer-encoding') return;
    if (key === 'location') {
      try {
        const location = new URL(value, `http://127.0.0.1:${preview.port}`);
        out.set('location', `${prefix}${location.pathname}${location.search}`);
        return;
      } catch {
        out.set(key, value);
        return;
      }
    }
    out.set(key, value);
  });

  if (contentType.includes('text/html')) {
    const html = rewriteHtml(await upstream.text(), prefix);
    out.delete('content-length');
    return new Response(html, { status: upstream.status, headers: out });
  }

  return new Response(upstream.body, { status: upstream.status, headers: out });
}

async function safeProxy(request: NextRequest, context: RouteContext) {
  try {
    return await proxy(request, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return previewPage('Preview error', message, [], true);
  }
}

export const GET = safeProxy;
export const POST = safeProxy;
export const PUT = safeProxy;
export const PATCH = safeProxy;
export const DELETE = safeProxy;
export const HEAD = safeProxy;
export const OPTIONS = safeProxy;
