'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-box border border-brand-fg/10 bg-brand-surface p-6">
        Thanks — a Careevo specialist will follow up shortly. This is a demo form.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Name
        <input required className="rounded-xl border border-brand-fg/15 bg-brand-surface px-3 py-2.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Organization
        <input className="rounded-xl border border-brand-fg/15 bg-brand-surface px-3 py-2.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Email
        <input type="email" required className="rounded-xl border border-brand-fg/15 bg-brand-surface px-3 py-2.5" />
      </label>
      <label className="grid gap-1 text-sm">
        How can we help?
        <textarea required rows={5} className="rounded-xl border border-brand-fg/15 bg-brand-surface px-3 py-2.5" />
      </label>
      <button type="submit" className="rounded-button bg-brand px-5 py-3 text-sm font-semibold text-white">
        Request a consultation
      </button>
    </form>
  );
}
