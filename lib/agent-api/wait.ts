import { getActiveRequests } from '@/lib/services/user-requests';

export async function waitForSiteIdle(projectId: string, timeoutMs = 10 * 60 * 1000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const active = await getActiveRequests(projectId);
    if (!active.hasActiveRequests) return true;
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  return false;
}
