'use client';

import { useMemo, useState } from 'react';
import {
  TEMPLATE_CATEGORIES,
  WEBSITE_TEMPLATES,
  type TemplateCategoryId,
  type WebsiteTemplate,
} from '@/lib/templates';

interface TemplatePickerProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  suggestedId?: string | null;
  disabled?: boolean;
  templates?: WebsiteTemplate[];
}

function templateKind(template: WebsiteTemplate): string | undefined {
  return (template as WebsiteTemplate & { kind?: string }).kind;
}

function TemplateCard({
  template,
  selected,
  suggested,
  onSelect,
  disabled,
}: {
  template: WebsiteTemplate;
  selected: boolean;
  suggested: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group flex w-[168px] shrink-0 flex-col overflow-hidden rounded-2xl border text-left transition ${
        selected
          ? 'border-gray-900 ring-2 ring-gray-900/10'
          : 'border-gray-200 hover:border-gray-300'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div
        className="relative h-24 w-full p-3"
        style={{ background: template.theme.background }}
      >
        <div
          className="absolute inset-x-4 top-4 h-3 rounded-full opacity-90"
          style={{ background: template.theme.primary }}
        />
        <div
          className="absolute bottom-4 left-4 right-8 h-10 rounded-md"
          style={{ background: template.theme.surface, border: `1px solid ${template.theme.primary}33` }}
        />
        <div
          className="absolute bottom-6 right-6 h-6 w-6 rounded-full"
          style={{ background: template.theme.accent }}
        />
        {suggested && !selected ? (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
            Suggested
          </span>
        ) : null}
        {templateKind(template) === 'snapshot' ? (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
            Saved
          </span>
        ) : null}
      </div>
      <div className="bg-white px-3 py-2.5">
        <p className="truncate text-sm font-medium text-gray-900">{template.name}</p>
        <p className="truncate text-xs text-gray-500">{template.niche}</p>
      </div>
    </button>
  );
}

export default function TemplatePicker({
  selectedId,
  onSelect,
  suggestedId,
  disabled,
  templates: templatesProp,
}: TemplatePickerProps) {
  const [category, setCategory] = useState<TemplateCategoryId | 'all'>('all');
  const catalog = templatesProp?.length ? templatesProp : WEBSITE_TEMPLATES;

  const templates = useMemo(
    () =>
      catalog.filter(
        (template) => category === 'all' || template.category === category,
      ),
    [catalog, category],
  );

  const selected = selectedId
    ? catalog.find((template) => template.id === selectedId)
    : null;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-gray-900">Starting style</h2>
          <p className="text-xs text-gray-500">
            Pick an approximate look. The agent will rewrite it to match your prompt.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            selectedId === null
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          Start blank
        </button>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {TEMPLATE_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => setCategory(item.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
              category === item.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedId === template.id}
            suggested={suggestedId === template.id}
            disabled={disabled}
            onSelect={() => onSelect(template.id)}
          />
        ))}
      </div>

      {selected ? (
        <p className="mt-2 text-xs text-gray-500">
          Using <span className="font-medium text-gray-700">{selected.name}</span>
          {' — '}
          {selected.description}
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400">
          No template selected. The agent will generate a site from scratch.
        </p>
      )}
    </div>
  );
}
