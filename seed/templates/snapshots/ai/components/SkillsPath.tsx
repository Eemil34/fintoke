'use client';

import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

const skills = [
  {
    title: 'Assess',
    body: 'Map the skills your team needs for GenAI-era delivery.',
    photo: 'photo-1522071820081-009f0129c71c',
    alt: 'Team collaborating',
  },
  {
    title: 'Practice',
    body: 'Train with real challenges that mirror production work.',
    photo: 'photo-1531482615713-2afd69097998',
    alt: 'Workshop discussion',
  },
  {
    title: 'Prove',
    body: 'Show verified proficiency with certifications and badges.',
    photo: 'photo-1497366811353-6870744d04b2',
    alt: 'Glass office interior',
  },
];

export function SkillsPath() {
  return (
    <section
      id="products"
      className="relative bg-black text-white px-4 sm:px-8 lg:px-12 pt-8 pb-24 md:pb-32 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hr-green/35 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-20 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-hr-green/10 blur-[100px]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl relative">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hr-green">
            Skills that compound
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-[2.6rem] font-semibold tracking-tight">
            Close the gap between{' '}
            <span className="text-hr-green">what you need</span> and what you have
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#9ca3af]">
            A clear path from assessment to readiness — for developers leveling up and teams hiring
            for the GenAI world.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {skills.map((skill, index) => (
            <article
              key={skill.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <SiteImage
                  src={unsplash(skill.photo, 800)}
                  alt={skill.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />
                <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-hr-green-bright text-sm font-bold text-black shadow-[0_0_20px_rgba(61,255,139,0.4)]">
                  {index + 1}
                </span>
              </div>
              <div className="p-5 pt-2">
                <h3 className="text-lg font-semibold">{skill.title}</h3>
                <p className="mt-2 text-sm text-[#9ca3af] leading-relaxed">{skill.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[1.75rem] border border-hr-green/25 bg-gradient-to-br from-[#111] via-[#0d1510] to-black p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(61,255,139,0.08)]">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready to thrive in a GenAI world?
          </h3>
          <p className="mt-3 mx-auto max-w-lg text-sm text-[#9ca3af]">
            Join the community or book a demo — map skills, close gaps, and build teams that ship
            with confidence.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#signup"
              className="inline-flex items-center justify-center rounded-xl bg-hr-green-bright px-6 py-3 text-sm font-semibold text-black shadow-[0_0_32px_rgba(61,255,139,0.35)] hover:brightness-110 transition"
            >
              Join The Community
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white hover:border-hr-green/40 hover:bg-hr-green/[0.06] transition"
            >
              Request Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
