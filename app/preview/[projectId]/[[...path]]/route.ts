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

function rewritePublicPaths(source: string, prefix: string, port: number) {
  const base = prefix.replace(/\/$/, '');
  const origin = new RegExp(`(https?:|wss?:)?\\/\\/(127\\.0\\.0\\.1|localhost):${port}`, 'g');
  return source
    .replace(origin, '')
    .replace(/(["'`(=])\/(?!\/|preview\/)/g, `$1${base}/`);
}

function injectLiveReload(html: string, prefix: string) {
  if (html.includes('__fintokeLive')) {
    return html;
  }
  const script = `<script>
(function () {
  if (window.__fintokeLive) return;
  window.__fintokeLive = true;
  var stamp = null;
  var prefix = ${JSON.stringify(prefix)};
  setInterval(function () {
    fetch(prefix + '/__fintoke_reload', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (stamp == null) { stamp = d.stamp; return; }
        if (d.stamp !== stamp) {
          stamp = d.stamp;
          location.reload();
        }
      })
      .catch(function () {});
  }, 1500);
})();
</script>`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }
  return html + script;
}

function childPath(segments?: string[]) {
  if (!segments?.length) return '/';
  if (segments.some((part) => part === '..' || part === '')) return '/';
  return `/${segments.join('/')}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { projectId: rawProjectId, path: segments } = await params;
  const projectId = decodeURIComponent(rawProjectId);
  const prefix = `/preview/${encodeURIComponent(projectId)}`;
  const logs = () => previewManager.getLogs(projectId);
  const preview = previewManager.getStatus(projectId);

  if (segments?.[0] === '__fintoke_reload') {
    const stamp = await previewManager.sourceStamp(projectId);
    return Response.json(
      { stamp },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

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

  const rest = childPath(segments);
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

  const deadline = Date.now() + (isAssetRequest(segments) ? 4000 : 20000);
  let upstream: Response | null = null;
  let attempt = 0;
  while (Date.now() < deadline) {
    try {
      upstream = await fetch(target, init);
      if (upstream.status < 500 || isAssetRequest(segments) || method !== 'GET') {
        break;
      }
      await upstream.body?.cancel().catch(() => undefined);
    } catch {
      upstream = null;
    }
    attempt += 1;
    await sleep(Math.min(400 * attempt, 1500));
  }

  if (!upstream) {
    if (isAssetRequest(segments)) {
      return new Response('', { status: 503, headers: { 'retry-after': '2' } });
    }
    if (preview.status === 'running') {
      return previewPage(
        'Updating preview',
        'Next.js is rebuilding after a file change. This frame will retry automatically.',
        logs(),
        true,
      );
    }
    return previewPage(
      'Starting preview',
      'Dependencies are installing or Next.js is compiling.',
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
        const pathName = location.pathname.startsWith(prefix)
          ? location.pathname
          : `${prefix}${location.pathname}`;
        out.set('location', `${pathName}${location.search}`);
        return;
      } catch {
        out.set(key, value);
        return;
      }
    }
    out.set(key, value);
  });

  const shouldRewrite =
    contentType.includes('text/html') ||
    contentType.includes('javascript') ||
    contentType.includes('text/css') ||
    contentType.includes('json');
  if (shouldRewrite) {
    let body = rewritePublicPaths(await upstream.text(), prefix, preview.port);
    if (contentType.includes('text/html')) {
      body = injectLiveReload(body, prefix);
    }
    out.delete('content-length');
    return new Response(body, { status: upstream.status, headers: out });
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
