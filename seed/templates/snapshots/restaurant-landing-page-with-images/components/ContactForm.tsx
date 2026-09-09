'use client';

import { FormEvent, useState } from 'react';

type ContactFormProps = {
  variant?: 'contact' | 'reservation';
};

export function ContactForm({ variant = 'contact' }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const isReservation = variant === 'reservation';

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-box border border-brand/30 bg-brand/10 p-6 text-sm leading-6">
        {isReservation
          ? 'Thank you — your request has been received. This is a demo; connect a real booking system before launch.'
          : 'Thanks — this is a demo form. Connect a real backend or form service before launch.'}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className={isReservation ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
        <label className="grid gap-1.5 text-sm">
          Name
          <input
            required
            className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          Email
          <input
            type="email"
            required
            className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
          />
        </label>
      </div>

      {isReservation ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              Preferred date
              <input
                type="date"
                required
                className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Guests
              <select
                required
                className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
                defaultValue="2"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            Dietary notes
            <textarea
              rows={3}
              placeholder="Allergies, vegetarian path, celebrations…"
              className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
            />
          </label>
        </>
      ) : (
        <label className="grid gap-1.5 text-sm">
          Message
          <textarea
            required
            rows={5}
            className="rounded-box border border-brand-fg/15 bg-brand-bg px-3 py-2.5 outline-none transition focus:border-brand/50"
          />
        </label>
      )}

      <button
        type="submit"
        className="rounded-button bg-brand px-5 py-3 text-sm font-medium text-brand-bg transition hover:bg-brand-accent"
      >
        {isReservation ? 'Send request' : 'Send message'}
      </button>
    </form>
  );
}
