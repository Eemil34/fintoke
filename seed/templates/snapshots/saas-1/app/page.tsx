'use client';

import { SiteImage } from '@/components/SiteImage';
import { Reveal } from '@/components/Reveal';
import { HeroDashboard } from '@/components/HeroDashboard';
import { BenefitsGrid } from '@/components/BenefitsGrid';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { unsplash } from '@/lib/imageLibrary';

const nav = [
  { label: 'Home', href: '#home' },
  { label: 'Works', href: '#works' },
  { label: 'Services', href: '#benefits' },
  { label: 'Contact', href: '#contact' },
];

export default function Home() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-white">
        {/* HERO — matches reference: dark navy + glow, left copy, large product UI, fade to white */}
        <header id="home" className="hero-shell text-white">
          <nav className="relative z-30 mx-auto flex max-w-[1120px] items-center justify-between px-5 py-5 md:px-8 md:py-6">
            <a href="#home" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 21l1.9-5.1A8.5 8.5 0 1121 11.5z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-display text-[1.45rem] font-extrabold tracking-tight lowercase">
                cue
              </span>
            </a>

            <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[13px] font-medium text-white/65 md:flex">
              {nav.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7577f5]"
            >
              Book a demo
            </a>
          </nav>

          <div className="relative z-20 mx-auto flex max-w-[1120px] flex-col items-center px-5 pb-0 pt-8 md:px-8 md:pt-12">
            <div className="relative z-20 mx-auto max-w-[720px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b4b9ff] md:text-xs">
                AI Powered Customer Service
              </p>
              <h1 className="font-display mt-5 text-[2.35rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[2.85rem] md:text-[3.35rem] lg:text-[3.6rem]">
                Spend{' '}
                <span className="bg-gradient-to-r from-[#a5b4fc] via-white to-[#c4b5fd] bg-clip-text text-transparent">
                  10x less time
                </span>{' '}
                responding to Customer Queries with Cue
              </h1>
              <p className="mx-auto mt-5 max-w-[540px] text-[15px] leading-[1.7] text-[#a8aabe] md:text-lg">
                Say goodbye to bottlenecks and repetitive tasks. Cue streamlines customer
                conversations with advanced automation and one omnichannel inbox.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="rounded-xl bg-[#6366f1] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_40px_-10px_rgba(99,102,241,0.75),0_0_0_1px_rgba(255,255,255,0.08)_inset] transition hover:bg-[#7577f5]"
                >
                  Book a demo
                </a>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                  <MetaBadge />
                  <span className="text-[13px] font-medium text-white/85">Meta Business Partner</span>
                </div>
              </div>
            </div>

            <div className="relative z-20 mt-14 w-full px-1 sm:mt-16 md:mt-20 md:px-4">
              <HeroDashboard />
            </div>
          </div>

          <div className="hero-fade z-10" />
          <div className="relative z-0 h-20 md:h-28" aria-hidden />
        </header>

        {/* Logo bar on white — as in reference */}
        <section className="bg-white px-5 pb-6 pt-2 md:px-8">
          <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[#9ca3af] md:justify-between md:gap-x-6">
            <BrandWord mark="spotify" />
            <BrandWord mark="gumroad" />
            <BrandWord mark="google" />
            <BrandWord mark="asana" />
            <BrandWord mark="webflow" />
          </div>
        </section>

        <section id="benefits" className="bg-white px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6366f1]">
                Benefits of Cue
              </p>
              <h2 className="font-display mx-auto mt-3 max-w-2xl text-center text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
                <span className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent">
                  Automate, manage
                </span>{' '}
                and scale customer conversations
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-center text-base leading-relaxed text-[#6b7280]">
                Answer routine queries instantly and accurately. Your team stays focused. Your
                customers stay happy.
              </p>
            </Reveal>

            <Reveal delay={2}>
              <BenefitsGrid />
            </Reveal>
          </div>
        </section>

        <section id="works" className="bg-[#f6f7fb] px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6366f1]">
                How it works
              </p>
              <h2 className="font-display mx-auto mt-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
                Live in days, not months
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-base text-[#6b7280]">
                Connect channels, train Cue on your brand voice, and start converting conversations
                automatically.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Connect your channels',
                  body: 'Link WhatsApp, Instagram, Messenger and email in a few clicks — no engineering required.',
                  src: unsplash('photo-1553877522-43269d4ea984', 900),
                  alt: 'Laptop with product UI',
                },
                {
                  step: '02',
                  title: 'Train Cue on your brand',
                  body: 'Upload FAQs, product details and tone guidelines. Cue learns your voice in minutes.',
                  src: unsplash('photo-1519389950473-47ba0277781c', 900),
                  alt: 'Product team at work',
                },
                {
                  step: '03',
                  title: 'Watch conversations convert',
                  body: 'Automate routine replies and escalate high-intent leads to humans with full context.',
                  src: unsplash('photo-1460925895917-afdab827c52f', 900),
                  alt: 'Analytics on a screen',
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={(i + 1) as 1 | 2 | 3}>
                  <article className="group overflow-hidden rounded-[28px] border border-[#e8eaf0] bg-white shadow-[0_22px_55px_-28px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(99,102,241,0.25)]">
                    <div className="relative h-48 overflow-hidden">
                      <SiteImage
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      <span className="absolute bottom-3 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#6366f1]">
                        {item.step}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#0f172a]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{item.body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#eef0f5] bg-white px-5 py-14 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-3">
            {[
              { value: '10x', label: 'Faster first replies' },
              { value: '68%', label: 'Tickets resolved by AI' },
              { value: '2.4x', label: 'More conversations converted' },
            ].map((stat) => (
              <Reveal key={stat.label}>
                <p className="font-display text-4xl font-extrabold tracking-tight text-[#0f172a] md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-[#6b7280]">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-8 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#6366f1" aria-hidden>
                    <path d="M12 2l2.9 6.6L22 10l-5 4.6L18.2 22 12 18.4 5.8 22 7 14.6 2 10l7.1-1.4L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="font-display text-2xl font-semibold leading-snug text-[#4a5fd9] md:text-[1.85rem] md:leading-relaxed">
                “Cue helped us handle repetitive enquiries instantly, boost test drive bookings, and
                cut our drop-off rate in half — all while freeing up our team to focus on serious
                buyers.”
              </p>
              <footer className="mt-10 flex flex-col items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-[#eef0f8]">
                  <SiteImage
                    src={unsplash('photo-1573496359142-b8d87734a5a2', 200)}
                    alt="Professional woman"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Head of Customer Experience</p>
                  <ToyotaMark />
                </div>
              </footer>
            </blockquote>
          </Reveal>
        </section>

        <section id="contact" className="px-5 pb-12 md:px-8">
          <Reveal>
            <div className="hero-shell relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white md:px-12 md:py-24">
              <div className="relative z-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b4b9ff]">
                  Get started
                </p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  Ready to spend less time on replies?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-white/65 md:text-lg">
                  Book a 20-minute demo and see how Cue can automate your customer inbox this week.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="mailto:hello@cue.app"
                    className="inline-flex rounded-xl bg-[#6366f1] px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[#6366f1]/40 transition hover:bg-[#7577f5]"
                  >
                    Book a demo
                  </a>
                  <a
                    href="#benefits"
                    className="inline-flex rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
                  >
                    See benefits
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-[#e8eaf0] px-5 py-8 md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#6b7280] md:flex-row">
            <span className="font-display text-lg font-bold lowercase text-[#0f172a]">cue</span>
            <p>© {new Date().getFullYear()} Cue. AI powered customer service.</p>
            <div className="flex gap-6">
              <a href="#benefits" className="hover:text-[#0f172a]">
                Services
              </a>
              <a href="#works" className="hover:text-[#0f172a]">
                Works
              </a>
              <a href="#contact" className="hover:text-[#0f172a]">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}

function BrandWord({ mark }: { mark: string }) {
  const labels: Record<string, string> = {
    spotify: 'Spotify',
    gumroad: 'Gumroad',
    google: 'Google',
    asana: 'asana',
    webflow: 'webflow',
  };
  return (
    <span className="font-display text-[15px] font-bold tracking-tight opacity-50 md:text-lg">
      {labels[mark]}
    </span>
  );
}

function MetaBadge() {
  return (
    <svg width="22" height="14" viewBox="0 0 40 24" aria-hidden>
      <path
        fill="#0668E1"
        d="M8.5 4C4.4 4 1.5 7.6 1.5 13S5 22 9.8 22c2.4 0 4.1-1.2 5.5-3.2C16.6 20.8 18.5 22 21 22c4.8 0 8.3-4.4 8.3-9.8S26.6 2.5 21.8 2.5c-2.2 0-4 1-5.3 2.8C15.1 3.3 13.2 2 10.8 2 6.2 2 2.5 6.2 2.5 12"
        opacity="0"
      />
      <path
        fill="#0668E1"
        d="M27.2 3.2c-3.6 0-6 2.7-7.2 5.4C18.7 5.4 16 2.8 12 2.8 7.2 2.8 4 6.6 4 12.2c0 5.8 3.6 9.6 8.2 9.6 2.6 0 4.6-1.3 6-3.6 1.1 2.5 3.4 3.6 5.8 3.6 5.2 0 8.8-4.2 8.8-9.8 0-5.4-3.4-8.8-5.6-8.8zm-13.6 15c-2.8 0-4.6-2.4-4.6-6s1.8-6 4.6-6c2.6 0 4.4 2.2 5.2 4.6-.6 1.8-1.6 3.6-2.8 5-.8 1.2-1.6 2.4-2.4 2.4zm10.2 0c-.8 0-1.6-1-2.4-2.2-1.2-1.6-2.2-3.4-2.8-5.2.8-2.2 2.6-4.4 5.2-4.4 2.2 0 4 2 4 5.6 0 3.4-1.6 6.2-4 6.2z"
      />
    </svg>
  );
}

function ToyotaMark() {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="44" height="28" viewBox="0 0 80 50" aria-label="Toyota">
        <ellipse cx="40" cy="25" rx="36" ry="18" fill="none" stroke="#EB0A1E" strokeWidth="3.5" />
        <ellipse cx="40" cy="25" rx="18" ry="18" fill="none" stroke="#EB0A1E" strokeWidth="3.5" />
        <ellipse cx="40" cy="25" rx="36" ry="7" fill="none" stroke="#EB0A1E" strokeWidth="3.5" />
      </svg>
      <span className="text-[10px] font-bold tracking-[0.25em] text-[#EB0A1E]">TOYOTA</span>
    </div>
  );
}
