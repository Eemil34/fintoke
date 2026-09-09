import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="bg-brand-deep text-teal-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold text-white">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-teal-100/75">{site.footer}</p>
          <p className="mt-4 text-sm text-teal-100/90">{site.contact.address}</p>
          <p className="mt-1 text-sm text-teal-100/90">{site.contact.phone}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-100/70">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-100/70">Care Desk</p>
          <p className="mt-4 text-sm leading-6 text-teal-100/80">{site.contact.hours}</p>
          <a href={`mailto:${site.contact.email}`} className="mt-3 block text-sm hover:text-white">
            {site.contact.email}
          </a>
          <Link
            href="/appointment"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-teal-50"
          >
            Make An Appointment
          </Link>
        </div>
      </div>
    </footer>
  );
}
