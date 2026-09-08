export const ADMIN_COOKIE = 'claudable_admin';

function secret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || 'claudable-local-secret';
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || 'admin';
}

export function adminCookieOptions(overrides: Record<string, unknown> = {}) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    ...overrides,
  };
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toHex(signature);
}

export async function signAdminToken() {
  const issued = Date.now().toString();
  const mac = await hmacHex(issued);
  return `${issued}.${mac}`;
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const [issued, mac] = token.split('.');
  if (!issued || !mac) return false;
  const expected = await hmacHex(issued);
  if (!timingSafeEqualHex(mac, expected)) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age < 1000 * 60 * 60 * 24 * 30;
}
