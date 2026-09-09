'use client';

import { FormEvent, useState } from 'react';

const TIMES = [
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM',
];

const field =
  'w-full border border-ink/15 bg-cream-soft/90 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40';

export function ReservationForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-sm bg-cream border border-ink/10 p-8 md:p-10 text-center text-ink shadow-[0_12px_40px_rgba(26,20,16,0.06)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-muted">Confirmed</p>
        <h3 className="mt-3 font-display text-3xl tracking-[0.08em]">Table Held</h3>
        <p className="mx-auto mt-4 max-w-sm font-display text-base leading-relaxed text-ink-soft">
          Thank you — our host will email you shortly to finalize your evening at Veloura.
        </p>
        <button
          type="button"
          className="link-arrow mt-8 text-ink"
          onClick={() => setSent(false)}
        >
          Make another reservation
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-sm bg-cream border border-ink/10 p-6 sm:p-8 md:p-10 text-ink shadow-[0_12px_40px_rgba(26,20,16,0.06)]"
    >
      <div className="text-center md:text-left">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-muted">Reservations</p>
        <h3 className="mt-2 font-display text-3xl md:text-4xl tracking-[0.1em]">Book a Table</h3>
        <p className="mt-3 max-w-md font-display text-sm leading-relaxed text-ink-soft">
          Evenings from 5 PM. Private dining and lounge seating available on request.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left">
          <tbody>
            <tr className="border-b border-ink/10">
              <th scope="row" className="w-[34%] py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Date
              </th>
              <td className="py-3">
                <input name="date" type="date" required className={field} />
              </td>
            </tr>
            <tr className="border-b border-ink/10">
              <th scope="row" className="py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Time
              </th>
              <td className="py-3">
                <select name="time" required defaultValue="" className={field}>
                  <option value="" disabled>
                    Select a time
                  </option>
                  {TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr className="border-b border-ink/10">
              <th scope="row" className="py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Guests
              </th>
              <td className="py-3">
                <select name="guests" required defaultValue="2" className={field}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr className="border-b border-ink/10">
              <th scope="row" className="py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Name
              </th>
              <td className="py-3">
                <input name="name" type="text" required placeholder="Full name" className={field} />
              </td>
            </tr>
            <tr className="border-b border-ink/10">
              <th scope="row" className="py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Email
              </th>
              <td className="py-3">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={field}
                />
              </td>
            </tr>
            <tr className="border-b border-ink/10">
              <th scope="row" className="py-3 pr-3 align-middle text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Phone
              </th>
              <td className="py-3">
                <input name="phone" type="tel" placeholder="+1 (555) 000-0000" className={field} />
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 align-top text-[11px] uppercase tracking-[0.18em] text-ink-muted font-normal">
                Notes
              </th>
              <td className="py-3">
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Occasion, seating preference, allergies…"
                  className={`${field} resize-y`}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-cream transition hover:bg-ink-soft sm:w-auto"
      >
        Reserve Table
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 12 L12 4 M6.5 4 H12 V9.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
