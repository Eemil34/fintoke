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
      <p className="rounded-2xl border border-brand-fg/10 bg-brand-soft p-6 text-sm leading-6">
        Thanks — your request was recorded in this demo. Our care desk will confirm a real booking once a backend is connected.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium">
        Full name
        <input required className="rounded-xl border border-brand-fg/15 bg-brand-soft px-3 py-2.5 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          required
          className="rounded-xl border border-brand-fg/15 bg-brand-soft px-3 py-2.5 font-normal"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Preferred department
        <input
          placeholder="Emergency, Surgery, Clinics…"
          className="rounded-xl border border-brand-fg/15 bg-brand-soft px-3 py-2.5 font-normal"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        How can we help?
        <textarea required rows={5} className="rounded-xl border border-brand-fg/15 bg-brand-soft px-3 py-2.5 font-normal" />
      </label>
      <button
        type="submit"
        className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
      >
        Request Appointment
      </button>
    </form>
  );
}
