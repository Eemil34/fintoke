import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-brand/10 bg-brand text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">{site.footer}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Visit</p>
          <p className="mt-3 text-sm leading-6 text-white/85">{site.address}</p>
          <p className="mt-1 text-sm text-white/70">{site.hours}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Contact</p>
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="mt-3 block text-sm hover:underline">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="mt-1 block text-sm text-white/70 hover:underline">
            {site.email}
          </a>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/70">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
