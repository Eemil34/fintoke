/**
 * Cursor CLI model definitions and helpers.
 *
 * Cursor Agent only accepts models the current account can actually run.
 * This CLI reports: auto, gpt-5.3-codex. Legacy Claudable IDs (gpt-5, sonnet-4)
 * are mapped onto those so existing projects keep working.
 */

export interface CursorModelDefinition {
  id: string;
  name: string;
  description?: string;
  supportsImages?: boolean;
}

export const CURSOR_DEFAULT_MODEL = 'auto';

export const CURSOR_MODEL_DEFINITIONS: CursorModelDefinition[] = [
  {
    id: 'auto',
    name: 'Auto',
    description: 'Cursor Agent default router (picks the best available model)',
  },
  {
    id: 'gpt-5.3-codex',
    name: 'GPT-5.3 Codex',
    description: 'OpenAI Codex model via Cursor Agent',
  },
];

const CURSOR_MODEL_ALIASES: Record<string, string> = {
  'gpt5': 'auto',
  'gpt-5': 'auto',
  'gpt-5.0': 'auto',
  'sonnet4': 'auto',
  'sonnet-4': 'auto',
  'sonnet-4-thinking': 'auto',
  'sonnet-4.5': 'auto',
  'sonnet-45': 'auto',
  'claude-sonnet-4.5': 'auto',
  'claude-sonnet-45': 'auto',
  'claude-sonnet-4_5': 'auto',
  'claude-sonnet-4': 'auto',
  'sonnet-4.0-thinking': 'auto',
  'claude-sonnet-4-thinking': 'auto',
  'opus-4.6': 'auto',
  'opus-4.1': 'auto',
  'claude-opus-4.6': 'auto',
  'claude-opus-4.1': 'auto',
  'claude-opus-46': 'auto',
  'claude-opus-41': 'auto',
  'claude-opus-4_6': 'auto',
  'claude-opus-4_1': 'auto',
};

const KNOWN_CURSOR_MODEL_IDS = new Set(CURSOR_MODEL_DEFINITIONS.map((model) => model.id));

const CURSOR_CLI_MODEL_IDS: Record<string, string> = {
  auto: 'auto',
  'gpt-5.3-codex': 'gpt-5.3-codex',
};

export function normalizeCursorModelId(model?: string | null): string {
  if (!model || typeof model !== 'string') {
    return CURSOR_DEFAULT_MODEL;
  }

  const trimmed = model.trim();
  if (!trimmed) {
    return CURSOR_DEFAULT_MODEL;
  }

  const lowered = trimmed.toLowerCase();
  if (CURSOR_MODEL_ALIASES[lowered]) {
    return CURSOR_MODEL_ALIASES[lowered];
  }

  if (KNOWN_CURSOR_MODEL_IDS.has(lowered)) {
    return lowered;
  }

  if (KNOWN_CURSOR_MODEL_IDS.has(trimmed)) {
    return trimmed;
  }

  return CURSOR_DEFAULT_MODEL;
}

export function getCursorModelDisplayName(id?: string | null): string {
  if (!id) {
    return (
      CURSOR_MODEL_DEFINITIONS.find((model) => model.id === CURSOR_DEFAULT_MODEL)?.name ??
      CURSOR_DEFAULT_MODEL
    );
  }

  const normalized = normalizeCursorModelId(id);
  const match = CURSOR_MODEL_DEFINITIONS.find((model) => model.id === normalized);
  return match?.name ?? normalized;
}

export function resolveCursorCliModelId(modelId?: string | null): string {
  const normalized = normalizeCursorModelId(modelId);
  return CURSOR_CLI_MODEL_IDS[normalized] ?? CURSOR_DEFAULT_MODEL;
}
