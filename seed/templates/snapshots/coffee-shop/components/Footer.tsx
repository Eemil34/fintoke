import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="bg-espresso-deep text-cream">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-xl font-semibold uppercase tracking-wide">{site.name}</p>
          <p className="mt-2 text-sm text-cream/60">{site.tagline}</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-cream/75">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-cream">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-cream/45">© {new Date().getFullYear()} Coffee Crew Brewing Co.</p>
      </div>
    </footer>
  );
}
