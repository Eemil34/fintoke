'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import GlobalSettings from '@/components/settings/GlobalSettings';

function SettingsBody() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');
  const initialTab =
    tab === 'general' || tab === 'ai-agents' || tab === 'services' || tab === 'api-keys' || tab === 'about'
      ? tab
      : 'ai-agents';

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col px-6 py-8">
      <DashboardPageHeader
        title="Settings"
        description="Connect Claude Code, Cursor Agent, publishing services, and Claude API keys."
      />
      <div className="min-h-0 flex-1">
        <GlobalSettings variant="page" isOpen initialTab={initialTab} />
      </div>
    </div>
  );
}

export default function DashboardSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-8 text-sm text-gray-500">Loading settings…</div>
      }
    >
      <SettingsBody />
    </Suspense>
  );
}
