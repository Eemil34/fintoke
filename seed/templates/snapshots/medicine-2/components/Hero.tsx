'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

const fieldClass =
  'w-full rounded-xl border-0 bg-brand-bg px-4 py-3.5 text-sm font-medium text-brand outline-none ring-1 ring-brand/8 transition placeholder:text-brand-muted/50 focus:ring-2 focus:ring-brand/25';

export function Hero() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="px-5 pb-8 pt-6 md:pb-12 md:pt-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
        <div className="relative min-h-[480px] md:min-h-[540px]">
          <SiteImage
            src={unsplash('photo-1559839734-2b71ea197ec2', 1600)}
            alt="Smiling dental clinician"
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand/85 via-brand/55 to-brand/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/55 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-6 py-16 md:px-12 md:py-20">
            <p className="animate-fade-up inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              <span className="text-brand-accent">★</span> {site.hero.eyebrow}
            </p>
            <h1 className="animate-fade-up-delay mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.4rem]">
              {site.hero.title}
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-md text-base leading-7 text-white/85 md:text-lg">
              {site.hero.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-14 max-w-6xl md:-mt-16">
        <div className="grid gap-4 lg:grid-cols-[1.65fr_0.85fr]">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-float ring-1 ring-brand/5 md:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Book a visit</p>
                <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-brand md:text-2xl">
                  Request an appointment
                </h2>
              </div>
              <p className="text-sm text-brand-muted">{site.hours}</p>
            </div>

            {sent ? (
              <p className="rounded-xl bg-brand-soft px-5 py-8 text-sm leading-6 text-brand">
                Thanks — your request is noted. This is a demo form; connect a booking backend before launch.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-brand">
                  Full name
                  <input required name="name" placeholder="Alex Nieminen" className={fieldClass} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-brand">
                  Service
                  <select name="service" className={fieldClass} defaultValue="Check-up">
                    <option>Check-up</option>
                    <option>Hygiene</option>
                    <option>Whitening</option>
                    <option>Emergency</option>
                    <option>Anxiety visit</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-brand">
                  Preferred date
                  <input required type="date" name="date" className={fieldClass} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-brand">
                  Phone
                  <input required name="phone" type="tel" placeholder="+358 …" className={fieldClass} />
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-accent px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-105 sm:col-span-2"
                >
                  Book Appointment
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-[1.5rem] bg-brand p-6 text-white shadow-float md:p-8">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
                </svg>
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Prefer to call?</p>
              <a
                href={`tel:${site.phone.replace(/\s/g, '')}`}
                className="mt-2 block font-display text-2xl font-semibold tracking-tight"
              >
                {site.phone}
              </a>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Same-day slots when available. Mention if you need a longer anxiety-friendly visit.
              </p>
            </div>
            <Link
              href="/appointment"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-center text-sm font-bold text-brand transition hover:bg-brand-soft"
            >
              Request assistance
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
