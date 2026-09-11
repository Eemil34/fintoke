'use client';

import { useEffect, useState } from 'react';

type Persistence = {
  volumeMounted?: boolean;
  railwayVolumeMountPath?: string | null;
  volumeSince?: string | null;
};

export default function PersistenceBanner() {
  const [persistence, setPersistence] = useState<Persistence | null>(null);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => setPersistence(payload?.persistence || null))
      .catch(() => undefined);
  }, []);

  if (!persistence || persistence.volumeMounted) return null;

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-semibold">Sites, users, emails, and keys will vanish on the next deploy.</p>
      <p className="mt-1">
        This server has no Railway Volume. In Railway open this service → <span className="font-medium">Volumes</span> →
        add a volume with mount path <code className="rounded bg-white px-1">/app/data</code>
        (or keep Railway’s <code className="rounded bg-white px-1">RAILWAY_VOLUME_MOUNT_PATH</code>).
        Then deploy once. Work saved before this will not come back.
      </p>
    </div>
  );
}
