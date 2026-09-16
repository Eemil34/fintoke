'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { fetchDashboardJson } from '@/lib/dashboard/client';

export default function EditWithCursorButton({
  templateId,
  className,
  label = 'Edit with Cursor',
}: {
  templateId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await fetchDashboardJson<{ projectId: string }>(`/api/templates/${templateId}/edit`, {
        method: 'POST',
      });
      router.push(`/${result.projectId}/chat`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open template');
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={busy}
        onClick={() => void open()}
        className={
          className ||
          'inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
        }
      >
        <Pencil size={12} />
        {busy ? 'Opening…' : label}
      </button>
      {error ? <span className="mt-1 text-[11px] text-red-600">{error}</span> : null}
    </span>
  );
}
