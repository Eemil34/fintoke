'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDashboardJson } from '@/lib/dashboard/client';
import type { ManagedTemplate } from '@/lib/templates';

function asManaged(templates: ManagedTemplate[]): ManagedTemplate[] {
  return templates;
}

const FALLBACK: ManagedTemplate[] = [];

export function useTemplates() {
  const [templates, setTemplates] = useState<ManagedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchDashboardJson<ManagedTemplate[]>('/api/templates');
      setTemplates(asManaged(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      setTemplates((current) => (current.length > 0 ? current : FALLBACK));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byId = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates],
  );

  return { templates, byId, loading, error, reload: load };
}
