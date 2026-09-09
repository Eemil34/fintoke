import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-brand-fg/10 bg-brand-bg">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl">{site.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-brand-muted">{site.description}</p>
          <div className="mt-6 flex gap-4 text-sm text-brand-muted">
            <a href="https://facebook.com" className="hover:text-brand-fg" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://instagram.com" className="hover:text-brand-fg" aria-label="Instagram">
              Instagram
            </a>
          </div>
        </div>
        <div>
          <ul className="space-y-3 text-sm">
            {site.footerLinks.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link href={item.href} className="text-brand-muted transition hover:text-brand-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm text-brand-muted">
          <p>{site.contact.address}</p>
          <p>
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="hover:text-brand-fg">
              {site.contact.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${site.contact.email}`} className="hover:text-brand-fg">
              {site.contact.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-brand-fg/10 px-5 py-6">
        <p className="mx-auto max-w-6xl text-xs text-brand-muted">{site.footer}</p>
      </div>
    </footer>
  );
}
