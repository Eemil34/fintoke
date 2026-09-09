import { NextRequest } from 'next/server';
import { previewManager } from '@/lib/services/preview';
import { previewBasePath } from '@/lib/server/publicUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface RouteContext {
  params: Promise<{ projectId: string; path?: string[] }>;
}

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { projectId: rawProjectId, path: segments } = await params;
  const projectId = decodeURIComponent(rawProjectId);
  let preview = previewManager.getStatus(projectId);
  if (!preview.port) {
    try {
      preview = await previewManager.start(projectId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return new Response(`Preview failed to start: ${message}`, { status: 503 });
    }
  }
  if (!preview.port) {
    return new Response('Preview is not running. Open the site in Studio and start preview.', { status: 404 });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Preview proxy failed: ${message}`, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
