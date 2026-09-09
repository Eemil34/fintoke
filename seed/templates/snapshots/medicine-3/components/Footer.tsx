import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M10.5 4.5h3v6h6v3h-6v6h-3v-6h-6v-3h6z" />
              </svg>
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">{site.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">{site.footer}</p>
          <div className="mt-5 space-y-1 text-sm text-white/65">
            <p>{site.contact.address}</p>
            <p>{site.contact.phone}</p>
            <p>{site.contact.email}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-white/65">
            <li>
              <Link href="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/team" className="hover:text-white">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/appointment" className="hover:text-white">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Services</p>
          <ul className="mt-4 space-y-2 text-sm text-white/65">
            {site.features.slice(0, 3).map((feature) => (
              <li key={feature.title}>
                <Link href="/treatments" className="hover:text-white">
                  {feature.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Resources</p>
          <ul className="mt-4 space-y-2 text-sm text-white/65">
            <li>
              <Link href="/about" className="hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/appointment" className="hover:text-white">
                Help Center
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
