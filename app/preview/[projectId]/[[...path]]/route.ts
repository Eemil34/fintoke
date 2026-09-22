import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { previewManager } from '@/lib/services/preview';
import { getProjectById } from '@/lib/services/project';
import { resolveProjectWorkspace } from '@/lib/server/projectWorkspace';
import { applyProjectEditsToHtml, ensureCopySwaps, injectLiveCopyOverlay, readFastCopy } from '@/lib/templates/fastPreview';
import { resolveSnapshotTemplateId } from '@/lib/templates/snapshot';
import { freezePreviewHtml, prioritizeLcpImage, readStaticExportFile, resolveStaticExportDir, rewriteStaticUrls } from '@/lib/templates/staticSite';
import { getWebsiteTemplateId } from '@/lib/templates/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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

function previewPage(title: string, message: string, logs: string[]) {
  const logBlock = logs
    .slice(-30)
    .map((line) => escapeHtml(line))
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en" data-fintoke-shell="1">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; min-height: 100vh; background: #111827; color: #f8fafc; display: flex; align-items: center; justify-content: center; }
    main { max-width: 640px; margin: 0 auto; padding: 32px 20px; text-align: center; }
    .spin { width: 36px; height: 36px; border: 3px solid #334155; border-top-color: #DE7356; border-radius: 50%; margin: 0 auto 20px; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    pre { text-align: left; background: #0f172a; color: #cbd5e1; padding: 12px; border-radius: 12px; overflow: auto; font-size: 11px; min-height: 72px; }
    p { color: #94a3b8; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <div class="spin" aria-hidden="true"></div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <pre>${logBlock || 'Waiting for the site…'}</pre>
  </main>
  <script>
    (function () {
      var path = location.pathname + location.search.replace(/[?&]fintoke_probe=1/, '');
      function tick() {
        fetch(location.pathname + (location.pathname.indexOf('?') >= 0 ? '&' : '?') + 'fintoke_probe=1', { cache: 'no-store' })
          .then(function (r) {
            if (r.ok) location.replace(path);
            else setTimeout(tick, 1500);
          })
          .catch(function () { setTimeout(tick, 1500); });
      }
      setTimeout(tick, 400);
    })();
  </script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
  });
}

function isAssetRequest(segments?: string[]) {
  if (!segments?.length) return false;
  if (segments[0] === '_next') return true;
  return /\.[a-z0-9]+$/i.test(segments[segments.length - 1] || '');
}

function rewriteHtml(source: string, prefix: string, port: number) {
  const base = prefix.replace(/\/$/, '');
  const origin = new RegExp(`(https?:|wss?:)//(?:127\\.0\\.0\\.1|localhost):${port}`, 'g');
  return source
    .replace(origin, '')
    .replace(/(["'`(=])\/_next\//g, `$1${base}/_next/`)
    .replace(/(\s(?:href|src|srcset|srcSet))="\/(?!\/|preview\/)/gi, `$1="${base}/`)
    .replace(/https?:\/\/(?:www\.)?fintoke\.com\/(?:dashboard|studio|login|api)[^"'>\s]*/gi, '#')
    .replace(/(\s(?:href|src))="(?:\/preview\/[^/]+)?\/(?:dashboard|studio|login)(?:\/[^"]*)?"/gi, '$1="#"');
}

function childPath(segments?: string[]) {
  if (!segments?.length) return '/';
  if (segments.some((part) => part === '..' || part === '')) return '/';
  return `/${segments.join('/')}`;
}

function previewSecurityHeaders(headers: Headers) {
  headers.delete('set-cookie');
  headers.set('x-robots-tag', 'noindex, nofollow');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'SAMEORIGIN');
  headers.set(
    'content-security-policy',
    "frame-ancestors 'self' https://www.fintoke.com; form-action 'self'; base-uri 'self'",
  );
  headers.set('cache-control', 'no-store');
  return headers;
}

function copyHeaders(upstream: Response, prefix: string, port: number) {
  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key === 'content-encoding' || key === 'transfer-encoding' || key === 'set-cookie') return;
    if (key === 'content-disposition') return;
    if (key === 'location') {
      try {
        const location = new URL(value, `http://127.0.0.1:${port}`);
        if (/^\/(dashboard|studio|login|api)(\/|$)/i.test(location.pathname)) {
          out.set('location', prefix);
          return;
        }
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
  return previewSecurityHeaders(out);
}

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { projectId: rawProjectId, path: segments } = await params;
  const projectId = decodeURIComponent(rawProjectId);
  const prefix = `/preview/${encodeURIComponent(projectId)}`;
  const isProbe = request.nextUrl.searchParams.get('fintoke_probe') === '1';

  const project = await getProjectById(projectId);
  let copyPack = null as Awaited<ReturnType<typeof readFastCopy>>;
  let templateId = '';
  let projectPath = '';
  if (project) {
    projectPath = await resolveProjectWorkspace(project, projectId);
    copyPack = await readFastCopy(projectPath);
    templateId =
      copyPack?.templateId ||
      (await fs.readFile(path.join(projectPath, '.fintoke-from'), 'utf8').catch(() => '')).trim() ||
      getWebsiteTemplateId((project as { settings?: string | null }).settings) ||
      '';
  }

  const resolvedTemplate = templateId ? await resolveSnapshotTemplateId(templateId) : '';
  const staticRoot = resolvedTemplate ? await resolveStaticExportDir(resolvedTemplate) : null;
  if (staticRoot) {
    if (isProbe) {
      return new Response('ready', { status: 200, headers: { 'cache-control': 'no-store' } });
    }
    if (segments?.[0] === '_next' && segments[1] === 'image') {
      const target = request.nextUrl.searchParams.get('url') || '';
      try {
        const decoded = decodeURIComponent(target);
        if (/^https?:\/\//i.test(decoded)) {
          return Response.redirect(decoded, 302);
        }
        if (decoded.startsWith('/')) {
          const local = await readStaticExportFile(
            staticRoot,
            decoded.split('/').filter(Boolean),
          );
          if (local) {
            const headers = previewSecurityHeaders(new Headers());
            headers.set('content-type', local.contentType);
            headers.set('cache-control', 'no-store');
            return new Response(new Uint8Array(local.body), { status: 200, headers });
          }
        }
      } catch {
        // fall through
      }
    }
    const file = await readStaticExportFile(staticRoot, segments);
    if (file) {
      let body: Buffer | string = file.body;
      const type = file.contentType;
      const rewriteText = type.includes('text/html') || type.includes('text/css') || type.includes('javascript');
      if (rewriteText) {
        let text = rewriteStaticUrls(body.toString('utf8'), prefix);
        if (type.includes('text/html')) {
          text = freezePreviewHtml(text);
          const painted = await applyProjectEditsToHtml(text, projectPath, resolvedTemplate, copyPack);
          text = painted.html;
          if (copyPack && painted.count === 0) {
            const packed = await ensureCopySwaps(copyPack);
            text = injectLiveCopyOverlay(text, packed);
          }
          text = prioritizeLcpImage(
            text
              .replace(/<meta[^>]+name=["']referrer["'][^>]*>/gi, '')
              .replace(/\sreferrerpolicy=["'][^"']*["']/gi, '')
              .replace(/<img\b/gi, '<img referrerpolicy="origin"'),
          );
        }
        body = text;
      }
      const headers = previewSecurityHeaders(new Headers());
      headers.set('content-type', type);
      headers.set('cache-control', type.includes('text/html') ? 'no-store' : 'public, max-age=86400, immutable');
      const payload: BodyInit = typeof body === 'string' ? body : new Uint8Array(body);
      return new Response(payload, { status: 200, headers });
    }
    if (isAssetRequest(segments)) {
      return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
    }
  }

  const previewKey = resolvedTemplate ? `tpl:${resolvedTemplate}` : projectId;
  if (resolvedTemplate) {
    if (previewManager.getStatus(previewKey).status === 'error' || !previewManager.getStatus(previewKey).port) {
      void previewManager.startSharedTemplate(resolvedTemplate).catch((error) => {
        console.error('[Preview proxy] Failed to start template:', error);
      });
    }
  } else if (previewManager.getStatus(projectId).status === 'error' || !previewManager.getStatus(projectId).port) {
    void previewManager.start(projectId).catch((error) => {
      console.error('[Preview proxy] Failed to start:', error);
    });
  }

  const logs = () => previewManager.getLogs(previewKey);
  const preview = previewManager.getStatus(previewKey);

  if (preview.status === 'error' || !preview.port) {
    if (isProbe || isAssetRequest(segments)) {
      return new Response('wait', {
        status: 503,
        headers: { 'retry-after': '2', 'cache-control': 'no-store' },
      });
    }
    return previewPage(
      'Opening the site',
      preview.status === 'error' ? 'Restarting the preview…' : 'Starting the restaurant preview…',
      preview.logs || logs(),
    );
  }

  const rest = childPath(segments);
  const childParams = new URLSearchParams(request.nextUrl.searchParams);
  childParams.delete('fintoke_probe');
  const childSearch = childParams.toString();
  const target = `http://127.0.0.1:${preview.port}${rest}${childSearch ? `?${childSearch}` : ''}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === 'host' || key === 'connection' || key === 'content-length') return;
    headers.set(key, value);
  });
  headers.set('host', `127.0.0.1:${preview.port}`);

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    signal: AbortSignal.timeout(20000),
  };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
    (init as RequestInit & { duplex: string }).duplex = 'half';
  }

  const documentRequest = !isAssetRequest(segments);
  const deadline = Date.now() + (documentRequest && !isProbe ? 48_000 : 8_000);
  let upstream: Response | null = null;
  while (Date.now() < deadline) {
    try {
      const nextInit: RequestInit = { ...init, signal: AbortSignal.timeout(12000) };
      upstream = await fetch(target, nextInit);
      const contentType = upstream.headers.get('content-type') || '';
      const htmlReady = upstream.ok && contentType.includes('text/html');
      if (!documentRequest || htmlReady || (upstream.status < 500 && upstream.status !== 404 && contentType.includes('text/html'))) {
        break;
      }
      if (isProbe && htmlReady) break;
      if (isProbe && !htmlReady) {
        await upstream.body?.cancel().catch(() => undefined);
        upstream = null;
      } else if (documentRequest && !htmlReady) {
        await upstream.body?.cancel().catch(() => undefined);
        upstream = null;
      } else {
        break;
      }
    } catch {
      upstream = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  if (!upstream) {
    if (isProbe || isAssetRequest(segments)) {
      return new Response('wait', {
        status: 503,
        headers: { 'retry-after': '1', 'cache-control': 'no-store' },
      });
    }
    return previewPage(
      'Opening the site',
      'The preview is still starting. This page will open the restaurant when it is ready.',
      logs(),
    );
  }

  if (isProbe) {
    const ok = upstream.ok && (upstream.headers.get('content-type') || '').includes('text/html');
    return new Response(ok ? 'ready' : 'wait', {
      status: ok ? 200 : 503,
      headers: { 'cache-control': 'no-store' },
    });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const out = copyHeaders(upstream, prefix, preview.port);
  const looksLikePlainError =
    !contentType.includes('text/html') &&
    (upstream.status >= 500 || /internal server error/i.test(contentType));

  if (documentRequest && (!upstream.ok || looksLikePlainError) && !contentType.includes('text/html')) {
    await upstream.text().catch(() => '');
    return previewPage(
      'Opening the site',
      'The preview is compiling. This page will open as soon as the restaurant is ready.',
      logs(),
    );
  }

  if (contentType.includes('text/html')) {
    let body = freezePreviewHtml(rewriteHtml(await upstream.text(), prefix, preview.port));
    const painted = await applyProjectEditsToHtml(body, projectPath, resolvedTemplate, copyPack);
    body = painted.html;
    if (copyPack && painted.count === 0) {
      const packed = await ensureCopySwaps(copyPack);
      body = injectLiveCopyOverlay(body, packed);
    }
    body = prioritizeLcpImage(body);
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
    return previewPage('Preview error', message, []);
  }
}

export const GET = safeProxy;
export const POST = safeProxy;
export const PUT = safeProxy;
export const PATCH = safeProxy;
export const DELETE = safeProxy;
export const HEAD = safeProxy;
export const OPTIONS = safeProxy;
