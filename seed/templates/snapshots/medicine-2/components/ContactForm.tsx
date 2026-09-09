'use client';

import { FormEvent, useState } from 'react';
import { site } from '@/lib/site';

const fieldClass =
  'w-full rounded-xl border-0 bg-brand-bg px-4 py-3.5 text-sm font-medium text-brand outline-none ring-1 ring-brand/8 transition placeholder:text-brand-muted/50 focus:ring-2 focus:ring-brand/25';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-[1.5rem] bg-brand-soft p-6 text-sm leading-6 text-brand ring-1 ring-brand/5">
        Thanks — your appointment request is noted. This is a demo form; connect a real backend before launch.
      </p>
    );
  }

  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-float ring-1 ring-brand/5 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Book a visit</p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-brand">Request an appointment</h2>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-brand">
          Full name
          <input required className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand">
          Email
          <input type="email" required className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand">
          Phone
          <input type="tel" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand">
          Preferred service
          <select className={fieldClass} defaultValue="Check-up">
            <option>Check-up</option>
            <option>Hygiene</option>
            <option>Whitening</option>
            <option>Emergency</option>
            <option>Anxiety visit</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand sm:col-span-2">
          Message
          <textarea
            required
            rows={4}
            placeholder="Tell us if you’re nervous or need same-day care…"
            className={`${fieldClass} resize-none`}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-brand-accent px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-105 sm:col-span-2"
        >
          {site.hero.cta}
        </button>
      </form>
    </div>
  );
}
