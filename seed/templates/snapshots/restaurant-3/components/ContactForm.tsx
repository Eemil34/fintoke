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
      <p className="border border-brand-fg/10 bg-brand-surface px-6 py-8 text-sm leading-6">
        Thank you — your reservation request has been received. This is a demo form; connect a booking service before launch.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        Name
        <input required className="border border-brand-fg/15 bg-transparent px-3 py-2.5 outline-none focus:border-brand-fg" />
      </label>
      <label className="grid gap-1.5 text-sm">
        Email
        <input type="email" required className="border border-brand-fg/15 bg-transparent px-3 py-2.5 outline-none focus:border-brand-fg" />
      </label>
      <label className="grid gap-1.5 text-sm">
        Guests
        <input type="number" min={1} max={12} defaultValue={2} className="border border-brand-fg/15 bg-transparent px-3 py-2.5 outline-none focus:border-brand-fg" />
      </label>
      <label className="grid gap-1.5 text-sm">
        Preferred date & notes
        <textarea required rows={4} className="border border-brand-fg/15 bg-transparent px-3 py-2.5 outline-none focus:border-brand-fg" />
      </label>
      <button
        type="submit"
        className="mt-2 rounded-button border border-brand-fg px-6 py-2.5 text-sm transition-colors hover:bg-brand-fg hover:text-brand-bg"
      >
        Request reservation
      </button>
    </form>
  );
}
