import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import type { MailProvider, MailSettings, MailSettingsPatch, MailSmtpSettings, PublicMailSettings } from '@/types/workspace';
import { dataFile } from '@/lib/server/paths';

const SETTINGS_PATH = dataFile('mail.json');

const DEFAULT_SMTP: MailSmtpSettings = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
};

const DEFAULT_SETTINGS: MailSettings = {
  provider: 'smtp',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  smtp: { ...DEFAULT_SMTP },
  resendApiKey: '',
};

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asPort(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) return fallback;
  return parsed;
}

function envSettings(): MailSettingsPatch {
  const host = clean(process.env.SMTP_HOST);
  const user = clean(process.env.SMTP_USER || process.env.SMTP_USERNAME);
  const password = clean(process.env.SMTP_PASS || process.env.SMTP_PASSWORD);
  const fromEmail = clean(process.env.MAIL_FROM || process.env.SMTP_FROM);
  const fromName = clean(process.env.MAIL_FROM_NAME);
  const replyTo = clean(process.env.MAIL_REPLY_TO);
  const resendApiKey = clean(process.env.RESEND_API_KEY);
  const provider: MailProvider | undefined = resendApiKey && !host ? 'resend' : host ? 'smtp' : undefined;
  const smtpPatch = host || user || password || process.env.SMTP_PORT
    ? {
        host: host || undefined,
        port: process.env.SMTP_PORT ? asPort(process.env.SMTP_PORT, 465) : undefined,
        secure: process.env.SMTP_SECURE === 'false' ? false : process.env.SMTP_SECURE === 'true' ? true : undefined,
        user: user || undefined,
        password: password || undefined,
      }
    : undefined;

  return {
    ...(provider ? { provider } : {}),
    ...(fromName ? { fromName } : {}),
    ...(fromEmail ? { fromEmail } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(smtpPatch ? { smtp: smtpPatch } : {}),
    ...(resendApiKey ? { resendApiKey } : {}),
  };
}

function mergeSettings(base: MailSettings, patch: MailSettingsPatch): MailSettings {
  return {
    provider: patch.provider === 'resend' || patch.provider === 'smtp' ? patch.provider : base.provider,
    fromName: patch.fromName !== undefined ? clean(patch.fromName) : base.fromName,
    fromEmail: patch.fromEmail !== undefined ? clean(patch.fromEmail) : base.fromEmail,
    replyTo: patch.replyTo !== undefined ? clean(patch.replyTo) : base.replyTo,
    smtp: {
      ...base.smtp,
      ...(patch.smtp
        ? {
            host: patch.smtp.host !== undefined ? clean(patch.smtp.host) : base.smtp.host,
            port: patch.smtp.port !== undefined ? asPort(patch.smtp.port, base.smtp.port) : base.smtp.port,
            secure: patch.smtp.secure !== undefined ? Boolean(patch.smtp.secure) : base.smtp.secure,
            user: patch.smtp.user !== undefined ? clean(patch.smtp.user) : base.smtp.user,
            password: patch.smtp.password !== undefined ? String(patch.smtp.password) : base.smtp.password,
          }
        : {}),
    },
    resendApiKey: patch.resendApiKey !== undefined ? clean(patch.resendApiKey) : base.resendApiKey,
  };
}

async function readStoredSettings(): Promise<MailSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as MailSettingsPatch;
    return mergeSettings(DEFAULT_SETTINGS, parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { ...DEFAULT_SETTINGS, smtp: { ...DEFAULT_SMTP } };
    throw error;
  }
}

export async function loadMailSettings(): Promise<MailSettings> {
  const stored = await readStoredSettings();
  const env = envSettings();
  if (stored.smtp.host || stored.smtp.user || stored.smtp.password) {
    const { smtp: _smtp, ...rest } = env;
    return mergeSettings(stored, rest);
  }
  return mergeSettings(stored, env);
}

export function isMailConfigured(settings: MailSettings = DEFAULT_SETTINGS): boolean {
  if (settings.provider === 'resend') return Boolean(settings.resendApiKey && resolveFromMailbox(settings).email);
  return Boolean(resolveFromMailbox(settings).email && settings.smtp.host && settings.smtp.user && settings.smtp.password);
}

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function parseMailbox(value: string): { name: string; email: string } {
  const trimmed = value.trim().replace(/^mailto:/i, '');
  if (!trimmed) return { name: '', email: '' };
  const angled = trimmed.match(/^(?:"([^"]*)"|([^<]*))\s*<([^>]+)>\s*$/);
  if (angled) {
    const email = angled[3].trim();
    return {
      name: (angled[1] || angled[2] || '').trim(),
      email: EMAIL_RE.test(email) ? email : '',
    };
  }
  if (EMAIL_RE.test(trimmed)) return { name: '', email: trimmed };
  return { name: '', email: '' };
}

function quoteDisplayName(name: string): string {
  const cleaned = name.replace(/[\r\n<>]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~ .'-]+$/.test(cleaned) && !cleaned.includes(',')) {
    return cleaned;
  }
  return `"${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function resolveFromMailbox(settings: MailSettings): { name: string; email: string } {
  const fromField = parseMailbox(settings.fromEmail);
  const smtpField = parseMailbox(settings.smtp.user);
  return {
    name: (settings.fromName || '').trim() || fromField.name,
    email: fromField.email || smtpField.email,
  };
}

export function formatFromAddress(settings: MailSettings): string {
  const { name, email } = resolveFromMailbox(settings);
  if (!email) {
    throw new Error(
      'Set From email to a real address like you@yourdomain.com. Resend does not accept a name without an email, and the domain must be verified in Resend.',
    );
  }
  const display = quoteDisplayName(name);
  return display ? `${display} <${email}>` : email;
}

export function toPublicMailSettings(settings: MailSettings): PublicMailSettings {
  return {
    configured: isMailConfigured(settings),
    provider: settings.provider,
    fromName: settings.fromName,
    fromEmail: settings.fromEmail,
    replyTo: settings.replyTo,
    smtp: {
      host: settings.smtp.host,
      port: settings.smtp.port,
      secure: settings.smtp.secure,
      user: settings.smtp.user,
      hasPassword: Boolean(settings.smtp.password),
    },
    resend: {
      hasApiKey: Boolean(settings.resendApiKey),
    },
  };
}

export async function getPublicMailSettings(): Promise<PublicMailSettings> {
  return toPublicMailSettings(await loadMailSettings());
}

export async function updateMailSettings(input: MailSettingsPatch): Promise<PublicMailSettings> {
  return enqueue(async () => {
    const current = await readStoredSettings();
    const smtpPatch = input.smtp
      ? {
          ...input.smtp,
            password: input.smtp.password?.trim()
              ? input.smtp.password.replace(/\s+/g, '')
              : current.smtp.password,
        }
      : undefined;
    const next = mergeSettings(current, {
      ...input,
      smtp: smtpPatch,
      resendApiKey: input.resendApiKey !== undefined
        ? input.resendApiKey.trim() || current.resendApiKey
        : undefined,
    });
    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), 'utf8');
    return toPublicMailSettings(next);
  });
}

export function formatFromAddress(settings: MailSettings): string {
  const email = settings.fromEmail || settings.smtp.user;
  if (settings.fromName && email) return `${settings.fromName} <${email}>`;
  return email;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emailToHtml(body: string): string {
  const trimmed = body.trim();
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f3f0;color:#1f2937;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;padding:28px 32px;line-height:1.65;font-size:16px;">
      ${escapeHtml(body).replace(/\n/g, '<br>')}
    </div>
  </body>
</html>`;
}

function smtpAuthPassword(password: string): string {
  return password.replace(/\s+/g, '');
}

function isGmailHost(host: string): boolean {
  return /(^|\.)gmail\.com$/i.test(host.trim());
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function createSmtpTransport(settings: MailSettings) {
  const host = (settings.smtp.host || 'smtp.gmail.com').trim();
  const port = settings.smtp.port || 587;
  const secure = port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: settings.smtp.user,
      pass: smtpAuthPassword(settings.smtp.password),
    },
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 8_000,
  } as Parameters<typeof nodemailer.createTransport>[0]);
}

function withGmailPortFallback(settings: MailSettings): MailSettings[] {
  const variants: MailSettings[] = [
    {
      ...settings,
      smtp: { ...settings.smtp, port: 587, secure: false },
    },
  ];
  if (!isGmailHost(settings.smtp.host) && settings.smtp.port && settings.smtp.port !== 587) {
    variants.unshift(settings);
  }
  variants.push({
    ...settings,
    smtp: { ...settings.smtp, port: 465, secure: true },
  });
  return variants;
}

function explainSmtpFailure(error: unknown): string {
  const err = error as { message?: string; code?: string; response?: string };
  const detail = [err.code, err.message, err.response].filter(Boolean).join(' — ') || 'SMTP send failed';
  if (
    err.code === 'ETIMEDOUT' ||
    err.code === 'ESOCKET' ||
    err.code === 'ECONNECTION' ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND' ||
    /timeout|timed out|blocked|connect/i.test(detail)
  ) {
    return `Could not reach Gmail SMTP from this server (${detail}). Railway often blocks ports 587 and 465. Use the Resend tab with a free API key from resend.com — that sends over HTTPS and works here.`;
  }
  return `Gmail/SMTP rejected the message: ${detail}. Use an App Password (not your normal Gmail password), smtp.gmail.com, port 587, and the full Gmail address as username. If this keeps failing, switch to Resend.`;
}

export async function deliverEmail(input: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<{ from: string; provider: MailProvider }> {
  const settings = await loadMailSettings();
  if (!isMailConfigured(settings)) {
    throw new Error(
      'Email sending is not configured. Open Dashboard → Emails → Sending and add SMTP or a Resend API key.',
    );
  }

  const from = formatFromAddress(settings);
  const html = emailToHtml(input.body);

  if (settings.provider === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        reply_to: input.replyTo || settings.replyTo || undefined,
        subject: input.subject,
        text: input.body,
        html,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || `Resend rejected the email (${response.status})`);
    }
    return { from, provider: 'resend' };
  }

  let lastError: unknown;
  for (const variant of withGmailPortFallback(settings)) {
    try {
      const transporter = createSmtpTransport(variant);
      await withTimeout(
        transporter.sendMail({
          from,
          to: input.to,
          replyTo: input.replyTo || settings.replyTo || undefined,
          subject: input.subject,
          text: input.body,
          html,
        }),
        12_000,
        'Mail server did not respond within 12 seconds.',
      );
      return { from, provider: 'smtp' };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(explainSmtpFailure(lastError));
}

export async function verifyMailConnection(): Promise<{ ok: boolean; provider: MailProvider; from: string }> {
  const settings = await loadMailSettings();
  if (!isMailConfigured(settings)) {
    throw new Error('Add a from address and SMTP or Resend credentials first.');
  }

  if (settings.provider === 'resend') {
    const response = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${settings.resendApiKey}` },
    });
    if (!response.ok) {
      throw new Error('Resend API key was rejected. Check the key in Sending settings.');
    }
    return { ok: true, provider: 'resend', from: formatFromAddress(settings) };
  }

  const from = formatFromAddress(settings);
  let lastError: unknown;
  for (const variant of withGmailPortFallback(settings)) {
    try {
      const transporter = createSmtpTransport(variant);
      await withTimeout(
        transporter.sendMail({
          from,
          to: settings.fromEmail || settings.smtp.user,
          subject: 'Fintoke test email',
          text: 'This is a Fintoke test. If you received it, sending works.',
          html: emailToHtml('This is a Fintoke test. If you received it, sending works.'),
        }),
        12_000,
        'Mail server did not respond within 12 seconds.',
      );
      return { ok: true, provider: 'smtp', from };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(explainSmtpFailure(lastError));
}
