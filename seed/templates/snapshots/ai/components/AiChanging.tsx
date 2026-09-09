'use client';

import { useEffect, useState } from 'react';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

const steps = [
  {
    titleLead: 'GenAI',
    titleRest: ' advances daily.',
    body: "AI's ability to write code is evolving at a dizzying pace.",
  },
  {
    titleLead: 'GenAI',
    titleRest: ' is becoming a part of everything.',
    body: 'From IDEs to hiring workflows, AI is woven into every stage of building software.',
  },
  {
    titleLead: 'GenAI',
    titleRest: ' will execute more mundane development tasks.',
    body: 'Developers will orchestrate AI agents while focusing on higher-level problem solving.',
  },
];

export function AiChanging() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-white via-[#f4f7f5] to-[#e8efeb] text-[#1a1a1a] px-4 sm:px-8 lg:px-12 pt-6 pb-28 md:pt-10 md:pb-36 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-32 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-hr-green/10 blur-[100px]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl relative">
        <div className="flex justify-center mb-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-hr-green/50 to-transparent" />
        </div>

        <h2 className="text-center text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight">
          <span className="text-hr-green-deep">AI Changing</span>{' '}
          <span className="text-[#1a1a1a]">Software Development</span>
        </h2>
        <p className="mt-3 text-center text-sm text-[#6b7280] max-w-lg mx-auto">
          The craft of building software is shifting — here&apos;s what that means for teams and talent.
        </p>

        <div className="mt-12 md:mt-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isActive = index === active;
              return (
                <button
                  key={step.titleRest}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`block w-full text-left rounded-2xl px-4 py-4 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors ${
                        isActive ? 'bg-hr-green-deep shadow-[0_0_10px_rgba(27,215,96,0.6)]' : 'bg-[#c5c5c5]'
                      }`}
                    />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                        <span className={isActive ? 'text-hr-green-deep' : 'text-[#9ca3af]'}>
                          {step.titleLead}
                        </span>
                        <span className={isActive ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}>
                          {step.titleRest}
                        </span>
                      </h3>
                      <p
                        className={`mt-2 text-sm sm:text-base text-[#6b7280] max-w-md overflow-hidden transition-all duration-300 ${
                          isActive ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none pb-10">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
              <SiteImage
                src={unsplash('photo-1551434678-e076c223a995', 1000)}
                alt="Office conversation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            <div className="absolute -bottom-2 -right-2 sm:right-4 w-[88%] sm:w-[80%] rounded-2xl bg-[#121212] text-white p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-white/8">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-hr-green/40">
                  <SiteImage
                    src={unsplash('photo-1573496359142-b8d87734a5a2', 160)}
                    alt="Ada profile"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">Ada</p>
                  <p className="text-xs text-[#9ca3af]">Machine Learning Engineer</p>
                </div>
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-white/80">
                Certifications
              </p>
              <div className="mt-2 space-y-2">
                {['Machine Learning Engineer', 'Data Scientist'].map((cert) => (
                  <div
                    key={cert}
                    className="rounded-lg bg-[#1c1c1c] px-3 py-2.5 text-xs text-white/90 border border-white/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{cert}</span>
                      <span className="h-1.5 w-16 rounded-full bg-gradient-to-r from-hr-green to-transparent" />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-white/80">Badges</p>
              <div className="mt-2 flex gap-3">
                {[
                  { name: 'Kubernetes', color: '#326ce5' },
                  { name: 'PyTorch', color: '#ee4c2c' },
                  { name: 'Python', color: '#3776ab' },
                ].map((badge) => (
                  <div key={badge.name} className="flex flex-col items-center gap-1 w-16">
                    <div
                      className="h-10 w-10 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                        background: badge.color,
                      }}
                    >
                      {badge.name.slice(0, 2)}
                    </div>
                    <span className="text-[9px] text-white/80">{badge.name}</span>
                    <span className="text-[9px] text-amber-400">★★★</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
