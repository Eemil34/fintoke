import fs from 'fs/promises';
import path from 'path';
import type { FastCopyFile } from './fastPreview';

const SKIP_DIR = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'public']);
const SKIP_COMPONENTS = new Set(['ImageGuard', 'Fragment']);
const UNWRAP_COMPONENTS = new Set(['Reveal']);
const FONT_PACKS: Record<string, string> = {
  Playfair_Display: 'Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400',
  DM_Sans: 'DM+Sans:ital,wght@0,400;0,600;0,700;1,400',
  Cormorant_Garamond: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400',
  Outfit: 'Outfit:wght@300;400;500;600',
  Syne: 'Syne:wght@600;700;800',
  Figtree: 'Figtree:wght@400;500;600;700',
  Inter: 'Inter:wght@400;500;600;700',
};

function unsplash(id: string, width = 1200): string {
  const photo = id.startsWith('photo-') || id.startsWith('http') ? id : `photo-${id}`;
  if (photo.startsWith('http')) return photo;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=72`;
}

function sliceBalanced(source: string, openIndex: number): string {
  const open = source[openIndex];
  const close = open === '{' ? '}' : open === '[' ? ']' : open === '(' ? ')' : '';
  if (!close) return '';
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, i);
    }
  }
  return source.slice(openIndex + 1);
}

function lastReturnJsx(source: string): string {
  const idx = Math.max(source.lastIndexOf('return ('), source.lastIndexOf('return('));
  if (idx < 0) return '';
  const start = source.indexOf('(', idx);
  return sliceBalanced(source, start).trim();
}

function getPath(value: unknown, pathName: string): unknown {
  return pathName.split('.').reduce<unknown>((current, key) => {
    if (current == null) return undefined;
    if (Array.isArray(current) && /^\d+$/.test(key)) return current[Number(key)];
    if (typeof current === 'object') return (current as Record<string, unknown>)[key];
    return undefined;
  }, value);
}

function evalData(source: string): unknown {
  try {
    const cleaned = source
      .replace(/as const/g, '')
      .replace(/satisfies\s+[^,\n]+/g, '')
      .replace(/\$\{([^}]+)\}/g, (_, expr: string) => {
        if (expr.includes('w')) return '800';
        return '';
      });
    return new Function('img', 'unsplash', `return (${cleaned})`)(
      (id: string, w?: number) => unsplash(id, w),
      unsplash,
    );
  } catch {
    return undefined;
  }
}

function parseSite(source: string): Record<string, unknown> {
  const match = source.match(/export const site\s*=\s*(\{[\s\S]*\});?/);
  if (!match) return {};
  const value = evalData(
    match[1]
      .replace(/unsplash\(/g, 'unsplash(')
      .replace(/import[\s\S]*?;/g, ''),
  );
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function collectConsts(source: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const re = /const\s+([A-Z][A-Z0-9_]*)\s*=\s*(\[[\s\S]*?\])\s*(?:as const)?;/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const value = evalData(match[2]);
    if (value !== undefined) out[match[1]] = value;
  }
  return out;
}

function fileNameToExport(filePath: string): string[] {
  const base = path.basename(filePath).replace(/\.(tsx|ts|jsx|js)$/, '');
  return [base, base.replace(/[^A-Za-z0-9]/g, '')];
}

async function listSourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIR.has(entry.name) || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(tsx|ts)$/.test(entry.name)) continue;
      if (/imageLibrary|next-env|tailwind\.config/.test(entry.name)) continue;
      files.push(full);
    }
  };
  await walk(root);
  return files;
}

function extractTailwindExtend(config: string): string {
  const idx = config.indexOf('extend:');
  if (idx < 0) return '';
  const start = config.indexOf('{', idx);
  return `{${sliceBalanced(config, start)}}`;
}

function googleFonts(layout: string): string {
  const found = Object.keys(FONT_PACKS).filter((name) => layout.includes(name));
  const fromLinks = [...layout.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/g)].map((m) => m[1]);
  if (fromLinks[0]) return fromLinks[0];
  if (!found.length) return 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap';
  return `https://fonts.googleapis.com/css2?${found.map((name) => `family=${FONT_PACKS[name]}`).join('&')}&display=swap`;
}

function lookup(expr: string, scope: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('`') && trimmed.endsWith('`')) return trimmed.slice(1, -1);
  const or = trimmed.split(/\s*\|\|\s*/);
  if (or.length > 1) {
    for (const part of or) {
      const value = lookup(part, scope);
      if (value) return value;
    }
  }
  return getPath(scope, trimmed.replace(/\?\.?/g, '.').replace(/\[(\d+)\]/g, '.$1'));
}

function stringify(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function expandMaps(jsx: string, scope: Record<string, unknown>): string {
  const marker = '.map(';
  let next = jsx;
  for (let guard = 0; guard < 12; guard += 1) {
    const idx = next.indexOf(marker);
    if (idx < 0) break;
    let start = idx;
    while (start > 0 && /[\w.?[\]]/.test(next[start - 1] || '')) start -= 1;
    const expr = next.slice(start, idx);
    const paren = next.indexOf('(', idx);
    const inner = sliceBalanced(next, paren);
    const list = lookup(expr, scope);
    const arrow = inner.match(/^\s*\(?\s*(\w+)(?:\s*,\s*(\w+))?/);
    const itemName = arrow?.[1] || 'item';
    const indexName = arrow?.[2] || 'index';
    const bodyIdx = inner.lastIndexOf('=>');
    let body = inner.slice(bodyIdx + 2).trim();
    if (body.startsWith('(')) body = sliceBalanced(body, 0);
    else body = body.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
    const items = Array.isArray(list) ? list : [];
    const rendered = items
      .map((item, index) =>
        interpolate(body, { ...scope, [itemName]: item, [indexName]: index, item, index }),
      )
      .join('\n');
    const from = next.lastIndexOf('{', start);
    let to = paren + inner.length + 1;
    while (to < next.length && next[to] !== '}') to += 1;
    next = `${next.slice(0, from >= 0 ? from : start)}${rendered}${next.slice(to + 1)}`;
  }
  return next;
}

function interpolate(jsx: string, scope: Record<string, unknown>): string {
  let next = expandMaps(jsx, scope);
  next = next.replace(/className=\{`([\s\S]*?)`\}/g, (_, tpl: string) => {
    const value = tpl.replace(/\$\{([^}]+)\}/g, (__: string, expr: string) => {
      const ternary = expr.match(/\?\s*(['"`])([\s\S]*?)\1\s*:\s*(['"`])([\s\S]*?)\3/);
      if (ternary) return ternary[4];
      return stringify(lookup(expr, scope));
    });
    return `className="${value.replace(/\s+/g, ' ').trim()}"`;
  });
  next = next.replace(/\{([^{}]+)\}/g, (full, expr: string) => {
    const trimmed = expr.trim();
    if (!trimmed || trimmed.startsWith('...') || trimmed.startsWith('/*')) return '';
    if (trimmed.startsWith('new ') || trimmed.includes('=>') || trimmed.includes('(') && !trimmed.startsWith('site.') && !trimmed.startsWith('item.')) {
      if (/^(site|item|pack|page)\.[\w.?[\]]+$/.test(trimmed)) return stringify(lookup(trimmed, scope));
      return '';
    }
    if (/^['"`]/.test(trimmed)) return stringify(lookup(trimmed, scope));
    if (/^[A-Za-z_$][\w.?[\]]*$/.test(trimmed) || /^(site|item|page|link|feature)\.[\w.?[\]]+$/.test(trimmed)) {
      return stringify(lookup(trimmed, scope));
    }
    return full.includes('className') ? full : stringify(lookup(trimmed, scope));
  });
  return next;
}

function siteImageToImg(html: string): string {
  return html.replace(/<SiteImage\b([^>]*)\/>/g, (_, attrs: string) => {
    const src = attrs.match(/\ssrc="([^"]+)"/)?.[1] || attrs.match(/\ssrc='([^']+)'/)?.[1] || '';
    const alt = attrs.match(/\salt="([^"]*)"/)?.[1] || '';
    const cls = attrs.match(/\sclass(?:Name)?="([^"]*)"/)?.[1] || 'object-cover';
    const fill = /\sfill\b/.test(attrs);
    const extra = fill ? ' style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"' : '';
    return `<img src="${src}" alt="${alt}" class="${cls}" decoding="async" referrerpolicy="origin"${extra} />`;
  });
}

function toHtml(jsx: string): string {
  let html = jsx;
  html = html.replace(/<>/g, '<div>').replace(/<\/>/g, '</div>');
  html = html.replace(/<Link\b/g, '<a').replace(/<\/Link>/g, '</a>');
  html = html.replace(/\shref="\/(?:reservation|menu|about|contact)[^"]*"/g, ' href="#visit"');
  html = html.replace(/\shref="\/"/g, ' href="#top"');
  html = html.replace(/className=/g, 'class=');
  html = html.replace(/htmlFor=/g, 'for=');
  html = html.replace(/\s(onClick|onScroll|onChange|onSubmit|ref|key|fill|priority|sizes|as|delay)=\{[\s\S]*?\}/g, '');
  html = html.replace(/\s(onClick|onScroll|onChange|onSubmit|ref|key)=("[^"]*"|'[^']*')/g, '');
  html = html.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  html = html.replace(/\s{2,}/g, ' ');
  html = siteImageToImg(html);
  return html;
}

function unwrap(jsx: string, name: string): string {
  const re = new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)<\\/${name}>`, 'g');
  return jsx.replace(re, '$2');
}

function inlineComponents(jsx: string, components: Record<string, string>, scope: Record<string, unknown>, depth = 0): string {
  if (depth > 8) return jsx;
  let next = jsx;
  for (const name of UNWRAP_COMPONENTS) next = unwrap(next, name);
  next = next.replace(/<([A-Z][A-Za-z0-9.]*)\b([^>]*)\/>/g, (full, name: string) => {
    if (SKIP_COMPONENTS.has(name) || name === 'SiteImage') return full;
    const source = components[name];
    if (!source) return '';
    return inlineComponents(interpolate(lastReturnJsx(source), scope), components, scope, depth + 1);
  });
  next = next.replace(/<([A-Z][A-Za-z0-9.]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (full, name: string, _attrs: string, children: string) => {
    if (SKIP_COMPONENTS.has(name) || name === 'SiteImage') return full;
    if (UNWRAP_COMPONENTS.has(name)) return children;
    const source = components[name];
    if (!source) return children;
    const body = lastReturnJsx(source).replace(/\{children\}/g, children);
    return inlineComponents(interpolate(body, scope), components, scope, depth + 1);
  });
  return next;
}

export async function renderSnapshotPreviewHtml(projectPath: string, pack: FastCopyFile): Promise<string | null> {
  const pagePath = path.join(projectPath, 'app', 'page.tsx');
  const page = await fs.readFile(pagePath, 'utf8').catch(() => '');
  if (!page) return null;
  const layout = await fs.readFile(path.join(projectPath, 'app', 'layout.tsx'), 'utf8').catch(() => '');
  const css = await fs.readFile(path.join(projectPath, 'app', 'globals.css'), 'utf8').catch(() => '');
  const tw = await fs.readFile(path.join(projectPath, 'tailwind.config.ts'), 'utf8').catch(() => '');
  const siteSource = await fs.readFile(path.join(projectPath, 'lib', 'site.ts'), 'utf8').catch(() => '');
  const files = await listSourceFiles(projectPath);
  const components: Record<string, string> = {};
  let consts: Record<string, unknown> = collectConsts(page);
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    consts = { ...consts, ...collectConsts(source) };
    const names = [
      ...fileNameToExport(file),
      ...(source.match(/export function ([A-Z][A-Za-z0-9]*)/g) || []).map((row) => row.replace('export function ', '')),
      ...(source.match(/export const ([A-Z][A-Za-z0-9]*)/g) || []).map((row) => row.replace('export const ', '')),
    ];
    for (const name of names) components[name] = source;
  }
  const site = parseSite(siteSource);
  const scope: Record<string, unknown> = { ...consts, site, pack };
  let jsx = lastReturnJsx(page);
  if (!jsx) return null;
  jsx = inlineComponents(jsx, components, scope);
  jsx = interpolate(jsx, scope);
  let body = toHtml(jsx);
  if (body.length < 400) return null;
  const extraCss = css.replace(/@tailwind[^;]+;/g, '').replace(/@apply[^;]+;/g, '');
  const useTailwind = /@tailwind/.test(css);
  const extend = extractTailwindExtend(tw);
  const tailwind = useTailwind
    ? `<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:${extend || '{colors:{brand:{bg:"#f5f3ef",fg:"#1c1c1c",muted:"#6b6560",accent:"#3d4a52"}}}'}}}</script>`
    : '';
  const bodyClass =
    layout.match(/<body\s+className="([^"]*)"/)?.[1] ||
    layout.match(/<body\s+className=\{`([^`]+)`\}/)?.[1]?.replace(/\$\{[^}]+\}/g, '') ||
    '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="origin" />
  <title>${pack.name.replace(/</g, '')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://images.unsplash.com" />
  <link href="${googleFonts(layout)}" rel="stylesheet" />
  ${tailwind}
  <style>
    html,body{margin:0}
    img{max-width:100%;display:block}
    ${extraCss}
  </style>
</head>
<body${bodyClass ? ` class="${bodyClass.replace(/\s+/g, ' ').trim()}"` : ''}>
${body}
</body>
</html>`;
}
