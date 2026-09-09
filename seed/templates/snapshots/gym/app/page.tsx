import { HeroActionBar } from '../components/HeroActionBar';
import { WhyAccordion } from '../components/WhyAccordion';
import { ServicesCarousel } from '../components/ServicesCarousel';
import { WorldGlobe } from '../components/WorldGlobe';
import { Reveal } from '../components/Reveal';
import { CountUp } from '../components/CountUp';
import { SiteHeader } from '../components/SiteHeader';
import { ParallaxImage } from '../components/ParallaxImage';
import { SiteImage } from '../components/SiteImage';
import { unsplash } from '../lib/imageLibrary';

const HERO = '/uploads/e0b6552e-adb9-4edf-accb-5e14a2583916.png';

const stats = [
  { value: '15', label: 'Years open' },
  { value: '12k', label: 'Active members' },
  { value: '80', label: 'Classes / week' },
  { value: '45', label: 'Coaches' },
];

const services = [
  {
    title: 'Personal training',
    src: unsplash('photo-1571019614242-c5c5dee9f50b'),
    alt: 'Person lifting weights with a trainer',
  },
  {
    title: 'Group classes',
    src: unsplash('photo-1518611012118-696072aa579a'),
    alt: 'Yoga class in a fitness studio',
  },
  {
    title: 'Strength floor',
    src: unsplash('photo-1517836357463-d25dfeac3438'),
    alt: 'Dumbbell rack in the gym',
  },
  {
    title: 'Conditioning',
    src: unsplash('photo-1571902943202-507ec2618e8f'),
    alt: 'Row of treadmills',
  },
];

const plans = [
  {
    name: 'Basic',
    price: '25',
    blurb: 'Open floor access for self-directed training.',
    features: ['Unlimited gym floor', '1 group class / month', 'Locker + recovery lounge'],
    featured: false,
  },
  {
    name: 'Standard',
    price: '45',
    blurb: 'The membership most members stick with.',
    features: [
      'Unlimited gym floor',
      '3 group classes / month',
      'Sauna access',
      'Nutrition starter kit',
    ],
    featured: true,
  },
  {
    name: 'Premium',
    price: '79',
    blurb: 'Coaching + full amenity access.',
    features: [
      'Unlimited classes',
      '2 PT sessions / month',
      'Pool + recovery suite',
      'Priority booking',
    ],
    featured: false,
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <path
        d="M3.5 8.2 6.2 11l6.3-6.5"
        stroke="#4f8cff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <SiteHeader />

      <section id="home" className="relative min-h-[100svh]">
        <div className="absolute inset-0">
          <ParallaxImage
            src={HERO}
            alt="Athlete swinging a kettlebell on the FFL training floor"
            priority
            className="object-cover object-[70%_center] md:object-center"
            strength={10}
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,9,14,0.92)_0%,rgba(7,9,14,0.72)_42%,rgba(7,9,14,0.25)_70%,rgba(7,9,14,0.55)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,9,14,0.95)_0%,transparent_38%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-[1400px] flex-col justify-center px-5 pb-14 pt-28 md:px-10 lg:px-14 xl:px-20">
          <Reveal>
            <p className="label-accent">Strength clubs · Est. 2011</p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-5 max-w-[14ch] headline text-[clamp(3.2rem,9vw,6.75rem)] text-white">
              Train hard.
              <br />
              Stay sharp.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
              High-output floors, programmed coaching, and a membership that works across every FFL
              club worldwide.
            </p>
          </Reveal>
          <Reveal delay={230}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#plans" className="btn-skew">
                Start membership
              </a>
              <a
                href="#about"
                className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/70 underline-offset-4 transition hover:text-white hover:underline"
              >
                Tour the club
              </a>
            </div>
          </Reveal>
        </div>

        <div className="relative z-20">
          <Reveal variant="fade" delay={280}>
            <HeroActionBar />
          </Reveal>
        </div>
      </section>

      <section id="about" className="section-pad">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <Reveal variant="left">
            <p className="label-accent">About FFL</p>
            <h2 className="mt-4 headline max-w-[18ch] text-[clamp(2.4rem,5vw,4.25rem)]">
              Built for people who actually train
            </h2>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:justify-self-end">
              No spa lobby theater. FFL clubs are programmed environments — dense equipment, sharp
              coaching, and a culture that respects the work.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 border-y border-ink-line md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div
                className={`px-1 py-8 md:px-6 ${i > 0 ? 'md:border-l md:border-ink-line' : ''} ${
                  i % 2 === 1 ? 'border-l border-ink-line' : ''
                } ${i >= 2 ? 'border-t border-ink-line md:border-t-0' : ''}`}
              >
                <p className="font-display text-5xl font-semibold tracking-wide md:text-6xl">
                  <CountUp value={s.value} />
                  <span className="text-electric">+</span>
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="scale" className="mt-14" delay={100}>
          <div className="relative overflow-hidden rounded-sm md:rounded-md">
            <div className="relative aspect-[16/7] min-h-[240px]">
              <SiteImage
                src={unsplash('photo-1534438327276-14e5300c3a48')}
                alt="Open gym floor with racks and free weights"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-ink/25" />
              <button
                type="button"
                aria-label="Play club film"
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-ink/50 text-white backdrop-blur-md transition hover:border-electric hover:bg-electric hover:text-ink hover:scale-105"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="absolute bottom-5 left-5 text-[11px] uppercase tracking-[0.22em] text-white/70">
                Club film · 01:42
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="services" className="border-t border-ink-line/80">
        <div className="section-pad pt-20">
          <Reveal>
            <div className="max-w-3xl">
              <p className="label-accent">Programming</p>
              <h2 className="mt-4 headline text-[clamp(2.2rem,4.5vw,3.75rem)]">
                Services that hold up under load
              </h2>
            </div>
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <ServicesCarousel services={services} />
          </Reveal>
        </div>
      </section>

      <section id="why" className="section-pad">
        <Reveal>
          <p className="label-accent">Why members stay</p>
          <h2 className="mt-4 headline max-w-[16ch] text-[clamp(2.2rem,4.5vw,3.75rem)]">
            Four reasons the floor feels different
          </h2>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <Reveal variant="left">
            <div className="relative min-h-[480px] overflow-hidden rounded-sm">
              <SiteImage
                src={unsplash('photo-1517960413843-0aee8e2b3285')}
                alt="Athlete mid-workout with battle ropes energy"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 text-sm text-white/80">
                Daily maintained kit. Coaches on the floor — not behind a desk.
              </p>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <WhyAccordion />
          </Reveal>
        </div>
      </section>

      <section id="plans" className="border-y border-ink-line bg-ink-soft/40">
        <div className="section-pad">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <p className="label-accent">Membership</p>
              <h2 className="mt-4 headline text-[clamp(2.2rem,4.5vw,3.75rem)]">
                Clear plans. No soft sell.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="max-w-xs text-sm leading-relaxed text-mist">
                Cancel anytime after the first month. Reciprocal access at every FFL location.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <article
                  className={`relative flex h-full flex-col border p-7 transition duration-300 hover:-translate-y-1 ${
                    plan.featured
                      ? 'border-electric bg-ink-elev'
                      : 'border-ink-line bg-ink-card/80 hover:border-white/20'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute right-5 top-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-electric">
                      Popular
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-semibold tracking-wide">{plan.name}</h3>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-semibold">${plan.price}</span>
                    <span className="text-sm text-mist">/mo</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{plan.blurb}</p>
                  <div className="hairline my-7" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">
                    Included
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-white/85">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                      plan.featured
                        ? 'bg-electric text-ink hover:bg-electric-bright'
                        : 'border border-ink-line text-white hover:border-electric hover:text-electric'
                    }`}
                  >
                    Get started
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal variant="left">
            <p className="label-accent">Locations</p>
            <h2 className="mt-4 headline text-[clamp(2.2rem,4.5vw,3.75rem)]">
              One standard.
              <br />
              Many cities.
            </h2>
            <p className="mt-8 font-display text-5xl font-semibold tracking-wide">
              <CountUp value="23" />
              <span className="text-electric">+</span>
              <span className="ml-3 text-xl font-sans font-normal tracking-normal text-mist">
                countries
              </span>
            </p>
          </Reveal>
          <Reveal variant="right" delay={100}>
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:justify-self-end lg:pb-2">
              Walk into any FFL with the same programming language, reciprocal access, and coaching
              quality — from first visit to travel weeks.
            </p>
          </Reveal>
        </div>

        <Reveal variant="scale" className="mt-12" delay={120}>
          <WorldGlobe />
        </Reveal>
      </section>

      <section className="relative overflow-hidden border-t border-ink-line">
        <div className="absolute inset-0">
          <ParallaxImage
            src={unsplash('photo-1599058917212-d750089bc07e')}
            alt="Athlete training in a dark performance gym"
            className="object-cover opacity-35"
            strength={8}
          />
          <div className="absolute inset-0 bg-ink/75" />
        </div>
        <div className="section-pad relative z-10 text-center">
          <Reveal variant="scale">
            <h2 className="headline mx-auto max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)]">
              One week on us. Decide after.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-white/65">
              Book a free trial week at your nearest club. Bring shoes. Leave the soft promises at the
              door.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <a href="#contact" className="btn-skew mt-9 inline-flex">
              Claim free trial
            </a>
          </Reveal>
        </div>
      </section>

      <footer id="contact" className="border-t border-ink-line bg-ink-soft">
        <Reveal variant="fade">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10 lg:px-14 xl:px-20">
            <a href="#home" className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center bg-electric text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2 4 14h7l-1 8 10-14h-7z" />
                </svg>
              </span>
              <span className="font-display text-xl font-semibold tracking-[0.2em]">FFL</span>
            </a>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-mist">
              <a href="#services" className="hover:text-white">
                Services
              </a>
              <a href="#plans" className="hover:text-white">
                Membership
              </a>
              <a href="#about" className="hover:text-white">
                About
              </a>
            </nav>

            <div className="flex flex-wrap items-center gap-4">
              <a href="mailto:hello@ffl.com" className="text-sm text-mist hover:text-white">
                hello@ffl.com
              </a>
              <a
                href="mailto:hello@ffl.com"
                className="inline-flex items-center border border-ink-line px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition hover:border-electric hover:text-electric"
              >
                Contact
              </a>
            </div>
          </div>
        </Reveal>
      </footer>
    </main>
  );
}
