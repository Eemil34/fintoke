import Link from 'next/link';
import { reservationHref, site } from '@/lib/site';

export function Footer() {
  const { contact } = site;

  return (
    <footer className="border-t border-brand-fg/10 bg-brand-surface/20">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold">{site.name}</p>
            <p className="mt-1 text-sm text-brand">{site.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-brand-muted">{site.footer}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">Visit</p>
            <address className="mt-3 space-y-1 text-sm not-italic leading-6">
              <p>{contact.address}</p>
              <p>{contact.city}</p>
              <p className="pt-2 text-brand-muted">{contact.hours}</p>
            </address>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">Contact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`mailto:${contact.email}`} className="text-brand-muted transition hover:text-brand-fg">
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-brand-muted transition hover:text-brand-fg">
                  {contact.phone}
                </a>
              </li>
              <li className="text-brand-muted">{contact.instagram}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-brand-muted">
              {site.nav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-brand-fg">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-brand-fg/10 pt-8 text-xs text-brand-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <Link href={reservationHref} className="text-brand transition hover:text-brand-accent">
            {site.cta.button} →
          </Link>
        </div>
      </div>
    </footer>
  );
}
