import { NextRequest } from 'next/server';
import { previewManager } from '@/lib/services/preview';
import { previewBasePath } from '@/lib/server/publicUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface RouteContext {
  params: Promise<{ projectId: string; path?: string[] }>;
}

function loadingPage(projectId: string, message: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="2" />
  <title>Starting preview</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #0f172a; }
    main { text-align: center; padding: 24px; }
    p { color: #475569; }
  </style>
</head>
<body>
  <main>
    <h1>Starting preview</h1>
    <p>${message.replace(/</g, '&lt;')}</p>
    <p>Site ${projectId.replace(/</g, '&lt;')}</p>
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

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { projectId: rawProjectId, path: segments } = await params;
  const projectId = decodeURIComponent(rawProjectId);
  let preview = previewManager.getStatus(projectId);
  if (!preview.port) {
    void previewManager.start(projectId).catch((error) => {
      console.error('[Preview proxy] Failed to start:', error);
    });
    if (isAssetRequest(segments)) {
      return new Response('', { status: 503, headers: { 'retry-after': '2' } });
    }
    return loadingPage(projectId, 'Installing dependencies and starting the site…');
  }

  const rest = segments?.length ? `/${segments.map((part) => encodeURIComponent(part)).join('/')}` : '';
  const prefix = previewBasePath(projectId) || `/preview/${encodeURIComponent(projectId)}`;
  const target = `http://127.0.0.1:${preview.port}${prefix}${rest}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === 'host' || key === 'connection' || key === 'content-length') return;
    headers.set(key, value);
  });
  headers.set('host', `127.0.0.1:${preview.port}`);
  headers.set('x-forwarded-host', request.headers.get('host') || '');
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers, redirect: 'manual' };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
    (init as RequestInit & { duplex: string }).duplex = 'half';
  }

  try {
    const upstream = await fetch(target, init);
    const out = new Headers();
    upstream.headers.forEach((value, key) => {
      if (key === 'content-encoding' || key === 'transfer-encoding') return;
      out.set(key, value);
    });
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch {
    if (isAssetRequest(segments)) {
      return new Response('', { status: 503, headers: { 'retry-after': '2' } });
    }
    return loadingPage(projectId, 'The site process is still starting. This page will refresh automatically.');
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
