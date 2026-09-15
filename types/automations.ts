export type AutomationKind = 'generate_work' | 'enrich_empty';
export type AutomationStatus = 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';

export interface AutomationRun {
  at: string;
  ok: boolean;
  summary: string;
}

export interface WorkspaceAutomation {
  id: string;
  name: string;
  kind: AutomationKind;
  prompt: string;
  count: number;
  city: string;
  country: string;
  businessKind: string;
  repeatTotal: number;
  intervalMinutes: number;
  windowStart: string;
  windowEnd: string;
  status: AutomationStatus;
  runCount: number;
  nextRunAt: string | null;
  lastRunAt: string | null;
  lastError: string;
  runs: AutomationRun[];
  createdAt: string;
  updatedAt: string;
}

export type AutomationInput = Partial<
  Omit<WorkspaceAutomation, 'id' | 'createdAt' | 'updatedAt' | 'runs' | 'runCount'>
> & {
  name?: string;
  prompt?: string;
};
