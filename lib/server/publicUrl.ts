export function publicAppOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '') ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    (process.env.FLY_APP_NAME ? `https://${process.env.FLY_APP_NAME}.fly.dev` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  return raw.replace(/\/$/, '');
}

export function usesPreviewProxy(): boolean {
  const origin = publicAppOrigin();
  return Boolean(origin && !/localhost|127\.0\.0\.1/.test(origin));
}

export function previewBasePath(projectId: string): string {
  return usesPreviewProxy() ? `/preview/${encodeURIComponent(projectId)}` : '';
}

export function previewIframeUrl(projectId: string, port: number): string {
  if (!usesPreviewProxy()) return `http://localhost:${port}`;
  return `/preview/${encodeURIComponent(projectId)}`;
}

export function previewPublicUrl(projectId: string, port: number): string {
  if (!usesPreviewProxy()) return `http://localhost:${port}`;
  return `${publicAppOrigin()}${previewBasePath(projectId)}`;
}

export function previewInternalUrl(projectId: string, port: number): string {
  const base = previewBasePath(projectId);
  return `http://127.0.0.1:${port}${base || '/'}`;
}
