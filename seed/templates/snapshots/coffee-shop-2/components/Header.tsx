import { navLinks } from '@/lib/site';

function BeanMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2c-3.2 0-6 3.8-6 8.5S8.8 22 12 22s6-6.8 6-11.5S15.2 2 12 2zm0 2.2c.4 1.8.6 3.8.6 5.8 0 2.2-.2 4.4-.6 6.4-.4-2-.6-4.2-.6-6.4 0-2 .2-4 .6-5.8z" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="relative bg-transparent">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-5 md:px-8 md:py-7">
        <a href="#top" className="group flex items-center gap-2.5 text-roast">
          <BeanMark className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
          <span className="font-display text-[1.75rem] font-semibold italic tracking-tight md:text-[2rem]">
            Caffiora
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-roast/70 transition-colors hover:text-roast"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#products"
          className="inline-flex items-center gap-2 bg-roast px-5 py-2.5 text-[13px] font-medium text-parchment-soft transition hover:bg-roast-mid"
        >
          See Collection
          <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}
