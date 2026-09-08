import { NextRequest, NextResponse } from 'next/server';
import { deliverEmail } from '@/lib/services/mail';

const INBOX = process.env.CONTACT_TO?.trim() || 'projects@fintoke.com';

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (clean(body.company, 80)) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 200);
    const message = clean(body.message, 8000);
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    await deliverEmail({
      to: INBOX,
      replyTo: email,
      subject: `Fintoke inquiry from ${name}`,
      body: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send the message.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
