import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

export function CtaBand() {
  return (
    <section className="px-5 py-16">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-brand-soft px-8 py-12 md:grid-cols-2 md:items-center md:gap-10 md:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 800 400" fill="none" aria-hidden>
            <path
              d="M0 200 C150 80 250 320 400 200 S650 80 800 200"
              stroke="#7C3AED"
              strokeWidth="40"
              opacity="0.25"
            />
          </svg>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{site.cta.title}</h2>
          <p className="mt-3 max-w-md text-brand-muted">{site.cta.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 rounded-button bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              {site.cta.button}
              <span aria-hidden>→</span>
            </Link>
            {site.cta.secondary ? (
              <Link
                href="/treatments"
                className="inline-flex items-center gap-2 rounded-button border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand"
              >
                {site.cta.secondary}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="relative mt-8 hidden overflow-hidden rounded-[1.5rem] md:mt-0 md:block">
          <SiteImage
            src={unsplash('photo-1579684453423-f84349ef60b0', 1000)}
            alt="Clinician preparing for a procedure"
            width={640}
            height={420}
            className="h-64 w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
