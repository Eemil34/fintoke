export function parsePublicHttpUrl(value: string): string | null {
  const text = value.trim();
  if (!text) return null;

  try {
    const url = new URL(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text) ? text : `https://${text}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export function extractWebsiteUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (match) {
    return parsePublicHttpUrl(match[0].replace(/[),.;]+$/, ''));
  }
  return parsePublicHttpUrl(text);
}

export function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
