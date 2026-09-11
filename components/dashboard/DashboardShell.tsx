'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import PersistenceBanner from '@/components/PersistenceBanner';
import {
  Building2,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Menu,
  Plus,
  Settings,
  Table2,
  Users,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/sites', label: 'Sites', icon: Globe },
  { href: '/dashboard/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
  { href: '/dashboard/work', label: 'Work', icon: Table2 },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/clients', label: 'Clients', icon: Building2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/dashboard';
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-[#DE7356]/10 text-[#c95940]'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-[100dvh] bg-[#f4f3f0] text-gray-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
          <Image
            src="/fintoke-icon.png"
            alt="Fintoke"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">Fintoke</p>
            <p className="truncate text-xs text-gray-500">Workspace</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-gray-200 p-3">
          <Link
            href="/studio"
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus size={16} />
            New site
          </Link>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <p className="text-sm font-semibold">Workspace</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {nav}
            <div className="border-t border-gray-200 p-3">
              <Link
                href="/studio"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-medium text-white"
              >
                <Plus size={16} />
                New site
              </Link>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-semibold">Workspace</p>
          <Link href="/studio" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="New site">
            <Plus size={18} />
          </Link>
        </div>
        <PersistenceBanner />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
