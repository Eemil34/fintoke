import { SiftMark } from './Header';

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div
        className="glow-orb left-1/2 top-1/2 h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-sift-lime/20"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
          Stop reporting.
          <br />
          Start <span className="text-sift-lime">deciding.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-sift-soft sm:text-base">
          Connect your first source in under five minutes and let Sift find the story your
          dashboards are hiding.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-sift-lime px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-black shadow-lime transition hover:brightness-110 animate-pulse-glow"
          >
            Start for free
            <span aria-hidden>→</span>
          </a>
          <a
            href="#customers"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:border-white/40"
          >
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <a href="#top" className="flex items-center gap-2.5">
          <SiftMark className="h-4 w-4 text-sift-lime" />
          <span className="font-display text-sm font-semibold">Sift</span>
        </a>
        <nav className="flex flex-wrap items-center justify-center gap-5 text-[12px] text-sift-muted">
          <a href="#platform" className="hover:text-white">
            Platform
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#customers" className="hover:text-white">
            Customers
          </a>
        </nav>
        <p className="text-[11px] text-sift-muted">© {new Date().getFullYear()} Sift</p>
      </div>
    </footer>
  );
}
