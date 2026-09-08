'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Globe,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LANDING_COPY, type LandingLang } from '@/lib/marketing/copy';
import AiCircuit from '@/components/marketing/AiCircuit';
import PinSection from '@/components/marketing/PinSection';
import RotatingEarth from '@/components/ui/wireframe-dotted-globe';

const CHIP_LAYOUT = [
  { x: '4%', y: '6%', icon: 'leaf' },
  { x: '46%', y: '0%', icon: 'spark' },
  { x: '8%', y: '34%', icon: 'wave' },
  { x: '42%', y: '28%', icon: 'bars' },
  { x: '62%', y: '48%', icon: 'bloom' },
  { x: '2%', y: '64%', icon: 'spark' },
  { x: '34%', y: '70%', icon: 'grid' },
  { x: '58%', y: '78%', icon: 'wave' },
];

export default function LandingPage() {
  const [lang, setLang] = useState<LandingLang>('en');
  const [currency, setCurrency] = useState<'eur' | 'usd'>('eur');
  const [prompt, setPrompt] = useState('A booking site for a Helsinki design studio, calm type, lots of white space');
  const [scrolled, setScrolled] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('claudable-lang');
    if (stored === 'fi' || stored === 'en') {
      setLang(stored);
      setPrompt(LANDING_COPY[stored].playPrompt);
    }
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copy = LANDING_COPY[lang];
  const setLanguage = (next: LandingLang) => {
    setLang(next);
    setPrompt(LANDING_COPY[next].playPrompt);
    window.localStorage.setItem('claudable-lang', next);
  };

  return (
    <div className="gcore-page min-h-screen bg-black text-white">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-black px-5 py-[9px] text-[12px] sm:px-8">
        <p className="flex items-center gap-2 font-medium text-[#ff5c00]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5c00]" />
          {copy.banner}
        </p>
        <div className="flex items-center gap-6 text-zinc-400">
          <a href={`mailto:${copy.contactEmail}`} className="hidden hover:text-white sm:inline">
            {copy.underAttack}
          </a>
          <Link href="/login" className="hover:text-white">
            {copy.login}
          </Link>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5 text-[11px]">
            {(['en', 'fi'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-full px-2 py-0.5 ${lang === code ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-50 ${scrolled ? 'px-4 pt-3' : 'border-b border-white/[0.06] bg-transparent px-5 sm:px-8'}`}>
        <div
          className={
            scrolled
              ? 'mx-auto flex h-[56px] w-max max-w-[calc(100%-1rem)] items-center gap-6 rounded-full border border-white/10 bg-black/92 px-3 pl-4 pr-2 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl'
              : 'mx-auto grid h-[76px] max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center bg-transparent'
          }
        >
          {scrolled ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5c00] text-[13px] font-bold">F</span>
          ) : (
            <Logo />
          )}
          <nav className={`hidden items-center whitespace-nowrap text-white md:flex ${scrolled ? 'gap-6 text-[13px]' : 'gap-4 text-[13px] xl:gap-7'}`}>
            {copy.nav.map((item) => (
              <a key={item.href} href={item.href} className="inline-flex items-center gap-1">
                {item.label}
                <ChevronDown size={12} className="text-white/50" />
              </a>
            ))}
          </nav>
          <div className={`flex shrink-0 items-center gap-3 ${scrolled ? '' : 'justify-end'}`}>
            {scrolled ? null : (
              <a href="#contact" className="hidden whitespace-nowrap rounded-full border border-white/20 bg-transparent px-4 py-2 text-[13px] sm:inline-flex">
                {copy.contactUs}
              </a>
            )}
            <Link
              href="/login"
              className={`inline-flex whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium ${
                scrolled ? 'bg-white font-semibold text-black' : 'bg-[#ff5c00]'
              }`}
            >
              {copy.signUp}
            </Link>
          </div>
        </div>
      </header>

      <PinSection>
      <section className="gcore-grid-dark relative overflow-hidden bg-black px-5 pb-8 pt-12 text-center sm:pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[12%] top-[-8%] h-[430px] w-[38px] rotate-[28deg] bg-[linear-gradient(180deg,rgba(255,92,0,0.7),transparent_78%)] blur-[9px] mix-blend-screen" />
          <div className="absolute right-[18%] top-[-14%] h-[360px] w-[16px] rotate-[28deg] bg-[linear-gradient(180deg,rgba(255,150,60,0.45),transparent_72%)] blur-[7px] mix-blend-screen" />
          <div className="absolute inset-x-[18%] top-0 flex h-36 justify-between opacity-25">
            {Array.from({ length: 11 }).map((_, index) => (
              <span key={index} className="h-full w-px bg-gradient-to-b from-[#ff5c00]/70 to-transparent" />
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-3.5 py-[6px] text-[12px] text-zinc-200 backdrop-blur">
            <Sparkles size={11} /> {copy.heroBadge}
          </span>
          <h1 className="mt-7 text-[42px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[64px]">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.55] text-[#9a9a9a]">
            {copy.heroBody}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-[#ff5c00] px-6 py-[11px] text-[14px] font-medium">
              {copy.getStarted}
            </Link>
            <a href="#contact" className="rounded-full border border-white/[0.08] bg-transparent px-6 py-[11px] text-[14px]">
              {copy.bookDemo}
            </a>
          </div>
        </div>
        <div className="relative z-[1] mt-4">
          <AiCircuit />
        </div>
      </section>
      </PinSection>

      <PinSection cover>
      <section id="product" className="gcore-grid-light bg-[#efefef] px-5 pb-24 pt-16 text-black">
        <div className="mb-10 flex justify-center gap-2">
          <span className="rounded-full bg-black px-4 py-2 text-[12px] text-white">{copy.productTabWhat}</span>
          <span className="rounded-full bg-black px-4 py-2 text-[12px] text-white">{copy.productTabHow}</span>
        </div>
        <h2 className="mx-auto max-w-[820px] text-center text-[34px] font-semibold tracking-[-0.04em] sm:text-[52px] sm:leading-[1.08]">
          {copy.productTitle}
        </h2>
        <div className="mx-auto mt-14 grid max-w-[1180px] gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="gcore-card-dark relative min-h-[480px] overflow-hidden rounded-[22px] bg-[#0b0b0b] p-9 text-left text-white">
            <div className="pointer-events-none absolute -left-6 -top-10 h-56 w-24 rotate-[28deg] bg-[linear-gradient(180deg,rgba(255,92,0,0.55),transparent_80%)] blur-md" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(90deg,transparent,transparent_22px,rgba(255,92,0,0.08)_22px,rgba(255,92,0,0.08)_23px)]" />
            <p className="relative mt-[300px] max-w-[300px] text-[26px] font-semibold leading-[1.15] tracking-[-0.03em]">
              {copy.productPanel}
            </p>
          </div>
          <div className="gcore-card-light relative flex min-h-[480px] flex-col overflow-hidden rounded-[22px] bg-white px-9 pb-8 pt-10 text-left">
            <h3 className="max-w-[540px] text-[26px] font-semibold leading-[1.28] tracking-[-0.035em] text-zinc-950 sm:text-[30px]">
              {copy.productHeading}
            </h3>
            <p className="mt-5 max-w-[500px] text-[15px] leading-[1.65] text-zinc-500">
              {copy.productBody}
            </p>
            <div className="relative mt-10 h-[200px] w-full">
              {CHIP_LAYOUT.map((item, index) => (
                <motion.div
                  key={`${copy.floatChips[index]}-${index}`}
                  className="gcore-card-light absolute flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-zinc-800"
                  style={{ left: item.x, top: item.y }}
                  animate={{ y: [0, index % 2 === 0 ? -3 : 2, 0] }}
                  transition={{ duration: 11 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChipIcon name={item.icon} />
                  {copy.floatChips[index]}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </PinSection>

      <PinSection cover>
      <div className="bg-black">
      <section id="why" className="px-5 py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px]">
            <Sparkles size={12} className="text-[#ff5c00]" /> {copy.whyBadge}
          </span>
          <h2 className="mt-6 text-[36px] font-semibold tracking-[-0.045em] sm:text-[52px] sm:leading-[1.08]">
            {copy.whyTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-500">
            {copy.whyBody}
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-[1180px] gap-5 lg:grid-cols-2">
          {copy.whyCards.map((card, index) => (
            <article
              key={card.title}
              className="gcore-card-dark relative flex flex-col overflow-hidden rounded-[22px] bg-[#111] p-8"
            >
              <p className="text-[12px] font-medium tracking-[0.18em] text-[#ff5c00]">{card.kicker}</p>
              <h3 className="mt-3 text-[26px] font-semibold tracking-[-0.03em]">{card.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-400">{card.body}</p>
              <div className="mt-8 flex-1 overflow-hidden rounded-[18px] bg-[#0a0a0a]">
                {index === 0 ? <OrbitGlobe /> : <MiniNodes labels={copy.floatChips.slice(0, 4)} />}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="resources" className="bg-black px-5 pb-20">
        <div className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-3">
          {copy.resources.slice(0, 3).map((card, index) => (
            <FeatureCard key={card.title} title={card.title} body={card.body}>
              {index === 0 ? <PrivacyGraphic /> : index === 1 ? <StorageGraphic /> : <HubGraphic />}
            </FeatureCard>
          ))}
        </div>
        <div className="mx-auto mt-5 grid max-w-[1180px] gap-5 lg:grid-cols-[1.55fr_1fr]">
          <FeatureCard title={copy.resources[3].title} body={copy.resources[3].body}>
            <ScaleGraphic />
          </FeatureCard>
          <FeatureCard title={copy.resources[4].title} body={copy.resources[4].body}>
            <GpuGraphic />
          </FeatureCard>
        </div>
      </section>

      <section id="global-network" className="relative overflow-x-hidden bg-black px-5 pb-28 pt-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-white">
          <Globe size={12} className="text-[#ff5c00]" /> {copy.globeBadge}
        </span>
        <h2 className="mt-7 text-[36px] font-semibold tracking-[-0.05em] text-white sm:text-[56px] sm:leading-[1.06]">
          {copy.globeTitle}
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-zinc-400">
          {copy.globeBody}
        </p>
        <div className="relative mx-auto mt-10 h-[min(92vw,1100px)] w-[min(92vw,1100px)] pointer-events-none">
          <div className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,rgba(255,92,0,0.16)_0%,transparent_58%)]" />
          <RotatingEarth />
        </div>
      </section>
      </div>
      </PinSection>

      <PinSection cover hold={false}>
      <div className="bg-[#f4efe8] text-black">
      <section className="px-5 pb-6 pt-20">
        <p className="text-center text-[12px] font-medium tracking-[0.22em] text-[#ff5c00]">{copy.playKicker}</p>
        <h2 className="mt-4 text-center text-[40px] font-semibold tracking-[-0.045em] sm:text-[52px] sm:leading-[1.08]">
          {copy.playTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[16px] leading-relaxed text-zinc-500">
          {copy.playBody}
        </p>
        <div className="gcore-card-light mx-auto mt-10 max-w-[880px] overflow-hidden rounded-[22px] bg-white">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5c00] text-white">
                <Zap size={16} />
              </span>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em]">{copy.playName}</p>
                <p className="text-[12px] text-zinc-400">{copy.playHint}</p>
              </div>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              {['#7c3aed', '#ff5c00', '#10a37f', '#3b82f6'].map((color) => (
                <span key={color} className="h-2 w-2 rounded-full" style={{ background: color }} />
              ))}
            </div>
          </div>
          <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2">
            {copy.playTiles.map((card, index) => (
              <button
                key={card.title}
                type="button"
                className="bg-white p-6 text-left transition-colors hover:bg-[#faf7f2]"
              >
                <span
                  className={`mb-4 inline-flex h-8 items-center rounded-full px-3 text-[11px] font-semibold ${
                    [
                      'bg-[#fff4ec] text-[#ff5c00]',
                      'bg-[#fff8e8] text-[#d97706]',
                      'bg-[#eef6ff] text-[#2563eb]',
                      'bg-[#f3eefc] text-[#7c3aed]',
                    ][index]
                  }`}
                >
                  {card.title}
                </span>
                <p className="text-[15px] font-medium tracking-[-0.02em] text-zinc-900">{card.hint}</p>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-zinc-400">{prompt}</p>
              </button>
            ))}
          </div>
          <form className="flex items-center gap-3 border-t border-black/[0.06] px-5 py-4" onSubmit={(event) => event.preventDefault()}>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="flex-1 bg-transparent text-[14px] text-zinc-700 outline-none placeholder:text-zinc-400"
            />
            <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
              ↑
            </button>
          </form>
        </div>
      </section>

      <section id="partners" className="px-5 pb-32 pt-16">
        <p className="text-center text-[12px] font-medium tracking-[0.22em] text-[#ff5c00]">{copy.casesKicker}</p>
        <h2 className="mt-4 text-center text-[40px] font-semibold tracking-[-0.045em] sm:text-[52px] sm:leading-[1.08]">
          {copy.casesTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-[16px] leading-relaxed text-zinc-500">
          {copy.casesBody}
        </p>
        <div className="mx-auto mt-14 grid max-w-[1180px] gap-6 md:grid-cols-3">
          {copy.cases.map((item, index) => (
            <UseCard
              key={item.title}
              title={item.title}
              body={item.body}
              items={[...item.items]}
              graphic={index === 0 ? <ItGraphic /> : index === 1 ? <RetailGraphic /> : <AutoGraphic />}
            />
          ))}
        </div>
      </section>
      </div>
      </PinSection>

      <section id="pricing" className="bg-[#0a0a0a] px-5 pb-10 pt-24">
        <p className="text-center text-[12px] font-medium tracking-[0.22em] text-[#ff5c00]">{copy.packagesKicker}</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-center text-[40px] font-semibold tracking-[-0.045em] sm:text-[52px] sm:leading-[1.08]">
          {copy.packagesTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[16px] leading-relaxed text-zinc-500">
          {copy.packagesBody}
        </p>
        <div className="mx-auto mt-6 flex justify-center">
          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-sm">
            <button type="button" onClick={() => setCurrency('eur')} className={`rounded-full px-4 py-1.5 ${currency === 'eur' ? 'bg-white text-black' : 'text-zinc-400'}`}>
              EUR
            </button>
            <button type="button" onClick={() => setCurrency('usd')} className={`rounded-full px-4 py-1.5 ${currency === 'usd' ? 'bg-white text-black' : 'text-zinc-400'}`}>
              USD
            </button>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-[1180px] gap-5 lg:grid-cols-3">
          {copy.packages.map((pkg) => (
            <PriceCard
              key={pkg.title}
              badge={pkg.badge}
              title={pkg.title}
              price={currency === 'eur' ? pkg.priceEur : pkg.priceUsd}
              period={pkg.period}
              items={[...pkg.items]}
              featured={'featured' in pkg && pkg.featured}
              summary={pkg.summary}
              cta={copy.packagesCta}
            />
          ))}
        </div>
      </section>

      <section id="contact" className="bg-[#0a0a0a] px-5 pb-20 pt-8">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-[36px] font-semibold tracking-[-0.04em]">{copy.contactTitle}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-400">{copy.contactBody}</p>
            <a href={`mailto:${copy.contactEmail}`} className="mt-6 inline-flex text-[15px] text-[#ff5c00] hover:underline">
              {copy.contactEmail}
            </a>
          </div>
          <form
            className="gcore-card-dark rounded-[22px] bg-[#111] p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setContactStatus('sending');
              setContactError('');
              try {
                const response = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: contactName,
                    email: contactEmail,
                    message: contactMessage,
                    company: '',
                  }),
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok) throw new Error(payload?.error || copy.contactError);
                setContactStatus('sent');
                setContactName('');
                setContactEmail('');
                setContactMessage('');
              } catch (error) {
                setContactStatus('error');
                setContactError(error instanceof Error ? error.message : copy.contactError);
              }
            }}
          >
            <label className="block text-left text-[13px] text-zinc-400">
              {copy.contactName}
              <input
                required
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/40 bg-black/40 px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#ff5c00]/50"
              />
            </label>
            <label className="mt-4 block text-left text-[13px] text-zinc-400">
              {copy.contactEmailLabel}
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/40 bg-black/40 px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#ff5c00]/50"
              />
            </label>
            <label className="mt-4 block text-left text-[13px] text-zinc-400">
              {copy.contactMessage}
              <textarea
                required
                rows={5}
                value={contactMessage}
                onChange={(event) => setContactMessage(event.target.value)}
                className="mt-1.5 w-full resize-y rounded-xl border border-black/40 bg-black/40 px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#ff5c00]/50"
              />
            </label>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
            {contactStatus === 'error' ? <p className="mt-3 text-left text-[13px] text-red-400">{contactError || copy.contactError}</p> : null}
            {contactStatus === 'sent' ? <p className="mt-3 text-left text-[13px] text-emerald-400">{copy.contactSent}</p> : null}
            <button
              type="submit"
              disabled={contactStatus === 'sending'}
              className="mt-5 w-full rounded-full bg-[#ff5c00] py-3 text-[14px] font-medium disabled:opacity-50"
            >
              {contactStatus === 'sending' ? copy.contactSending : copy.contactSend}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-black px-5 py-14">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-500">{copy.footerTag}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-zinc-500">{copy.footerColServices}</p>
            <ul className="mt-4 space-y-2 text-[14px] text-zinc-300">
              {copy.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-zinc-500">{copy.footerColPackages}</p>
            <ul className="mt-4 space-y-2 text-[14px] text-zinc-300">
              {copy.packages.map((pkg) => (
                <li key={pkg.title}>
                  <a href="#pricing" className="hover:text-white">
                    {pkg.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-zinc-500">{copy.footerColContact}</p>
            <a href={`mailto:${copy.contactEmail}`} className="mt-4 block text-[14px] text-[#ff5c00] hover:underline">
              {copy.contactEmail}
            </a>
            <a href="#contact" className="mt-3 inline-flex text-[14px] text-zinc-300 hover:text-white">
              {copy.contactSend}
            </a>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-[1180px] text-[12px] text-zinc-600">{copy.footerLegal}</p>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 justify-self-start">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5c00] text-[13px] font-bold text-white">F</span>
      <span className="text-[15px] font-semibold tracking-[0.16em]">FINTOKE</span>
    </Link>
  );
}

function ChipIcon({ name }: { name: string }) {
  const wrap = (child: ReactNode, bg: string) => (
    <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: bg }}>
      {child}
    </span>
  );

  if (name === 'leaf') {
    return wrap(
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 9 C2 4 7 2 10 2 C10 7 6 10 2 9 Z" fill="white" />
      </svg>,
      '#ff7a18',
    );
  }
  if (name === 'spark') {
    return wrap(
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1.5 L7.1 4.9 L10.8 6 L7.1 7.1 L6 10.5 L4.9 7.1 L1.2 6 L4.9 4.9 Z" fill="white" />
      </svg>,
      '#7c3aed',
    );
  }
  if (name === 'wave') {
    return wrap(
      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
        <path d="M1 5c1.2-2 2.2-2 3.2 0s2.2 2 3.4 0 2.2-2 3.4 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>,
      '#ff5c00',
    );
  }
  if (name === 'bars') {
    return wrap(
      <svg width="12" height="10" viewBox="0 0 12 10">
        <rect x="0" y="3" width="2.4" height="7" rx="0.6" fill="#ffb000" />
        <rect x="3.2" y="0" width="2.4" height="10" rx="0.6" fill="#ff6a00" />
        <rect x="6.4" y="2" width="2.4" height="8" rx="0.6" fill="#f2c14e" />
        <rect x="9.6" y="4" width="2.4" height="6" rx="0.6" fill="#ff8a4c" />
      </svg>,
      '#1f1f1f',
    );
  }
  if (name === 'bloom') {
    return wrap(
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="2.2" stroke="white" strokeWidth="1.2" />
        <circle cx="6" cy="2.2" r="1" fill="white" />
        <circle cx="6" cy="9.8" r="1" fill="white" />
        <circle cx="2.2" cy="6" r="1" fill="white" />
        <circle cx="9.8" cy="6" r="1" fill="white" />
      </svg>,
      '#10a37f',
    );
  }
  return wrap(
    <span className="grid grid-cols-2 gap-[1.5px]">
      <span className="h-[5px] w-[5px] rounded-[1px] bg-[#f25022]" />
      <span className="h-[5px] w-[5px] rounded-[1px] bg-[#7fba00]" />
      <span className="h-[5px] w-[5px] rounded-[1px] bg-[#00a4ef]" />
      <span className="h-[5px] w-[5px] rounded-[1px] bg-[#ffb900]" />
    </span>,
    '#111',
  );
}

function FeatureCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <article className="gcore-card-dark flex flex-col overflow-hidden rounded-[22px] bg-[#111] p-6">
      <h3 className="text-[22px] font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{body}</p>
      <div className="mt-6 min-h-[168px] overflow-hidden rounded-[16px] bg-[#0a0a0a] p-4">{children}</div>
    </article>
  );
}

function UseCard({
  title,
  body,
  items,
  graphic,
}: {
  title: string;
  body: string;
  items: string[];
  graphic: ReactNode;
}) {
  return (
    <article className="gcore-card-light overflow-hidden rounded-[22px] bg-white p-5">
      <div className="mb-5 h-40 overflow-hidden rounded-2xl bg-[#efe8df]">{graphic}</div>
      <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-zinc-950">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">{body}</p>
      <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-zinc-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5c00]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PriceCard({
  badge,
  title,
  price,
  period,
  items,
  featured,
  summary,
  cta,
}: {
  badge: string;
  title: string;
  price: string;
  period: string;
  items: string[];
  featured?: boolean;
  summary: string;
  cta: string;
}) {
  return (
    <article className={`gcore-card-dark relative flex flex-col overflow-hidden rounded-[22px] bg-[#111] p-8 ${featured ? 'lg:-translate-y-2' : ''}`}>
      <span
        className={`mb-5 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-medium ${
          featured ? 'bg-[#ff5c00] font-semibold text-white' : 'border border-black/40 bg-white/[0.04] text-zinc-400'
        }`}
      >
        {badge}
      </span>
      <p className="text-[22px] font-semibold tracking-[-0.03em] text-white">{title}</p>
      <p className="mt-3 text-[36px] font-semibold tracking-[-0.05em] text-white">
        {price}
        <span className="ml-1.5 text-[15px] font-normal text-zinc-500">{period}</span>
      </p>
      <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">{summary}</p>
      <div className="my-6 h-px bg-black/50" />
      <ul className="flex-1 space-y-3 text-[14px] text-zinc-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5c00]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className={`mt-8 block rounded-full py-3 text-center text-[14px] font-medium ${
          featured ? 'bg-[#ff5c00] text-white' : 'bg-white text-black'
        }`}
      >
        {cta}
      </a>
    </article>
  );
}

const GLOBE_DOTS = (() => {
  const next: { x: number; y: number; hot: boolean }[] = [];
  let n = 0;
  for (let lat = -78; lat <= 78; lat += 7) {
    for (let lon = -170; lon <= 170; lon += 7) {
      const latR = (lat * Math.PI) / 180;
      const lonR = (lon * Math.PI) / 180;
      const z = Math.cos(latR) * Math.cos(lonR);
      if (z <= 0.12) continue;
      n += 1;
      next.push({
        x: Number((50 + Math.cos(latR) * Math.sin(lonR) * 44).toFixed(2)),
        y: Number((50 + Math.sin(latR) * 44).toFixed(2)),
        hot: n % 19 === 0,
      });
    }
  }
  return next;
})();

function DottedGlobe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className || ''} aria-hidden>
      {GLOBE_DOTS.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r="0.42"
          fill={dot.hot ? '#ff5c00' : '#ffffff'}
          opacity={dot.hot ? 1 : 0.8}
        />
      ))}
    </svg>
  );
}

function OrbitGlobe() {
  return (
    <div className="relative h-[260px] w-full">
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,92,0,0.18),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 260" aria-hidden>
        <ellipse cx="210" cy="138" rx="168" ry="86" fill="none" stroke="#ff5c00" strokeOpacity="0.35" transform="rotate(-16 210 138)" />
        <ellipse cx="210" cy="138" rx="168" ry="86" fill="none" stroke="#ff5c00" strokeOpacity="0.18" transform="rotate(28 210 138)" />
        <circle cx="210" cy="138" r="78" fill="none" stroke="rgba(255,255,255,0.08)" />
      </svg>
      <DottedGlobe className="absolute left-1/2 top-[18%] h-44 w-44 -translate-x-1/2 drop-shadow-[18px_24px_28px_rgba(0,0,0,0.55)]" />
      <span className="absolute bottom-5 left-5 rounded-full border border-black/50 bg-black/60 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur">
        EN + FI
      </span>
      <span className="absolute bottom-5 right-5 rounded-full border border-black/40 bg-[#ff5c00]/15 px-3 py-1 text-[11px] text-[#ffb48a]">
        Studio
      </span>
    </div>
  );
}

function MiniNodes({ labels }: { labels: readonly string[] }) {
  const nodes = [
    { label: labels[0], pos: 'left-5 top-5' },
    { label: labels[1], pos: 'right-5 top-6' },
    { label: labels[2], pos: 'left-6 bottom-6' },
    { label: labels[3], pos: 'right-6 bottom-5' },
  ];
  return (
    <div className="relative h-[260px] w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 260" fill="none">
        <path d="M 78 52 H 168 L 210 108 H 250" stroke="rgba(255,255,255,0.1)" />
        <path d="M 342 52 H 252 L 210 108" stroke="rgba(255,255,255,0.1)" />
        <path d="M 78 208 H 168 L 210 152 H 250" stroke="rgba(255,255,255,0.1)" />
        <path d="M 342 208 H 252 L 210 152" stroke="rgba(255,255,255,0.1)" />
        <path d="M 78 52 H 168 L 210 108 H 250" stroke="#ff5c00" strokeOpacity="0.7" strokeDasharray="10 56" className="gcore-pulse" />
      </svg>
      <div className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-black/50 bg-[#161616] shadow-[12px_18px_28px_-10px_rgba(0,0,0,0.8)]">
        <span className="text-[11px] text-zinc-500">Studio</span>
        <span className="text-[15px] font-semibold">API</span>
      </div>
      {nodes.map((node) => (
        <span
          key={node.label}
          className={`absolute rounded-full border border-black/50 bg-[#151515] px-3 py-1.5 text-[12px] text-zinc-300 shadow-[12px_16px_22px_-10px_rgba(0,0,0,0.8)] ${node.pos}`}
        >
          {node.label}
        </span>
      ))}
    </div>
  );
}

function PrivacyGraphic() {
  return (
    <div className="relative mx-auto flex h-full min-h-[140px] w-full max-w-[220px] items-center justify-center">
      {[72, 108, 144].map((size) => (
        <span
          key={size}
          className="absolute rounded-full border border-white/10"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      ))}
      <span className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-[#161616] shadow-[12px_16px_24px_-10px_rgba(0,0,0,0.8)]">
        <Shield size={20} className="text-[#ff5c00]" />
      </span>
      <span className="absolute right-8 top-6 h-2 w-2 rounded-full bg-[#ff5c00]" />
    </div>
  );
}

function StorageGraphic() {
  return (
    <div className="grid h-full grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className={`rounded-xl border ${
            index === 6
              ? 'border-[#ff5c00]/50 bg-[#ff5c00] shadow-[10px_16px_24px_-8px_rgba(255,92,0,0.45)]'
              : 'border-white/10 bg-white/[0.04]'
          }`}
        />
      ))}
    </div>
  );
}

function HubGraphic() {
  return (
    <div className="relative flex h-full min-h-[140px] flex-col justify-between p-1">
      <span className="w-fit rounded-full bg-[#ff5c00] px-3 py-1 text-[11px] font-semibold">Studio</span>
      <div className="flex flex-wrap gap-2">
        {['Next.js', 'AI', 'CRM'].map((name) => (
          <span key={name} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[12px] text-zinc-300">
            {name}
          </span>
        ))}
      </div>
      <p className="text-[12px] text-zinc-500">Sites, apps, and agents in one stack.</p>
    </div>
  );
}

function ScaleGraphic() {
  return (
    <svg className="h-full w-full min-h-[140px]" viewBox="0 0 640 140" fill="none">
      <path d="M 16 110 L 120 88 L 210 92 L 320 48 L 430 58 L 540 28 L 624 36" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <path d="M 16 110 L 120 88 L 210 92 L 320 48 L 430 58 L 540 28 L 624 36" stroke="#ff5c00" strokeWidth="2" strokeDasharray="12 64" className="gcore-pulse" />
      <circle cx="540" cy="28" r="5" fill="#ff5c00" />
      <text x="16" y="24" fill="#a1a1aa" fontSize="12">
        Load
      </text>
      <text x="560" y="24" fill="#ffb48a" fontSize="12">
        Peak
      </text>
    </svg>
  );
}

function GpuGraphic() {
  return (
    <div className="flex h-full min-h-[140px] items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff5c00] text-xl font-bold shadow-[14px_18px_28px_-8px_rgba(255,92,0,0.45)]">
        N
      </div>
      <div className="flex-1 rounded-xl border border-white/12 bg-black p-3 font-mono text-[11px] leading-relaxed text-zinc-400 shadow-[12px_16px_24px_-12px_rgba(0,0,0,0.8)]">
        <div className="mb-2 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <p>next.js · app</p>
        <p className="text-zinc-600">live · maintained</p>
      </div>
    </div>
  );
}

function ItGraphic() {
  return (
    <svg viewBox="0 0 360 180" className="h-full w-full">
      <rect x="28" y="28" width="196" height="124" rx="16" fill="#fff" />
      <rect x="44" y="46" width="92" height="10" rx="5" fill="#ece6de" />
      <rect x="44" y="66" width="148" height="8" rx="4" fill="#f3eee7" />
      <rect x="44" y="84" width="128" height="8" rx="4" fill="#f3eee7" />
      <rect x="44" y="114" width="70" height="22" rx="11" fill="#ff5c00" />
      <circle cx="268" cy="62" r="28" fill="none" stroke="#d7cfc4" strokeDasharray="3 5" />
      <circle cx="268" cy="62" r="8" fill="#ff5c00" />
      <rect x="236" y="102" width="88" height="50" rx="12" fill="#fff" />
      <rect x="250" y="116" width="40" height="6" rx="3" fill="#ece6de" />
      <rect x="250" y="130" width="58" height="6" rx="3" fill="#f3eee7" />
    </svg>
  );
}

function RetailGraphic() {
  return (
    <svg viewBox="0 0 360 180" className="h-full w-full">
      <rect x="36" y="24" width="120" height="132" rx="16" fill="#fff" />
      <rect x="52" y="40" width="88" height="56" rx="10" fill="#efe8df" />
      <rect x="52" y="108" width="58" height="8" rx="4" fill="#ece6de" />
      <rect x="52" y="124" width="40" height="8" rx="4" fill="#ff5c00" />
      <rect x="172" y="40" width="152" height="100" rx="16" fill="#fff" />
      <circle cx="204" cy="78" r="16" fill="#1a1f71" />
      <circle cx="236" cy="78" r="16" fill="#003087" />
      <circle cx="268" cy="78" r="16" fill="#eb001b" />
      <circle cx="284" cy="78" r="16" fill="#f79e1b" />
      <rect x="192" y="108" width="96" height="8" rx="4" fill="#ece6de" />
    </svg>
  );
}

function AutoGraphic() {
  return (
    <svg viewBox="0 0 360 180" className="h-full w-full">
      <path d="M 24 48 H 336 M 24 90 H 336 M 24 132 H 336 M 90 22 V 158 M 180 22 V 158 M 270 22 V 158" stroke="#e4dcd2" />
      <rect x="118" y="58" width="124" height="64" rx="14" fill="#fff" />
      <path d="M 142 98 h 28 l 10 -22 h 18" fill="none" stroke="#ff5c00" strokeWidth="3" strokeLinecap="round" />
      <circle cx="248" cy="52" r="7" fill="#ff5c00" />
      <circle cx="86" cy="128" r="5" fill="#ff5c00" />
      <circle cx="292" cy="128" r="5" fill="#d7cfc4" />
    </svg>
  );
}
