'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TemplatePreview from '@/components/dashboard/TemplatePreview';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_FONTS,
  TEMPLATE_LAYOUTS,
  TEMPLATE_PAGE_KINDS,
  TEMPLATE_RADIUS,
  type TemplateCategoryId,
  type TemplatePageKind,
  type WebsiteTemplate,
} from '@/lib/templates';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400';

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClass} resize-y`}
    />
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.length === 7 ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 bg-white p-0.5"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </div>
    </Field>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
      aria-label={label}
    >
      <Trash2 size={14} />
    </button>
  );
}

export default function TemplateEditor({
  value,
  onChange,
}: {
  value: WebsiteTemplate;
  onChange: (next: WebsiteTemplate) => void;
}) {
  const [section, setSection] = useState<'content' | 'look'>('content');
  const categories = useMemo(
    () => TEMPLATE_CATEGORIES.filter((item) => item.id !== 'all') as { id: TemplateCategoryId; label: string }[],
    [],
  );

  const patch = (next: Partial<WebsiteTemplate>) => onChange({ ...value, ...next });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
      <div className="space-y-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSection('content')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              section === 'content' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setSection('look')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              section === 'look' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
            }`}
          >
            Look & colors
          </button>
        </div>

        {section === 'look' ? (
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Layout">
                <select
                  value={value.layout}
                  onChange={(event) => patch({ layout: event.target.value as WebsiteTemplate['layout'] })}
                  className={inputClass}
                >
                  {TEMPLATE_LAYOUTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mode">
                <select
                  value={value.theme.mode}
                  onChange={(event) =>
                    patch({ theme: { ...value.theme, mode: event.target.value === 'dark' ? 'dark' : 'light' } })
                  }
                  className={inputClass}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>
              <Field label="Font">
                <select
                  value={value.theme.font}
                  onChange={(event) =>
                    patch({ theme: { ...value.theme, font: event.target.value as WebsiteTemplate['theme']['font'] } })
                  }
                  className={inputClass}
                >
                  {TEMPLATE_FONTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Corners">
                <select
                  value={value.theme.radius}
                  onChange={(event) =>
                    patch({
                      theme: { ...value.theme, radius: event.target.value as WebsiteTemplate['theme']['radius'] },
                    })
                  }
                  className={inputClass}
                >
                  {TEMPLATE_RADIUS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField
                label="Primary"
                value={value.theme.primary}
                onChange={(primary) => patch({ theme: { ...value.theme, primary } })}
              />
              <ColorField
                label="Accent"
                value={value.theme.accent}
                onChange={(accent) => patch({ theme: { ...value.theme, accent } })}
              />
              <ColorField
                label="Background"
                value={value.theme.background}
                onChange={(background) => patch({ theme: { ...value.theme, background } })}
              />
              <ColorField
                label="Surface"
                value={value.theme.surface}
                onChange={(surface) => patch({ theme: { ...value.theme, surface } })}
              />
              <ColorField
                label="Text"
                value={value.theme.text}
                onChange={(text) => patch({ theme: { ...value.theme, text } })}
              />
              <ColorField
                label="Muted"
                value={value.theme.muted}
                onChange={(muted) => patch({ theme: { ...value.theme, muted } })}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Template</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <TextInput value={value.name} onChange={(name) => patch({ name })} />
                </Field>
                <Field label="Niche">
                  <TextInput value={value.niche} onChange={(niche) => patch({ niche })} />
                </Field>
                <Field label="Category">
                  <select
                    value={value.category}
                    onChange={(event) => patch({ category: event.target.value as TemplateCategoryId })}
                    className={inputClass}
                  >
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Keywords">
                  <TextInput
                    value={value.keywords.join(', ')}
                    onChange={(text) =>
                      patch({
                        keywords: text
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="restaurant, cafe, booking"
                  />
                </Field>
              </div>
              <Field label="Description">
                <TextArea value={value.description} onChange={(description) => patch({ description })} />
              </Field>
            </section>

            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Brand</h2>
              <Field label="Brand name">
                <TextInput
                  value={value.brand.name}
                  onChange={(name) => patch({ brand: { ...value.brand, name } })}
                />
              </Field>
              <Field label="Tagline">
                <TextInput
                  value={value.brand.tagline}
                  onChange={(tagline) => patch({ brand: { ...value.brand, tagline } })}
                />
              </Field>
              <Field label="About">
                <TextArea
                  value={value.brand.description}
                  onChange={(description) => patch({ brand: { ...value.brand, description } })}
                />
              </Field>
            </section>

            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Hero</h2>
              <Field label="Eyebrow">
                <TextInput
                  value={value.hero.eyebrow}
                  onChange={(eyebrow) => patch({ hero: { ...value.hero, eyebrow } })}
                />
              </Field>
              <Field label="Headline">
                <TextArea
                  rows={2}
                  value={value.hero.title}
                  onChange={(title) => patch({ hero: { ...value.hero, title } })}
                />
              </Field>
              <Field label="Subtitle">
                <TextArea
                  value={value.hero.subtitle}
                  onChange={(subtitle) => patch({ hero: { ...value.hero, subtitle } })}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Primary button">
                  <TextInput value={value.hero.cta} onChange={(cta) => patch({ hero: { ...value.hero, cta } })} />
                </Field>
                <Field label="Secondary button">
                  <TextInput
                    value={value.hero.ctaSecondary ?? ''}
                    onChange={(ctaSecondary) =>
                      patch({ hero: { ...value.hero, ctaSecondary: ctaSecondary || undefined } })
                    }
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Stats</h2>
                <AddButton
                  label="Add stat"
                  onClick={() => patch({ stats: [...value.stats, { value: '0', label: 'New stat' }] })}
                />
              </div>
              {value.stats.map((stat, index) => (
                <div key={`stat-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <TextInput
                    value={stat.value}
                    onChange={(nextValue) => {
                      const stats = [...value.stats];
                      stats[index] = { ...stat, value: nextValue };
                      patch({ stats });
                    }}
                  />
                  <TextInput
                    value={stat.label}
                    onChange={(label) => {
                      const stats = [...value.stats];
                      stats[index] = { ...stat, label };
                      patch({ stats });
                    }}
                  />
                  <RemoveButton
                    label="Remove stat"
                    onClick={() => patch({ stats: value.stats.filter((_, itemIndex) => itemIndex !== index) })}
                  />
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Features</h2>
                <AddButton
                  label="Add feature"
                  onClick={() => patch({ features: [...value.features, { title: 'New feature', body: '' }] })}
                />
              </div>
              {value.features.map((feature, index) => (
                <div key={`feature-${index}`} className="rounded-xl border border-gray-100 p-3">
                  <div className="mb-2 flex justify-end">
                    <RemoveButton
                      label="Remove feature"
                      onClick={() => patch({ features: value.features.filter((_, itemIndex) => itemIndex !== index) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <TextInput
                      value={feature.title}
                      onChange={(title) => {
                        const features = [...value.features];
                        features[index] = { ...feature, title };
                        patch({ features });
                      }}
                    />
                    <TextArea
                      rows={2}
                      value={feature.body}
                      onChange={(body) => {
                        const features = [...value.features];
                        features[index] = { ...feature, body };
                        patch({ features });
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Testimonials</h2>
                <AddButton
                  label="Add quote"
                  onClick={() =>
                    patch({ testimonials: [...value.testimonials, { quote: '', name: '', role: '' }] })
                  }
                />
              </div>
              {value.testimonials.map((item, index) => (
                <div key={`quote-${index}`} className="space-y-2 rounded-xl border border-gray-100 p-3">
                  <div className="flex justify-end">
                    <RemoveButton
                      label="Remove testimonial"
                      onClick={() =>
                        patch({ testimonials: value.testimonials.filter((_, itemIndex) => itemIndex !== index) })
                      }
                    />
                  </div>
                  <TextArea
                    rows={2}
                    value={item.quote}
                    onChange={(quote) => {
                      const testimonials = [...value.testimonials];
                      testimonials[index] = { ...item, quote };
                      patch({ testimonials });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      value={item.name}
                      onChange={(name) => {
                        const testimonials = [...value.testimonials];
                        testimonials[index] = { ...item, name };
                        patch({ testimonials });
                      }}
                    />
                    <TextInput
                      value={item.role ?? ''}
                      onChange={(role) => {
                        const testimonials = [...value.testimonials];
                        testimonials[index] = { ...item, role };
                        patch({ testimonials });
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pricing</h2>
                <AddButton
                  label="Add plan"
                  onClick={() =>
                    patch({
                      pricing: [
                        ...value.pricing,
                        { name: 'Plan', price: '$0', period: '', features: [], highlighted: false },
                      ],
                    })
                  }
                />
              </div>
              {value.pricing.map((plan, index) => (
                <div key={`plan-${index}`} className="space-y-2 rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={Boolean(plan.highlighted)}
                        onChange={(event) => {
                          const pricing = [...value.pricing];
                          pricing[index] = { ...plan, highlighted: event.target.checked };
                          patch({ pricing });
                        }}
                      />
                      Highlighted
                    </label>
                    <RemoveButton
                      label="Remove plan"
                      onClick={() => patch({ pricing: value.pricing.filter((_, itemIndex) => itemIndex !== index) })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput
                      value={plan.name}
                      onChange={(name) => {
                        const pricing = [...value.pricing];
                        pricing[index] = { ...plan, name };
                        patch({ pricing });
                      }}
                    />
                    <TextInput
                      value={plan.price}
                      onChange={(price) => {
                        const pricing = [...value.pricing];
                        pricing[index] = { ...plan, price };
                        patch({ pricing });
                      }}
                    />
                    <TextInput
                      value={plan.period ?? ''}
                      onChange={(period) => {
                        const pricing = [...value.pricing];
                        pricing[index] = { ...plan, period };
                        patch({ pricing });
                      }}
                    />
                  </div>
                  <TextArea
                    rows={3}
                    value={plan.features.join('\n')}
                    onChange={(text) => {
                      const pricing = [...value.pricing];
                      pricing[index] = {
                        ...plan,
                        features: text
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean),
                      };
                      patch({ pricing });
                    }}
                  />
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Team</h2>
                <AddButton
                  label="Add person"
                  onClick={() => patch({ team: [...value.team, { name: '', role: '', bio: '' }] })}
                />
              </div>
              {value.team.map((person, index) => (
                <div key={`person-${index}`} className="space-y-2 rounded-xl border border-gray-100 p-3">
                  <div className="flex justify-end">
                    <RemoveButton
                      label="Remove person"
                      onClick={() => patch({ team: value.team.filter((_, itemIndex) => itemIndex !== index) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      value={person.name}
                      onChange={(name) => {
                        const team = [...value.team];
                        team[index] = { ...person, name };
                        patch({ team });
                      }}
                    />
                    <TextInput
                      value={person.role}
                      onChange={(role) => {
                        const team = [...value.team];
                        team[index] = { ...person, role };
                        patch({ team });
                      }}
                    />
                  </div>
                  <TextArea
                    rows={2}
                    value={person.bio}
                    onChange={(bio) => {
                      const team = [...value.team];
                      team[index] = { ...person, bio };
                      patch({ team });
                    }}
                  />
                </div>
              ))}
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pages</h2>
                <AddButton
                  label="Add page"
                  onClick={() =>
                    patch({
                      pages: [
                        ...value.pages,
                        { slug: 'page', label: 'Page', kind: 'list', title: 'Page', subtitle: '', items: [] },
                      ],
                    })
                  }
                />
              </div>
              {value.pages.map((page, index) => (
                <div key={`page-${index}`} className="space-y-2 rounded-xl border border-gray-100 p-3">
                  <div className="flex justify-end">
                    <RemoveButton
                      label="Remove page"
                      onClick={() => patch({ pages: value.pages.filter((_, itemIndex) => itemIndex !== index) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      value={page.label}
                      onChange={(label) => {
                        const pages = [...value.pages];
                        pages[index] = { ...page, label };
                        patch({ pages });
                      }}
                    />
                    <TextInput
                      value={page.slug}
                      onChange={(slug) => {
                        const pages = [...value.pages];
                        pages[index] = { ...page, slug };
                        patch({ pages });
                      }}
                    />
                    <select
                      value={page.kind}
                      onChange={(event) => {
                        const pages = [...value.pages];
                        pages[index] = { ...page, kind: event.target.value as TemplatePageKind };
                        patch({ pages });
                      }}
                      className={inputClass}
                    >
                      {TEMPLATE_PAGE_KINDS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <TextInput
                      value={page.title}
                      onChange={(title) => {
                        const pages = [...value.pages];
                        pages[index] = { ...page, title };
                        patch({ pages });
                      }}
                    />
                  </div>
                  <TextArea
                    rows={2}
                    value={page.subtitle}
                    onChange={(subtitle) => {
                      const pages = [...value.pages];
                      pages[index] = { ...page, subtitle };
                      patch({ pages });
                    }}
                  />
                  <TextArea
                    rows={4}
                    value={(page.items ?? [])
                      .map((item) => [item.title, item.body].filter(Boolean).join(' — '))
                      .join('\n')}
                    onChange={(text) => {
                      const pages = [...value.pages];
                      pages[index] = {
                        ...page,
                        items: text
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line) => {
                            const [title, ...rest] = line.split(' — ');
                            return { title: title.trim(), body: rest.join(' — ').trim() };
                          }),
                      };
                      patch({ pages });
                    }}
                  />
                  <p className="text-[11px] text-gray-400">One item per line, as “Title — body”.</p>
                </div>
              ))}
            </section>

            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Closing</h2>
              <Field label="CTA title">
                <TextInput value={value.cta.title} onChange={(title) => patch({ cta: { ...value.cta, title } })} />
              </Field>
              <Field label="CTA subtitle">
                <TextArea
                  value={value.cta.subtitle}
                  onChange={(subtitle) => patch({ cta: { ...value.cta, subtitle } })}
                />
              </Field>
              <Field label="CTA button">
                <TextInput value={value.cta.button} onChange={(button) => patch({ cta: { ...value.cta, button } })} />
              </Field>
              <Field label="Footer">
                <TextArea value={value.footer} onChange={(footer) => patch({ footer })} rows={2} />
              </Field>
            </section>
          </>
        )}
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Live preview</p>
        <TemplatePreview template={value} />
      </div>
    </div>
  );
}
